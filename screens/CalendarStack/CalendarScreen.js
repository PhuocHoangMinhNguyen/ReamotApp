// Author: Phuoc Hoang Minh Nguyen
// Description: Used to show patient's taking medication history
// Status: Optimized in function, need more design

import React from "react"
import { StyleSheet, FlatList, Image, View, Text, TouchableOpacity, SafeAreaView } from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import DatePicker from '@react-native-community/datetimepicker'
import moment from "moment"

export default class CalendarScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      medicine: [],
      history: [],
      show: false,
      testDate: new Date(Date.now()),
    }
  }

  componentDidMount() {
    // Take data from "history" collection
    firestore().collection("history").onSnapshot((querySnapshot) => {
      let temp = [];
      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email) {
          temp.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          })
        }
      })
      this.setState({ history: temp })

      // Take data from "medicine" collection
      let temp2 = [];
      if (this.state.history.length == 0) {
        this.setState({ medicines: [] })
      } else {
        for (let i = 0; i < this.state.history.length; i++) {
          firestore().collection("medicine").onSnapshot((querySnapshot2) => {
            querySnapshot2.forEach((documentSnapshot2) => {
              if (documentSnapshot2.data().name == this.state.history[i].medicine) {
                temp2.push({
                  ...documentSnapshot2.data(),
                  time: this.state.history[i].time,
                  date: this.state.history[i].date,
                  status: this.state.history[i].status,
                  key: documentSnapshot2.id,
                })
              }
            })
            this.setState({ medicine: temp2 })
          })
        }
      }
    })
  }

  // Show DatePicker
  showMode = () => {
    this.setState({ show: true })
  }

  // When a date is chosen from DatePicker
  onChangeDate = (event, selectedDate) => {
    const { testDate } = this.state;
    let currentDate = selectedDate || testDate;
    this.setState({
      show: Platform.OS === 'ios',
      testDate: currentDate,
    })
  }

  // Information appears on each item.
  renderItem(item) {
    const correctItem =
      <SafeAreaView style={item.status == "taken" ? styles.feedItem : styles.missedItem}>
        <Image
          source={
            item.image
              ? { uri: item.image }
              : require("../../assets/tempAvatar.jpg")
          }
          style={styles.image}
        />
        <View style={{ flex: 1 }}>
          <Text style={item.status == "taken" ? styles.name : styles.missedName}>{item.name}</Text>
          <Text style={item.status == "taken" ? styles.blank : styles.missedTime}>{item.time}</Text>
        </View>
      </SafeAreaView>
    let message
    if (item.date == moment(this.state.testDate).format("MMMM Do YYYY")) {
      message = correctItem
    }
    return (
      message
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.testDateContainer}>
          <Text style={styles.testDate}>
            {moment(this.state.testDate).format("MMMM Do YYYY")}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={this.showMode}>
          <Text style={styles.buttonText}>Show Calendar</Text>
        </TouchableOpacity>
        {this.state.show && (
          <DatePicker
            testID="dateTimePicker"
            timeZoneOffsetInMinutes={0}
            value={this.state.testDate}
            mode="date"
            is24Hour={false}
            display="default"
            onChange={this.onChangeDate}
          />
        )}
        <FlatList
          style={styles.feed}
          data={this.state.medicine}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
  },
  feedItem: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 8,
    flexDirection: "row",
    marginVertical: 8,
  },
  missedItem: {
    backgroundColor: "#FF0000",
    borderRadius: 5,
    padding: 8,
    flexDirection: "row",
    marginVertical: 8,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 18,
    marginRight: 16,
    marginLeft: 8
  },
  feed: {
    marginHorizontal: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65",
  },
  missedName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  missedTime: {
    color: "#FFF",
  },
  button: {
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    width: 110,
    height: 40,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    marginVertical: 12,
    marginEnd: 16
  },
  buttonText: {
    color: "#FFF"
  },
  testDateContainer: {
    alignItems: "center",
    marginTop: 12
  },
  testDate: {
    fontSize: 24,
    fontWeight: "bold"
  }
})