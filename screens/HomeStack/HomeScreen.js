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

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // Medicine info in "history" collection
      historymedicines: [],
      // Medicine info in "reminder" collection
      remindermedicines: [],
      tempHistory: [],
      tempReminder: [],
      missedMedicines: [],
    }
  }

  unsubscribe1 = null
  unsubscribe2 = null

  componentDidMount() {
    // Find medicine details from "medicine" collection based on data from "history" collection
    this.unsubscribe1 = firestore().collection("history")
      .where('patientEmail', '==', auth().currentUser.email)
      .where('date', '==', moment().format("MMMM Do YYYY"))
      .onSnapshot(querySnapshot => {
        let tempHistory = []
        querySnapshot.forEach(documentSnapshot => {
          tempHistory.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          })
        })
        this.setState({ tempHistory: tempHistory })
        let tempHis = []
        let tempMissed = []
        if (this.state.tempHistory.length == 0) {
          this.setState({ historymedicines: [] })
        } else {
          for (let i = 0; i < this.state.tempHistory.length; i++) {
            firestore().collection("medicine")
              .where('name', '==', this.state.tempHistory[i].medicine)
              .onSnapshot(querySnapshot => {
                querySnapshot.forEach(documentSnapshot => {
                  tempHis.push({
                    ...documentSnapshot.data(),
                    time: this.state.tempHistory[i].time,
                    status: this.state.tempHistory[i].status,
                    key: this.state.tempHistory[i].key,
                  })
                  if (this.state.tempHistory[i].status == "missed") {
                    tempMissed.push({
                      ...documentSnapshot.data(),
                      time: this.state.tempHistory[i].time,
                      status: this.state.tempHistory[i].status,
                      key: this.state.tempHistory[i].key,
                    })
                  }
                })
                this.setState({
                  historymedicines: tempHis,
                  missedMedicines: tempMissed,
                })
              })
          }
        }
      })

    // Find medicine details from "medicine" collection based on data from "reminder" collection
    this.unsubscribe2 = firestore().collection("reminder")
      .where('patientEmail', '==', auth().currentUser.email)
      .onSnapshot(querySnapshot => {
        let tempReminder = []
        querySnapshot.forEach(documentSnapshot => {
          tempReminder.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          })
        })
        this.setState({ tempReminder: tempReminder })
        let tempRem = []
        if (this.state.tempReminder.length == 0) {
          this.setState({ remindermedicines: [] })
        } else {
          for (let i = 0; i < this.state.tempReminder.length; i++) {
            firestore().collection("medicine")
              .where('name', '==', this.state.tempReminder[i].medicine)
              .onSnapshot(querySnapshot => {
                querySnapshot.forEach(documentSnapshot => {
                  tempRem.push({
                    ...documentSnapshot.data(),
                    time: this.state.tempReminder[i].times,
                    key: this.state.tempReminder[i].key,
                  })
                })
                this.setState({ remindermedicines: tempRem })
              })
          }
        }
      })
  }

  componentWillUnmount() {
    this.unsubscribe1()
    this.unsubscribe2()
  }

  // Handle clicking on medicine details on 1 of 2 flatlists.
  handleClick = dataInfor => {
    this.props.navigation.navigate("MedicationInformation", dataInfor)
  }

  // Information appears on each item on "Upcoming Reminder" List
  renderItem = item => {
    let dataInfor = {
      image: item.image,
      name: item.name,
      description: item.description,
      barcode: item.barcode,
      times: item.time
    }
    // Item Time
    const hour = parseInt(item.time.substring(0, 2))
    const minute = parseInt(item.time.substring(3, 5))
    const morning_afternoon = item.time.substring(6, 8)

    // Current Time
    const hourNow = parseInt(moment().format('hh:mm a').substring(0, 2))
    const minuteNow = parseInt(moment().format('hh:mm a').substring(3, 5))
    const morning_afternoonNow = moment().format('hh:mm a').substring(6, 8)

    // "Accepted" = true means the reminder time is larger than current time.
    let accepted = false

    // If Time Now is "am"
    if (morning_afternoonNow == "am") {
      // If Item Time is "am"
      if (morning_afternoon == "am") {
        // If Hour values are similar
        if (hour == hourNow) {
          // If Item Minute larger than Minute Now
          if (minute > minuteNow) {
            accepted = true
          }
          // If Hour Now is not 12, and Item Hour is 12
        } else if (hour == 12) {

          // If Hour Now is 12, and Item Hour is not 12
        } else if (hourNow == 12) {
          accepted = true
          // If Hour Now and Item Hour are both not 12, 
          // and they are not the same
        } else {
          if (hour > hourNow) {
            accepted = true
          }
        }
        // If Item Time is "pm"
      } else {
        accepted = true
      }
      // If Time Now is "pm"
    } else {
      // If Item Time is "pm"
      if (morning_afternoon == "pm") {
        // If Hour values are similar
        if (hour == hourNow) {
          if (minute > minuteNow) {
            accepted = true
          }
          // If Hour Now is not 12, and Item Hour is 12
        } else if (hour == 12) {

          // If Hour Now is 12, and Item Hour is not 12
        } else if (hourNow == 12) {
          accepted = true
          // If Hour Now and Item Hour are both not 12, 
          // and they are not the same
        } else {
          if (hour > hourNow) {
            accepted = true
          }
        }
      }
    }

    if (accepted == true) {
      return (
        <TouchableOpacity style={styles.feedItem}
          onPress={() => { this.handleClick(dataInfor) }}>
          <Image style={styles.avatar}
            source={
              item.image ? { uri: item.image } : require("../../assets/tempAvatar.jpg")
            }
          />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
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
      name: item.name,
      description: item.description,
      barcode: item.barcode,
      times: item.time
    }
    return (
      <TouchableOpacity style={item.status == "taken" ? styles.feedTaken : styles.feedMissed}
        onPress={() => { this.handleClick(dataInfor) }}>
        <Image style={styles.avatar}
          source={
            item.image ? { uri: item.image } : require("../../assets/tempAvatar.jpg")
          }
        />
        <Text style={item.status == "taken" ? styles.nameTaken : styles.nameMissed}>{item.name}</Text>
        <Text style={item.status == "taken" ? styles.timeTaken : styles.timeMissed}>{item.time}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    let message
    // If 2 lists ("Medicines Taken" and "Upcoming Reminders" are blanks)
    if (this.state.historymedicines.length == 0 && this.state.remindermedicines.length == 0) {
      message =
        <View style={{ flex: 1, marginTop: -150, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.emptyText}>You have no active reminder</Text>
          <Text>Please add a medicine,</Text>
          <Text>or contact your doctor for a prescription</Text>
        </View>
    } else {
      message = <View style={{ flex: 1 }}>
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
    }
    let image

    // Current Time
    const hourNow = moment().format('hh:mm a').substring(0, 2)
    const minuteNow = moment().format('hh:mm a').substring(3, 5)
    const morning_afternoonNow = moment().format('hh:mm a').substring(6, 8)
    let counting = 0
    for (let i = 0; i < this.state.remindermedicines.length; i++) {
      // Item Time
      const hour = this.state.remindermedicines[i].time.substring(0, 2)
      const minute = this.state.remindermedicines[i].time.substring(3, 5)
      const morning_afternoon = this.state.remindermedicines[i].time.substring(6, 8)

      // If Time Now is "am"
      if (morning_afternoonNow == "am") {
        // If Item Time is "am"
        if (morning_afternoon == "am") {
          // If Hour values are similar
          if (hour == hourNow) {
            // If Item Minute larger than Minute Now
            if (minute > minuteNow) {
              counting++
            }
            // If Hour Now is not 12, and Item Hour is 12
          } else if (hour == 12) {

            // If Hour Now is 12, and Item Hour is not 12
          } else if (hourNow == 12) {
            counting++
            // If Hour Now and Item Hour are both not 12, 
            // and they are not the same
          } else {
            if (hour > hourNow) {
              counting++
            }
          }
          // If Item Time is "pm"
        } else {
          counting++
        }
        // If Time Now is "pm"
      } else {
        // If Item Time is "pm"
        if (morning_afternoon == "pm") {
          // If Hour values are similar
          if (hour == hourNow) {
            if (minute > minuteNow) {
              counting++
            }
            // If Hour Now is not 12, and Item Hour is 12
          } else if (hour == 12) {

            // If Hour Now is 12, and Item Hour is not 12
          } else if (hourNow == 12) {
            counting++
            // If Hour Now and Item Hour are both not 12, 
            // and they are not the same
          } else {
            if (hour > hourNow) {
              counting++
            }
          }
        }
      }
    }
    // Determine Image Chosen to be shown, based on the value below.
    const value = (this.state.historymedicines.length - this.state.missedMedicines.length)
      * 100 / (counting + this.state.historymedicines.length)
    if (value == 0) {
      image = <Image style={styles.image}
        source={require('../../assets/growing_0.png')} />
    } else if (value > 0 && value < 25) {
      image = <Image style={styles.image}
        source={require('../../assets/growing_0_to_25.png')} />
    } else if (value >= 25 && value < 50) {
      image = <Image style={styles.image}
        source={require('../../assets/growing_25_to_50.png')} />
    } else if (value >= 50 && value < 75) {
      image = <Image style={styles.image}
        source={require('../../assets/growing_50_to_75.png')} />
    } else if (value >= 75 && value < 100) {
      image = <Image style={styles.image}
        source={require('../../assets/growing_75_to_100.png')} />
    } else {
      image = <Image style={styles.image}
        source={require('../../assets/GrowingTree.jpg')} />
    }
    return (
      <View style={styles.container}>
        <Image style={styles.containter}
          source={require("../../assets/background.png")}
        />
        {image}
        {message}
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