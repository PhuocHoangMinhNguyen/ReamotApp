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
    }
  }

  componentDidMount() {
    let tempHistory = []
    firestore().collection("history").onSnapshot((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email
          && documentSnapshot.data().date == moment(this.state.testDate).format("MMMM Do YYYY")) {
          tempHistory.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          })
        }
      })
      console.log(tempHistory)
      let tempHis = []
      for (let i = 0; i < tempHistory.length; i++) {
        firestore().collection("medicine").onSnapshot((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot) => {
            if (documentSnapshot.data().name == tempHistory[i].medicine) {
              tempHis.push({
                ...documentSnapshot.data(),
                time: tempHistory[i].time,
                status: tempHistory[i].status,
                key: documentSnapshot.id,
              })
            }
          })
          this.setState({ historymedicines: tempHis })
        })
      }
    })

    let tempReminder = []
    firestore().collection("reminder").onSnapshot((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email) {
          tempReminder.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          })
        }
      })
      let tempRem = []
      for (let i = 0; i < tempReminder.length; i++) {
        firestore().collection("medicine").onSnapshot((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot) => {
            if (documentSnapshot.data().name == tempReminder[i].medicine) {
              tempRem.push({
                ...documentSnapshot.data(),
                time: tempReminder[i].times,
                key: documentSnapshot.id,
              })
            }
          })
          this.setState({ remindermedicines: tempRem })
        })
      }
    })
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
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
        />
        <View style={styles.chapterView}>
          <Text style={styles.chapter}>Upcoming Reminders</Text>
        </View>
        <FlatList
          style={styles.feed}
          data={this.state.remindermedicines}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
        />
      </View>
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleView}>
          <Text style={styles.title}>Add Medication</Text>
        </View>
        <Image style={{ width: 220, height: 220, borderRadius: 110 }}
          source={require('../../assets/GrowingTree.jpg')} />
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
    backgroundColor: 'yellow',
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
    marginRight: 16,
    marginLeft: 8
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