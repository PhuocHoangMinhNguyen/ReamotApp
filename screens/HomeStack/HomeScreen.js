// Author: Phuoc Hoang Minh Nguyen & Quang Duy Nguyen
// Description: HomeScreen show list of upcoming reminders 
//  and medication taking history for the day
// Status: Optimized

import React from "react"
import {
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import moment from "moment"
import HomeFunctions from '../../utilities/HomeFunctions'

var background = require('../../assets/background.png')
var tempAvatar = require("../../assets/tempAvatar.jpg")
var growing1 = require('../../assets/growing_0.png')
var growing2 = require('../../assets/growing_0_to_25.png')
var growing3 = require('../../assets/growing_25_to_50.png')
var growing4 = require('../../assets/growing_50_to_75.png')
var growing5 = require('../../assets/growing_75_to_100.png')
var growing6 = require('../../assets/GrowingTree.jpg')

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
    this.unsubscribe = firestore().collection("medicine").onSnapshot(querySnapshot => {
      let tempMedicine = []
      querySnapshot.forEach(documentSnapshot => {
        tempMedicine.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id
        })
      })
      firestore().collection("history")
        .where('patientEmail', '==', auth().currentUser.email)
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
      firestore().collection("history")
        .where('patientEmail', '==', auth().currentUser.email)
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
      firestore().collection("reminder")
        .where('patientEmail', '==', auth().currentUser.email)
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
  renderItem = item => {
    let dataInfor = {
      image: item.image,
      name: item.medicine,
      description: item.description,
      barcode: item.barcode,
      times: item.times
    }

    // Call calculateTime function in HomeFunctions.js
    const accepted = HomeFunctions.calculateTime(item.times)

    if (accepted == true) {
      return (
        <TouchableOpacity style={styles.feedItem}
          onPress={() => {
            this.props.navigation.navigate("MedicationInformation", dataInfor)
          }}>
          <Image style={styles.avatar}
            source={item.image ? { uri: item.image } : tempAvatar}
          />
          <Text style={styles.name}>{item.medicine}</Text>
          <Text style={styles.time}>{item.times}</Text>
        </TouchableOpacity>
      )
    } else {
      // Blank Text so the List can be processed normally
      return <Text></Text>
    }
  }

  // Information appears on each item on "Medicines Taken" List
  renderItemHistory = item => {
    let dataInfor = {
      image: item.image,
      name: item.medicine,
      description: item.description,
      barcode: item.barcode,
      times: item.time
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
        <Text style={item.status == "taken" ? styles.timeTaken : styles.timeMissed}>{item.time}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    let image
    let counting = 0
    for (let i = 0; i < this.state.remindermedicines.length; i++) {
      // Call calculateTime function in HomeFunctions.js
      const accepted = HomeFunctions.calculateTime(this.state.remindermedicines[i].times)
      if (accepted == true) {
        counting++
      }
    }
    // Determine Image Chosen to be shown, based on the value below.
    const value = (this.state.historymedicines.length - this.state.missedMedicines.length)
      * 100 / (counting + this.state.historymedicines.length)
    if (value == 0) {
      image = <Image style={styles.image}
        source={growing1} />
    } else if (value > 0 && value < 25) {
      image = <Image style={styles.image}
        source={growing2} />
    } else if (value >= 25 && value < 50) {
      image = <Image style={styles.image}
        source={growing3} />
    } else if (value >= 50 && value < 75) {
      image = <Image style={styles.image}
        source={growing4} />
    } else if (value >= 75 && value < 100) {
      image = <Image style={styles.image}
        source={growing5} />
    } else {
      image = <Image style={styles.image}
        source={growing6} />
    }

    // If 2 lists ("Medicines Taken" and "Upcoming Reminders" are blanks)
    if (this.state.historymedicines.length == 0 && this.state.remindermedicines.length == 0) {
      return (
        <View style={styles.container}>
          <Image style={styles.containter}
            source={background}
          />
          {image}
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
        <Image style={styles.containter}
          source={background}
        />
        {image}
        <View style={{ flex: 1 }}>
          <View style={styles.chapterView}>
            <Text style={styles.chapter}>Medicines Taken</Text>
          </View>
          <FlatList removeClippedSubviews={true}
            style={styles.feed}
            data={this.state.historymedicines}
            renderItem={({ item }) => this.renderItemHistory(item)}
            horizontal={true}
          />
          <View style={styles.chapterView}>
            <Text style={styles.chapter}>Upcoming Reminders</Text>
          </View>
          <FlatList removeClippedSubviews={true}
            style={styles.feed}
            data={this.state.remindermedicines}
            renderItem={({ item }) => this.renderItem(item)}
            horizontal={true}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  containter: {
    width: Dimensions.get("window").width, //for full screen
  },
  container: {
    flex: 1,
    alignItems: 'center',
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
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginTop: -150,
  }
})

export default HomeScreen