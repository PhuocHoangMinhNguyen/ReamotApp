// Author: Phuoc Hoang Minh Nguyen
// Description: Used to show patient's taking medication history
// Status: Optimized

import React from "react"
import { StyleSheet, FlatList, Image, View, Text, TouchableOpacity, SafeAreaView } from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import DatePicker from '@react-native-community/datetimepicker'
import moment from "moment"

var tempAvatar = require("../../assets/tempAvatar.jpg")

class CalendarScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      medicine: [],
      show: false,
      testDate: new Date(Date.now()),
    }
  }

  unsubscribe = null

  loadItems = () => {
    firestore().collection("history")
      .where('patientEmail', '==', auth().currentUser.email)
      .where('date', '==', moment(this.state.testDate).format('MMMM Do YYYY'))
      // Add more condition to make it run faster
      .onSnapshot(querySnapshot => {
        let result = []
        querySnapshot.forEach(documentSnapshot => {
          firestore().collection("medicine")
            .where('name', '==', documentSnapshot.data().medicine).get()
            .then(queryMedicineSnapshot => {
              let docs = queryMedicineSnapshot.docs
              for (let doc of docs) {
                const selectedItem = {
                  ...doc.data(),
                  ...documentSnapshot.data(),
                  key: documentSnapshot.id
                }
                result.push(selectedItem)
              }
            }).then(() => {
              this.setState({ medicine: result })
            })
        })
      })
  }

  componentDidMount() {
    this.unsubscribe = this.loadItems()
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  // Show DatePicker
  showMode = () => {
    this.setState({ show: true })
  }

  // When a date is chosen from DatePicker
  onChangeDate = (event, selectedDate) => {
    const { testDate } = this.state
    let currentDate = selectedDate || testDate;
    this.setState({
      show: Platform.OS === 'ios',
      testDate: currentDate,
    })
    this.loadItems()
  }

  // Information appears on each item.
  renderItem(item) {
    const correctItem =
      <SafeAreaView style={item.status == "taken" ? styles.feedItem : styles.missedItem}>
        <Image style={styles.image}
          source={item.image ? { uri: item.image } : tempAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={item.status == "taken" ? styles.name : styles.missedName}>{item.name}</Text>
          <Text style={item.status == "taken" ? styles.blank : styles.missedTime}>{item.time}</Text>
        </View>
      </SafeAreaView>
    if (item.date == moment(this.state.testDate).format("MMMM Do YYYY")) {
      return correctItem
    } else {
      // Blank text used so that the list can be processed normally
      return <Text style={{ height: 0.1 }}></Text>
    }
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
            value={this.state.testDate}
            onChange={this.onChangeDate}
          />
        )}
        <FlatList
          style={styles.feed}
          data={this.state.medicine}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => item.key}
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
    marginVertical: 16,
    marginEnd: 16
  },
  buttonText: {
    color: "#FFF"
  },
  testDateContainer: {
    alignItems: "center",
    marginTop: 30
  },
  testDate: {
    fontSize: 24,
    fontWeight: "bold"
  }
})

export default CalendarScreen