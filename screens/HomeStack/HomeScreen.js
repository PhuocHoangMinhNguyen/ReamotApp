// Author: Phuoc Hoang Minh Nguyen & Quang Duy Nguyen
// Description: HomeScreen show list of upcoming reminders 
// and medication taking history for the day
// Status: Optimized

import React from "react";
import {
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import moment from "moment";
import Background from '../../components/Background';
import TreeImage from '../../components/TreeImage';

var tempAvatar = require("../../assets/tempAvatar.png")

class HomeScreen extends React.Component {
  state = {
    // Medicine info in "history" collection
    historymedicines: [],
    // Medicine info in "reminder" collection
    remindermedicines: [],
    missedMedicines: [],
  }

  unsubscribe = null

  componentDidMount() {
    // Get the medicine information
    this.unsubscribe = firestore().collection("medicine").onSnapshot(querySnapshot => {
      let tempMedicine = []
      querySnapshot.forEach(documentSnapshot => {
        tempMedicine.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id
        })
      })
      // Get all the history of taking medicine for today.
      firestore().collection("history").where('patientEmail', '==', auth().currentUser.email)
        .where('date', '==', moment().format("MMMM Do YYYY"))
        .onSnapshot(querySnapshot => {
          let tempHistory = []
          querySnapshot.forEach(documentSnapshot => {
            for (let i = 0; i < tempMedicine.length; i++) {
              if (tempMedicine[i].name == documentSnapshot.data().medicine) {
                tempHistory.push({
                  ...documentSnapshot.data(),
                  barcode: tempMedicine[i].barcode,
                  description: tempMedicine[i].description,
                  image: tempMedicine[i].image,
                  key: documentSnapshot.id
                })
              }
            }
          })
          this.setState({ historymedicines: tempHistory })
        })
      // Get all the history of taking medicine, that are missed, for today.
      firestore().collection("history").where('patientEmail', '==', auth().currentUser.email)
        .where('date', '==', moment().format("MMMM Do YYYY"))
        .where('status', '==', 'missed')
        .onSnapshot(querySnapshot => {
          let tempHistory = []
          querySnapshot.forEach(documentSnapshot => {
            for (let i = 0; i < tempMedicine.length; i++) {
              if (tempMedicine[i].name == documentSnapshot.data().medicine) {
                tempHistory.push({
                  ...documentSnapshot.data(),
                  barcode: tempMedicine[i].barcode,
                  description: tempMedicine[i].description,
                  image: tempMedicine[i].image,
                  key: documentSnapshot.id
                })
              }
            }
          })
          this.setState({ missedMedicines: tempHistory })
        })
      // Get all the reminders
      firestore().collection("reminder").where('patientEmail', '==', auth().currentUser.email)
        .onSnapshot(querySnapshot => {
          let tempReminder = []
          querySnapshot.forEach(documentSnapshot => {
            for (let i = 0; i < tempMedicine.length; i++) {
              if (tempMedicine[i].name == documentSnapshot.data().medicine) {
                tempReminder.push({
                  ...documentSnapshot.data(),
                  barcode: tempMedicine[i].barcode,
                  description: tempMedicine[i].description,
                  image: tempMedicine[i].image,
                  key: documentSnapshot.id
                })
              }
            }
          })
          this.setState({ remindermedicines: tempReminder })
        })
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  // Information appears on each item on "Upcoming Reminder" List
  renderReminder = item => {
    let dataInfor = {
      image: item.image,
      name: item.medicine,
      description: item.description,
    }

    if (item.time.toDate().toDateString() == (new Date()).toDateString() && item.time.toDate() >= Date.now()) {
      return (
        <TouchableOpacity style={styles.feedItem}
          onPress={() => {
            this.props.navigation.navigate("MedicationInformation", dataInfor)
          }}>
          <Image style={styles.avatar}
            source={item.image ? { uri: item.image } : tempAvatar}
          />
          <Text style={styles.name}>{item.medicine}</Text>
          <Text style={styles.time}>{moment(item.time.toDate()).format('hh:mm a')}</Text>
        </TouchableOpacity>
      )
    } else {
      // Blank Text so the List can be processed normally
      return <Text></Text>
    }
  }

  // Information appears on each item on "Medicines Taken" List
  renderHistory = item => {
    let dataInfor = {
      image: item.image,
      name: item.medicine,
      description: item.description,
    }

    return (
      <TouchableOpacity style={item.status == "taken" ? styles.feedTaken : styles.feedMissed}
        onPress={() => {
          this.props.navigation.navigate("MedicationInformation", dataInfor)
        }}>
        <Image style={styles.avatar}
          source={item.image ? { uri: item.image } : tempAvatar}
        />
        <Text style={item.status == "taken" ? styles.nameTaken : styles.nameMissed}>{item.medicine}</Text>
        <Text style={item.status == "taken" ? styles.timeTaken : styles.timeMissed}>{moment(item.startTime.toDate()).format('hh:mm a')}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    let counting = 0
    for (let i = 0; i < this.state.remindermedicines.length; i++) {
      if (this.state.remindermedicines[i].time.toDate().toDateString() == (new Date()).toDateString()
        && this.state.remindermedicines[i].time.toDate() >= Date.now()) {
        counting++
      }
    }
    // Determine Image Chosen to be shown, based on the value below.
    const value = (this.state.historymedicines.length - this.state.missedMedicines.length)
      * 100 / (counting + this.state.historymedicines.length)

    // If 2 lists ("Medicines Taken" and "Upcoming Reminders" are blanks)
    if (this.state.historymedicines.length == 0 && this.state.remindermedicines.length == 0) {
      return (
        <View style={styles.container}>
          <Background style={styles.containter} />
          <TreeImage value={value} />
          <View style={{ flex: 1, marginTop: -150, justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.emptyText}>You have no active reminder</Text>
            <Text>Please add a medicine,</Text>
            <Text>or contact your doctor for a prescription</Text>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Background />
        <TreeImage value={value} />
        <View style={{ flex: 1 }}>
          <View style={styles.chapterView}>
            <Text style={styles.chapter}>Medicines Taken</Text>
          </View>
          <FlatList removeClippedSubviews={true}
            style={styles.feed}
            data={this.state.historymedicines}
            renderItem={({ item }) => this.renderHistory(item)}
            horizontal={true}
          />
          <View style={styles.chapterView}>
            <Text style={styles.chapter}>Upcoming Reminders</Text>
          </View>
          <FlatList removeClippedSubviews={true}
            style={styles.feed}
            data={this.state.remindermedicines}
            renderItem={({ item }) => this.renderReminder(item)}
            horizontal={true}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
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
    fontWeight: "500",
  },
  nameMissed: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
  nameTaken: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
  time: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "500",
  },
  timeTaken: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
  timeMissed: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "white",
  },
  emptyText: {
    fontWeight: "bold",
    fontSize: 20
  },
  titleView: {
    marginTop: 30,
    alignItems: "center"
  },
  title: {
    fontSize: 20,
    color: "#FFF"
  },
  chapterView: {
    marginVertical: 6,
    marginLeft: 12
  },
  chapter: {
    fontWeight: "bold",
    fontSize: 16
  },
})

export default HomeScreen