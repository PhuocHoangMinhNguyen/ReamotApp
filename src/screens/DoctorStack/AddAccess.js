// Author: Phuoc Hoang Minh Nguyen
// Description: Choose a doctor/pharmacist to give him/her access to user medical details.
// Status: In development

import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

var tempAvatar = require('../../assets/images/tempAvatar.png');

class AddAccess extends React.Component {
  state = {
    loading: true,
    doc_phar: [],
    text: '',
    myArray: [],
  };

  unsubscribe2 = null;
  unsubscribe3 = null;

  componentDidMount() {
    // Fetch the user's existing access lists once — no real-time updates needed.
    firestore()
      .collection('users')
      .doc((auth().currentUser || {}).uid)
      .get()
      .then(doc => {
        const data = doc.exists() ? doc.data() : {};
        const tempDoctorEmail = data.doctorList || [];
        const tempPharmacistEmail = data.pharmacistList || [];

        // Separate arrays reset on every snapshot to prevent duplicate accumulation.
        let doctors = [];
        let pharmacists = [];

        const updateState = () => {
          const combined = [...doctors, ...pharmacists];
          this.setState({
            doc_phar: combined,
            myArray: combined,
            loading: false,
          });
        };

        this.unsubscribe2 = firestore()
          .collection('doctor')
          .onSnapshot(querySnapshot => {
            doctors = [];
            querySnapshot.forEach(documentSnapshot => {
              if (
                !tempDoctorEmail.includes(documentSnapshot.data().doctorEmail)
              ) {
                doctors.push({
                  ...documentSnapshot.data(),
                  key: documentSnapshot.id,
                  type: 'Doctor',
                });
              }
            });
            updateState();
          });

        this.unsubscribe3 = firestore()
          .collection('pharmacist')
          .onSnapshot(querySnapshot => {
            pharmacists = [];
            querySnapshot.forEach(documentSnapshot => {
              if (
                !tempPharmacistEmail.includes(
                  documentSnapshot.data().pharmacistEmail,
                )
              ) {
                pharmacists.push({
                  ...documentSnapshot.data(),
                  key: documentSnapshot.id,
                  type: 'Pharmacist',
                });
              }
            });
            updateState();
          });
      });
  }

  componentWillUnmount() {
    if (this.unsubscribe2) {
      this.unsubscribe2();
    }
    if (this.unsubscribe3) {
      this.unsubscribe3();
    }
  }

  // Click on each item in flatlist will lead user to DoctorInfoScreen
  // to show that doctor/pharmacist information with some options.
  handleClick = dataInfor => {
    this.props.navigation.navigate('DoctorInfoScreen', dataInfor);
  };

  // Information appears on each item.
  renderItem = item => {
    let emailInfo;
    if (item.type == 'Doctor') {
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
        onPress={() => {
          this.handleClick(dataInfor);
        }}
      >
        <Image
          style={styles.avatar}
          source={item.avatar ? { uri: item.avatar } : tempAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.type}</Text>
          <Text>Address: {item.address}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Responsible for SearchBar to work.
  searchFilterFunction(newText) {
    const newData = this.state.doc_phar.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = newText.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      myArray: newData,
      text: newText,
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SearchBar
            placeholder="Search Doctor/ Pharmacist..."
            lightTheme
            round
            onChangeText={newText => this.searchFilterFunction(newText)}
            value={this.state.text}
          />
        </View>
        <FlatList
          style={styles.feed}
          data={this.state.myArray}
          renderItem={({ item }) => this.renderItem(item)}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
  },
  header: {
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D9DB',
  },
  feed: {
    marginHorizontal: 16,
  },
  feedItem: {
    backgroundColor: '#FFF',
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
});

export default AddAccess;
