// Author: Phuoc Hoang Minh Nguyen
// Description: Showing Doctors and Pharmacists who have access to user's information.
// Status: Optimized

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Background from '../../components/Background';

var tempAvatar = require('../../assets/images/tempAvatar.png');

class DoctorScreen extends Component {
  state = {
    accessedDoctor: [],
    accessedPharmacist: [],
    loading: true,
  };

  unsubscribers = [];
  doctorUnsubs = [];
  pharmacistUnsubs = [];
  doctorChunkResults = {};
  pharmacistChunkResults = {};

  // Split an array into chunks of at most maxSize to work around the
  // Firestore 'in' query limit of 30 elements.
  chunkArray = (arr, maxSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += maxSize) {
      chunks.push(arr.slice(i, i + maxSize));
    }
    return chunks;
  };

  componentDidMount() {
    // Subscribe to the user document to read doctorList and pharmacistList.
    // Unsubscribe and recreate the nested doctor/pharmacist listeners whenever
    // the list changes, preventing listener accumulation.
    this.unsubscribers.push(
      firestore()
        .collection('users')
        .doc((auth().currentUser || {}).uid)
        .onSnapshot(documentSnapshot => {
          if (this.state.loading) {
            this.setState({ loading: false });
          }
          if (!documentSnapshot.exists()) {
            return;
          }
          const tempDoctorEmail = documentSnapshot.data().doctorList;
          const tempPharmacistEmail = documentSnapshot.data().pharmacistList;

          if (!tempDoctorEmail && !tempPharmacistEmail) {
            return;
          }

          if (tempDoctorEmail && tempDoctorEmail.length > 0) {
            this.doctorUnsubs.forEach(u => u());
            this.doctorUnsubs = [];
            this.doctorChunkResults = {};
            const doctorChunks = this.chunkArray(tempDoctorEmail, 30);
            doctorChunks.forEach((chunk, index) => {
              const unsub = firestore()
                .collection('doctor')
                .where('doctorEmail', 'in', chunk)
                .onSnapshot(querySnapshot => {
                  const results = [];
                  querySnapshot.forEach(doc => {
                    results.push({
                      ...doc.data(),
                      key: doc.id,
                      type: 'Doctor',
                    });
                  });
                  this.doctorChunkResults[index] = results;
                  const merged = Object.values(this.doctorChunkResults).flat();
                  this.setState({ accessedDoctor: merged });
                });
              this.doctorUnsubs.push(unsub);
            });
          }

          if (tempPharmacistEmail && tempPharmacistEmail.length > 0) {
            this.pharmacistUnsubs.forEach(u => u());
            this.pharmacistUnsubs = [];
            this.pharmacistChunkResults = {};
            const pharmacistChunks = this.chunkArray(tempPharmacistEmail, 30);
            pharmacistChunks.forEach((chunk, index) => {
              const unsub = firestore()
                .collection('pharmacist')
                .where('pharmacistEmail', 'in', chunk)
                .onSnapshot(querySnapshot => {
                  const results = [];
                  querySnapshot.forEach(doc => {
                    results.push({
                      ...doc.data(),
                      key: doc.id,
                      type: 'Pharmacist',
                    });
                  });
                  this.pharmacistChunkResults[index] = results;
                  const merged = Object.values(
                    this.pharmacistChunkResults,
                  ).flat();
                  this.setState({ accessedPharmacist: merged });
                });
              this.pharmacistUnsubs.push(unsub);
            });
          }
        }),
    );
  }

  componentWillUnmount() {
    this.unsubscribers.forEach(unsub => unsub());
    this.doctorUnsubs.forEach(u => u());
    this.pharmacistUnsubs.forEach(u => u());
  }

  // When clicking on one doctor/ pharmacist item, navigate user to
  // that doctor/pharmacist information screen.
  handleClick = dataInfor => {
    this.props.navigation.navigate('AccessedDoctorScreen', dataInfor);
  };

  // Navigate user to a screen containing list of doctor/pharmacist
  // that do not have access to user's database.
  addAccess = () => {
    this.props.navigation.navigate('AddAccess');
  };

  // Render each doctor and pharmacist item.
  renderItem = item => {
    let emailInfo;
    if (item.type === 'Doctor') {
      emailInfo = item.doctorEmail;
    } else {
      emailInfo = item.pharmacistEmail;
    }
    let dataInfor = {
      avatar: item.avatar,
      name: item.name,
      type: item.type,
      email: emailInfo,
      id: item.key,
      address: item.address,
    };
    return (
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => this.handleClick(dataInfor)}
      >
        <Image
          style={styles.avatar}
          source={item.avatar ? { uri: item.avatar } : tempAvatar}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.type}</Text>
          <Text>Address: {item.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { loading } = this.state;
    let message;
    if (loading) {
      message = (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1565C0" />
        </View>
      );
      // If there is no accessed doctor and accessed pharmacist.
    } else if (
      this.state.accessedDoctor.length === 0 &&
      this.state.accessedPharmacist.length === 0
    ) {
      message = (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>You have no accessed doctor</Text>
          <Text style={styles.emptyText}>and accessed pharmacist</Text>
        </View>
      );
    } else {
      message = (
        <SectionList
          style={styles.feed}
          sections={[
            { title: 'Accessed Doctor', data: this.state.accessedDoctor },
            {
              title: 'Accessed Pharmacist',
              data: this.state.accessedPharmacist,
            },
          ]}
          keyExtractor={(item, index) => (item.email || item.key || '') + index}
          renderItem={({ item }) => this.renderItem(item)}
          renderSectionHeader={({ section: { title } }) => {
            if (title === 'Accessed Doctor') {
              return <Text style={styles.headerWhite}>{title}</Text>;
            } else {
              return <Text style={styles.header}>{title}</Text>;
            }
          }}
        />
      );
    }
    return (
      <View style={styles.container}>
        <Background />
        <Text style={styles.header1}>{'Doctors & Pharmacists'}</Text>
        <Text style={styles.header2}>
          {
            'Doctors and pharmacists who have accessed to your medication records'
          }
        </Text>
        {message}
        <TouchableOpacity style={styles.button} onPress={this.addAccess}>
          <Text style={styles.buttonText}>
            Give Access to Another Doctor/ Pharmacist
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 18,
    color: '#000',
  },
  headerWhite: {
    fontSize: 18,
    color: '#FFF',
  },
  title: {
    fontSize: 24,
  },
  feed: {
    marginTop: 26,
    marginHorizontal: 16,
  },
  feedItem: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    flexDirection: 'row',
    marginVertical: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    marginLeft: 8,
    alignSelf: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#454D65',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#1565C0',
    borderRadius: 4,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  emptyText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
  },
  header1: {
    color: '#FFF',
    marginHorizontal: 16,
    marginTop: -170,
    fontSize: 24,
  },
  header2: {
    color: '#FFF',
    marginHorizontal: 16,
  },
});

export default DoctorScreen;
