// Author: Phuoc Hoang Minh Nguyen
// Description: Show the list of medicines that is in patient's prescriptions
// Status: Optimized

import React from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { SearchBar } from "react-native-elements";
import Toast from 'react-native-simple-toast';
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import ReactNativeAN from 'react-native-alarm-notification';
import { DeviceEventEmitter } from 'react-native';
import NavigationService from '../../utilities/NavigationService';

var tempAvatar = require("../../assets/tempAvatar.png");

class MedicineScreen extends React.Component {
  state = {
    loading: true,
    medicines: [],
    text: "",
    myArray: [],
  }

  unsubscribe = null

  prescriptionCollection = (temp) => {
    // Deal with medicines that patient add
    firestore().collection("prescription")
      .where('patientEmail', '==', auth().currentUser.email)
      .onSnapshot(querySnapshot => {
        let temp2 = [];
        querySnapshot.forEach(documentSnapshot => {
          for (let i = 0; i < temp.length; i++) {
            if (documentSnapshot.data().name == temp[i].name) {
              temp2.push({
                ...documentSnapshot.data(),
                ...temp[i],
                key: documentSnapshot.id,
              });
            }
          }
        });
        this.setState({
          medicines: temp2,
          myArray: temp2,
          loading: false,
        });
      });
  }

  componentDidMount() {
    // To take user's medicine based on medicine listed in "prescription" collection.
    this.unsubscribe = firestore().collection("medicine")
      .onSnapshot(querySnapshot => {
        let temp = [];
        querySnapshot.forEach(documentSnapshot => {
          temp.push({
            ...documentSnapshot.data(),
            medicineKey: documentSnapshot.id
          });
        });
        this.prescriptionCollection(temp);
      });

    DeviceEventEmitter.addListener('OnNotificationDismissed', async function (e) {
      const obj = JSON.parse(e);
      console.log(`Notification id: ${obj.id} dismissed`);
    });

    DeviceEventEmitter.addListener('OnNotificationOpened', async function (e) {
      const obj = JSON.parse(e);
      //console.log("Item Time: " + new Date(Date.parse(obj.itemTime)));
      NavigationService.navigate("ChangeReminder", {
        medicine: {
          image: obj.image,
          name: obj.name,
          description: obj.description,
          barcode: obj.barcode,
        },
        itemTime: new Date(Date.parse(obj.itemTime)),
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    DeviceEventEmitter.removeListener('OnNotificationDismissed');
    DeviceEventEmitter.removeListener('OnNotificationOpened');
  }

  deleteAlarms = (name) => {
    firestore().collection("reminder")
      .where('medicine', '==', name)
      .where('patientEmail', '==', auth().currentUser.email)
      .onSnapshot(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          firestore().collection("reminder").doc(documentSnapshot.id).delete()
            .then(() => {
              ReactNativeAN.deleteAlarm(documentSnapshot.data().idAN.toString());
              Toast.show('That medicine is deleted');
            })
        })
      })
  }

  // Information appears on each item.
  renderItem = (item) => {
    let dataInfor = {
      image: item.image,
      name: item.name,
      description: item.description,
      barcode: item.barcode
    }
    if (item.adder == 'patient') {
      return (
        <TouchableOpacity style={styles.feedItem}
          onPress={() => { this.props.navigation.navigate("MediInfoScreen", dataInfor) }} >
          <Image style={styles.avatar}
            source={item.image
              ? { uri: item.image }
              : tempAvatar
            } />
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity style={styles.button}
            onPress={() => {
              // Also need to delete alarms for this medicine.
              firestore().collection('prescription').doc(item.key).delete()
                .then(() => { this.deleteAlarms(item.name) });
            }}>
            <Text style={{ color: "#FFF" }}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )
    }
    return (
      <TouchableOpacity style={styles.feedItem}
        onPress={() => { this.props.navigation.navigate("MediInfoScreen", dataInfor) }} >
        <Image style={styles.avatar}
          source={item.image
            ? { uri: item.image }
            : tempAvatar
          } />
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  // Responsible for SearchBar to work.
  searchFilterFunction(newText) {
    const newData = this.state.medicines.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase()
      const textData = newText.toUpperCase();
      return itemData.indexOf(textData) > -1
    });
    this.setState({
      myArray: newData,
      text: newText,
    });
  }

  render() {
    let message
    // Need to be fixed
    if (this.state.medicines.length == 0) {
      message =
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.emptyText}>You are not currently on medication</Text>
          <Text>Please add a medicine,</Text>
          <Text>or contact your doctor for a prescription</Text>
        </View>
    } else {
      message =
        <FlatList style={styles.feed}
          data={this.state.myArray}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
        />
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SearchBar placeholder="Search Medicine..."
            lightTheme
            round
            onChangeText={(newText) => this.searchFilterFunction(newText)}
            value={this.state.text} />
        </View>
        {message}
        <TouchableOpacity style={styles.addMedicine}
          onPress={() => { this.props.navigation.navigate("AddMedicine") }}>
          <Text style={styles.add}>Add Medicine</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
  },
  header: {
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#D8D9DB",
  },
  feed: {
    marginHorizontal: 16,
  },
  feedItem: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 8,
    flexDirection: "row",
    marginVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 16,
    marginLeft: 8
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65",
  },
  add: {
    color: "#FFF"
  },
  addMedicine: {
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 40,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    marginVertical: 12,
    marginEnd: 16
  },
  emptyText: {
    fontWeight: "bold",
    fontSize: 20
  },
  button: {
    backgroundColor: "#1565C0",
    borderRadius: 4,
    height: 40,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  }
});

export default MedicineScreen