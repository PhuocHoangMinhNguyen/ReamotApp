// Author: Phuoc Hoang Minh Nguyen
// Description: Used as a backup plan for HomeStack
// Status: In development

import React from "react"
import { Text, StyleSheet, FlatList, SafeAreaView, Image, TouchableOpacity, View } from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import moment from "moment"

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      historymedicines: [],
      remindermedicines: [],
      tempHistory: [],
      tempReminder: [],
      missedMedicines: [],
    }
  }

  unsubscribe1 = null
  unsubscribe2 = null

  componentDidMount() {
    this.unsubscribe1 = firestore().collection("history").onSnapshot((queryHistorySnapshot) => {
      let tempHistory = []
      queryHistorySnapshot.forEach((documentHistorySnapshot) => {
        if (documentHistorySnapshot.data().patientEmail == auth().currentUser.email
          && documentHistorySnapshot.data().date == moment(this.state.testDate).format("MMMM Do YYYY")) {
          tempHistory.push({
            ...documentHistorySnapshot.data(),
            key: documentHistorySnapshot.id
          })
        }
      })
      this.setState({ tempHistory: tempHistory })
      let tempHis = []
      let tempMissed = []
      if (this.state.tempHistory.length == 0) {
        this.setState({ historymedicines: [] })
      } else {
        for (let i = 0; i < this.state.tempHistory.length; i++) {
          firestore().collection("medicine").onSnapshot((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
              if (documentSnapshot.data().name == this.state.tempHistory[i].medicine) {
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

    this.unsubscribe2 = firestore().collection("reminder").onSnapshot((queryReminderSnapshot) => {
      let tempReminder = []
      queryReminderSnapshot.forEach((documentReminderSnapshot) => {
        if (documentReminderSnapshot.data().patientEmail == auth().currentUser.email) {
          tempReminder.push({
            ...documentReminderSnapshot.data(),
            key: documentReminderSnapshot.id
          })
        }
      })
      this.setState({ tempReminder: tempReminder })
      let tempRem = []
      if (this.state.tempReminder.length == 0) {
        this.setState({ remindermedicines: [] })
      } else {
        for (let i = 0; i < this.state.tempReminder.length; i++) {
          firestore().collection("medicine").onSnapshot((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
              if (documentSnapshot.data().name == this.state.tempReminder[i].medicine) {
                tempRem.push({
                  ...documentSnapshot.data(),
                  time: this.state.tempReminder[i].times,
                  key: this.state.tempReminder[i].key,
                })
              }
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

  handleClick = (dataInfor) => {
    this.props.navigation.navigate("MedicationInformation", dataInfor)
  }

  // Information appears on each item.
  renderItem = (item) => {
    let dataInfor = {
      image: item.image,
      name: item.name,
      description: item.description,
      barcode: item.barcode,
      times: item.time
    }
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
  }

  renderItemHistory = (item) => {
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
        <FlatList
          style={styles.feed}
          data={this.state.historymedicines}
          renderItem={({ item }) => this.renderItemHistory(item)}
          horizontal={true}
        />
        <View style={styles.chapterView}>
          <Text style={styles.chapter}>Upcoming Reminders</Text>
        </View>
        <FlatList
          style={styles.feed}
          data={this.state.remindermedicines}
          renderItem={({ item }) => this.renderItem(item)}
          horizontal={true}
        />
      </View>
    }
    let image
    const value = (this.state.remindermedicines.length + this.state.historymedicines.length - this.state.missedMedicines.length)
      * 100 / (this.state.remindermedicines.length + this.state.historymedicines.length)
    if (value == 0) {
      image = <Image style={{ width: 220, height: 220, borderRadius: 110 }}
        source={require('../../assets/growing_0.png')} />
    } else if (value > 0 && value < 25) {
      image = <Image style={{ width: 220, height: 220, borderRadius: 110 }}
        source={require('../../assets/growing_0_to_25.png')} />
    } else if (value >= 25 && value < 50) {
      image = <Image style={{ width: 220, height: 220, borderRadius: 110 }}
        source={require('../../assets/growing_25_to_50.png')} />
    } else if (value >= 50 && value < 75) {
      image = <Image style={{ width: 220, height: 220, borderRadius: 110 }}
        source={require('../../assets/growing_50_to_75.png')} />
    } else if (value >= 75 && value < 100) {
      image = <Image style={{ width: 220, height: 220, borderRadius: 110 }}
        source={require('../../assets/growing_75_to_100.png')} />
    } else {
      image = <Image style={{ width: 220, height: 220, borderRadius: 110 }}
        source={require('../../assets/GrowingTree.jpg')} />
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleView}>
          <Text style={styles.title}>Add Medication</Text>
        </View>
        {image}
        {message}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
    alignItems: 'center'
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
    fontWeight: "bold",
    fontSize: 20
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