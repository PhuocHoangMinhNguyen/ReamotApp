// Author: Phuoc Hoang Minh Nguyen & Quang Duy Nguyen
// Description: HomeScreen show list of upcoming reminders
// and medication taking history for the day
// Status: Optimized

import React from 'react';
import {
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import Background from '../../components/Background';
import TreeImage from '../../components/TreeImage';

var tempAvatar = require('../../assets/images/tempAvatar.png');

class HomeScreen extends React.Component {
  state = {
    // Medicine info in "history" collection
    historymedicines: [],
    // Medicine info in "reminder" collection
    remindermedicines: [],
    missedMedicines: [],
    upcomingCount: 0,
    loading: true,
  };

  unsubscribers = [];
  medicineMap = new Map();

  componentDidMount() {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return;
    }
    const email = currentUser.email;
    const today = moment().format('MMMM Do YYYY');

    // Subscribe to medicine catalog once; update the Map on every change.
    this.unsubscribers.push(
      firestore()
        .collection('medicine')
        .onSnapshot(querySnapshot => {
          this.medicineMap = new Map();
          querySnapshot.forEach(doc => {
            this.medicineMap.set(doc.data().name, doc.data());
          });
        }),
    );

    // History listener — O(1) Map lookup instead of O(n) loop
    this.unsubscribers.push(
      firestore()
        .collection('history')
        .where('patientEmail', '==', email)
        .where('date', '==', today)
        .onSnapshot(querySnapshot => {
          let tempHistory = [];
          querySnapshot.forEach(documentSnapshot => {
            const med = this.medicineMap.get(documentSnapshot.data().medicine);
            if (med) {
              tempHistory.push({
                ...documentSnapshot.data(),
                barcode: med.barcode,
                description: med.description,
                image: med.image,
                key: documentSnapshot.id,
              });
            }
          });
          this.setState({ historymedicines: tempHistory, loading: false });
        }),
    );

    // Missed-history listener
    this.unsubscribers.push(
      firestore()
        .collection('history')
        .where('patientEmail', '==', email)
        .where('date', '==', today)
        .where('status', '==', 'missed')
        .onSnapshot(querySnapshot => {
          let tempMissed = [];
          querySnapshot.forEach(documentSnapshot => {
            const med = this.medicineMap.get(documentSnapshot.data().medicine);
            if (med) {
              tempMissed.push({
                ...documentSnapshot.data(),
                barcode: med.barcode,
                description: med.description,
                image: med.image,
                key: documentSnapshot.id,
              });
            }
          });
          this.setState({ missedMedicines: tempMissed });
        }),
    );

    // Reminder listener — also computes upcomingCount so render stays pure
    this.unsubscribers.push(
      firestore()
        .collection('reminder')
        .where('patientEmail', '==', email)
        .onSnapshot(querySnapshot => {
          let tempReminder = [];
          let upcomingCount = 0;
          const todayStr = new Date().toDateString();
          const now = Date.now();
          querySnapshot.forEach(documentSnapshot => {
            const med = this.medicineMap.get(documentSnapshot.data().medicine);
            if (med) {
              const item = {
                ...documentSnapshot.data(),
                barcode: med.barcode,
                description: med.description,
                image: med.image,
                key: documentSnapshot.id,
              };
              tempReminder.push(item);
              if (
                item.time &&
                item.time.toDate().toDateString() === todayStr &&
                item.time.toDate() >= now
              ) {
                upcomingCount++;
              }
            }
          });
          this.setState({ remindermedicines: tempReminder, upcomingCount });
        }),
    );
  }

  componentWillUnmount() {
    this.unsubscribers.forEach(unsub => unsub());
  }

  // Information appears on each item on "Upcoming Reminder" List
  renderReminder = item => {
    let dataInfor = {
      image: item.image,
      name: item.medicine,
      description: item.description,
    };

    if (
      item.time &&
      item.time.toDate().toDateString() == new Date().toDateString() &&
      item.time.toDate() >= Date.now()
    ) {
      return (
        <TouchableOpacity
          style={styles.feedItem}
          onPress={() => {
            this.props.navigation.navigate('MedicationInformation', dataInfor);
          }}
        >
          <FastImage
            style={styles.avatar}
            source={item.image ? { uri: item.image } : tempAvatar}
          />
          <Text style={styles.name}>{item.medicine}</Text>
          <Text style={styles.time}>
            {moment(item.time.toDate()).format('hh:mm a')}
          </Text>
        </TouchableOpacity>
      );
    } else {
      // Blank Text so the List can be processed normally
      return <Text />;
    }
  };

  // Information appears on each item on "Medicines Taken" List
  renderHistory = item => {
    let dataInfor = {
      image: item.image,
      name: item.medicine,
      description: item.description,
    };

    return (
      <TouchableOpacity
        style={item.status == 'taken' ? styles.feedTaken : styles.feedMissed}
        onPress={() => {
          this.props.navigation.navigate('MedicationInformation', dataInfor);
        }}
      >
        <FastImage
          style={styles.avatar}
          source={item.image ? { uri: item.image } : tempAvatar}
        />
        <Text
          style={item.status == 'taken' ? styles.nameTaken : styles.nameMissed}
        >
          {item.medicine}
        </Text>
        <Text
          style={item.status == 'taken' ? styles.timeTaken : styles.timeMissed}
        >
          {item.startTime
            ? moment(item.startTime.toDate()).format('hh:mm a')
            : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    const {
      historymedicines,
      missedMedicines,
      remindermedicines,
      upcomingCount,
      loading,
    } = this.state;

    if (loading) {
      return (
        <View
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <ActivityIndicator size="large" color="#1565C0" />
        </View>
      );
    }
    // Determine Image Chosen to be shown, based on the value below.
    const rawValue =
      ((historymedicines.length - missedMedicines.length) * 100) /
      (upcomingCount + historymedicines.length);
    const value = isNaN(rawValue) || !isFinite(rawValue) ? 0 : rawValue;

    // If 2 lists ("Medicines Taken" and "Upcoming Reminders" are blanks)
    if (historymedicines.length == 0 && remindermedicines.length == 0) {
      return (
        <View style={styles.container}>
          <Background style={styles.container} />
          <TreeImage value={value} />
          <View
            style={{
              flex: 1,
              marginTop: -150,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.emptyText}>You have no active reminder</Text>
            <Text>Please add a medicine,</Text>
            <Text>or contact your doctor for a prescription</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Background />
        <TreeImage value={value} />
        <View style={{ flex: 1 }}>
          <View style={styles.chapterView}>
            <Text style={styles.chapter}>Medicines Taken</Text>
          </View>
          <FlatList
            removeClippedSubviews={true}
            style={styles.feed}
            data={historymedicines}
            renderItem={({ item }) => this.renderHistory(item)}
            keyExtractor={item => item.key}
            horizontal={true}
          />
          <View style={styles.chapterView}>
            <Text style={styles.chapter}>Upcoming Reminders</Text>
          </View>
          <FlatList
            removeClippedSubviews={true}
            style={styles.feed}
            data={remindermedicines}
            renderItem={({ item }) => this.renderReminder(item)}
            keyExtractor={item => item.key}
            horizontal={true}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  feed: {
    marginHorizontal: 8,
  },
  feedItem: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 7,
    margin: 4,
    width: 115,
    marginVertical: 8,
    flexDirection: 'column',
    borderWidth: 1,
  },
  feedTaken: {
    backgroundColor: '#004481',
    borderRadius: 10,
    padding: 7,
    margin: 4,
    width: 115,
    marginVertical: 8,
    flexDirection: 'column',
    borderWidth: 1,
  },
  feedMissed: {
    backgroundColor: '#FF0000',
    borderRadius: 10,
    padding: 7,
    margin: 4,
    width: 115,
    marginVertical: 8,
    flexDirection: 'column',
    borderWidth: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  nameMissed: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  nameTaken: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  time: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  timeTaken: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  timeMissed: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
  },
  emptyText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  titleView: {
    marginTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#FFF',
  },
  chapterView: {
    marginVertical: 6,
    marginLeft: 12,
  },
  chapter: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
