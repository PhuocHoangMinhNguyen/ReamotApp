// Author: Phuoc Hoang Minh Nguyen
// Description: Show medicine details, and reminder for that medicine of that patient.
// Status: In development

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, Button, FlatList } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import ViewMoreText from "react-native-view-more-text"

export default class MediInfoScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      medicine: {},
      prescription: {},
      reminder: [],
      arraySize: 0,
    }
  }

  componentDidMount() {
    // Take medicine data from MedicineScreen, including image, name, description, and barcode.
    // => Faster than accessing Cloud Firestore again.
    let paramsFromMedicineScreen = this.props.navigation.state.params
    this.setState({ medicine: paramsFromMedicineScreen })

    // Get Prescription data from Cloud Firestore to know number of capsules taken per time, 
    // and number of times to take medicine per day.
    firestore().collection("prescription").onSnapshot((querySnapshot) => {
      let tempValue = 0
      let tempValue2 = 0

      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email
          && documentSnapshot.data().name == this.props.navigation.state.params.name) {
          tempValue = parseInt(documentSnapshot.data().times, 10)
          tempValue2 = parseInt(documentSnapshot.data().number, 10)
        }
      });
      this.setState({
        prescription: {
          times: tempValue,
          number: tempValue2
        }
      })
    })

    // Get Reminder data of that patient and that medicine.
    firestore().collection("reminder").onSnapshot((querySnapshot) => {
      let temp = []
      let counting = 0
      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email
          && documentSnapshot.data().medicine == this.props.navigation.state.params.name) {
          temp.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
          counting++
        }
      })
      this.setState({ reminder: temp, arraySize: counting })
    })
  }

  handleNewReminder = () => {
    this.props.navigation.navigate("NewReminder", this.props.navigation.state.params)
  }

  handleChangeReminder = (item) => {
    this.props.navigation.navigate("ChangeReminder", {
      medicine: this.props.navigation.state.params,
      itemTime: item.times,
    })
  }

  // Handle View More Text in medicine's description
  renderViewMore(onPress) {
    return (
      <Text onPress={onPress} style={{ color: '#018ABE' }}>View More</Text>
    )
  }

  // Handle View Less Text in medicine's description
  renderViewLess(onPress) {
    return (
      <Text onPress={onPress} style={{ color: '#018ABE' }}>View less</Text>
    )
  }

  // Information appears on each item of Flatlist.
  //
  // If the number of reminder set by that patient for that medicine is lower than
  // times the patient has to take that medicine per day according to "prescription" document in Firebase,
  // some emptyItem will be shown.
  //
  // If the number of reminder set by that patient for that medicine is equal or largert than
  // times the patient has to take that medicine per day according to "prescription" document in Firebase,
  // all emptyItem will be replace by nonEmptyItem
  renderItem = (item) => {
    const itemDetails = item
    const nonEmptyItem =
      <View style={styles.prescription}>
        <Text style={styles.time}>{item.times}</Text>
        <Button style={styles.edit} title="Edit" onPress={() => this.handleChangeReminder(itemDetails)} />
      </View>
    const emptyItem =
      <TouchableOpacity style={styles.reminder} onPress={this.handleNewReminder}>
        <Text style={{ fontSize: 18 }}>+ Add Reminder</Text>
      </TouchableOpacity>
    let message
    if (item == "null") {
      message = emptyItem
    } else {
      message = nonEmptyItem
    }
    return (message)
  }

  render() {
    // This is to make the number of element in "reminder" equal to times the patient
    // has to take that medicine per day according to "prescription" document in Firebase.
    // If reminder size is lower, fill reminder array with null values.
    // ==> To support renderItem function above.
    if (this.state.arraySize < this.state.prescription.times) {
      for (let i = this.state.arraySize; i < this.state.prescription.times; i++) {
        this.state.reminder.push("null")
      }
    }
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={32} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.information}>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={
                this.state.medicine.image
                  ? { uri: this.state.medicine.image }
                  : require("../../assets/tempAvatar.jpg")
              }
              style={styles.image}
            />
            <Text style={styles.name}>{this.state.medicine.name}</Text>
          </View>
          <ViewMoreText
            numberOfLines={3}
            renderViewMore={this.renderViewMore}
            renderViewLess={this.renderViewLess}
            textStyle={styles.description}>
            <Text>{this.state.medicine.description}</Text>
          </ViewMoreText>
        </View>

        <View style={styles.prescription}>
          <Text style={styles.time}>{this.state.prescription.number}</Text>
          <Text style={styles.time}>{this.state.prescription.times} times</Text>
          <Text style={styles.repeat}>Daily</Text>
        </View>

        <FlatList
          data={this.state.reminder}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    flex: 1,
  },
  back: {
    position: "absolute",
    marginTop: -70,
    top: 24,
    left: 32,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(21, 22, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    marginVertical: 24,
    fontSize: 20
  },
  information: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  description: {
    marginTop: 12
  },
  reminder: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  prescription: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  time: {
    fontSize: 18
  },
  repeat: {
    fontSize: 18
  },
})