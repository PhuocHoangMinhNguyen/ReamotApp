// Author: Phuoc Hoang Minh Nguyen
// Description: Show medicine details, and reminder for that medicine of that patient.
// Status: In development

import React from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import ViewMoreText from "react-native-view-more-text"
import Toast from "react-native-simple-toast"

export default class MediInfoScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      medicine: {},
      prescription: {},
      reminder: [],
      medicinePills: "",
      text: "",
      firebaseID: "",
      add: "",
    }
  }

  componentDidMount() {
    // Take medicine data from MedicineScreen, including image, name, description, and barcode.
    // => Faster than accessing Cloud Firestore again.
    let paramsFromMedicineScreen = this.props.navigation.state.params
    this.setState({ medicine: paramsFromMedicineScreen })

    // Get Medicine Number of Pills
    firestore().collection("medicinePills").onSnapshot(querySnapshot => {
      let temp = ""
      let tempID = ""
      querySnapshot.forEach(documentSnapshot => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email
          && documentSnapshot.data().medicine == this.props.navigation.state.params.name) {
          temp = documentSnapshot.data().pills
          tempID = documentSnapshot.id
        }
      })
      this.setState({
        medicinePills: temp,
        text: temp,
        firebaseID: tempID
      })
    })

    // Get Prescription data from Cloud Firestore to know number of capsules taken per time, 
    // and number of times to take medicine per day.
    firestore().collection("prescription").onSnapshot((querySnapshot) => {
      let tempValue = 0
      let tempValue2 = 0
      let tempValue3 = ""

      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email
          && documentSnapshot.data().name == this.props.navigation.state.params.name) {
          tempValue = parseInt(documentSnapshot.data().times, 10)
          tempValue2 = parseInt(documentSnapshot.data().number, 10)
          tempValue3 = documentSnapshot.data().type
        }
      })
      this.setState({
        prescription: {
          times: tempValue,
          number: tempValue2,
          type: tempValue3
        }
      })
    })

    // Get Reminder data of that patient and that medicine.
    firestore().collection("reminder").onSnapshot((querySnapshot) => {
      let temp = []
      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email
          && documentSnapshot.data().medicine == this.props.navigation.state.params.name) {
          temp.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          })
        }
      })
      this.setState({ reminder: temp })
    })
  }

  handleNewReminder = () => {
    if (this.state.prescription.type == "Daily") {
      this.props.navigation.navigate("NewReminder", this.props.navigation.state.params)
    } else {
      this.props.navigation.navigate("WeeklyNewReminder", this.props.navigation.state.params)
    }
  }

  handleChangeReminder = (item) => {
    if (this.state.prescription.type == "Daily") {
      this.props.navigation.navigate("ChangeReminder", {
        medicine: this.props.navigation.state.params,
        itemTime: item.times,
      })
    } else {
      this.props.navigation.navigate("WeeklyChangeReminder", {
        medicine: this.props.navigation.state.params,
        itemTime: item.times,
      })
    }
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

  addMedicinePills = () => {
    if (this.state.medicinePills < 0) {
      Toast.show("Please enter number of capsules")
    } else {
      firestore().collection("medicinePills").add({
        medicine: this.state.medicine.name,
        patientEmail: auth().currentUser.email,
        pills: this.state.medicinePills
      })
    }
  }

  updateMedicinePills = () => {
    if (this.state.medicinePills < 0) {
      Toast.show("Please enter number of capsules")
    } else {
      const value = parseInt(this.state.medicinePills, 10) + parseInt(this.state.add, 10)
      firestore().collection("medicinePills").doc(this.state.firebaseID).update({
        pills: value.toString()
      })
    }
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
        <TouchableOpacity style={styles.showPicker} onPress={() => this.handleChangeReminder(itemDetails)}>
          <Text style={{ color: "#FFF" }}>Edit</Text>
        </TouchableOpacity>
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
    // If reminder.length is lower, fill reminder array with null values.
    // ==> To support renderItem function above.

    if (this.state.reminder.length < this.state.prescription.times) {
      for (let i = this.state.reminder.length; i < this.state.prescription.times; i++) {
        this.state.reminder.push("null")
      }
    }

    const normal =
      <View style={styles.capsules}>
        <Text>{this.state.medicinePills} left</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Add some more: </Text>
          <TextInput style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
            placeholder="   "
            autoCapitalize="none"
            keyboardType="numeric"
            onChangeText={addPills => this.setState({ add: addPills })}
            value={this.state.add}
          />
          <Text>capsule(s)</Text>
        </View>
        <TouchableOpacity style={styles.showPicker} onPress={this.updateMedicinePills}>
          <Text style={{ color: "#FFF" }}>Refill</Text>
        </TouchableOpacity>
      </View>
    const lessThan10 =
      <View style={styles.capsules}>
        <Text style={{ color: "#FF0000", fontWeight: "bold" }}>{this.state.medicinePills} left</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Add some more: </Text>
          <TextInput style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
            placeholder="   "
            autoCapitalize="none"
            keyboardType="numeric"
            onChangeText={addPills => this.setState({ add: addPills })}
            value={this.state.add}
          />
          <Text>capsule(s)</Text>
        </View>
        <TouchableOpacity style={styles.showPicker} onPress={this.updateMedicinePills}>
          <Text style={{ color: "#FFF" }}>Refill</Text>
        </TouchableOpacity>
      </View>
    const none =
      <View style={styles.capsules}>
        <Text style={{ color: "#FF0000", fontWeight: "bold" }}>{this.state.medicinePills} left</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#FF0000", fontWeight: "bold" }}>Time to refill: </Text>
          <TextInput style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
            placeholder="   "
            autoCapitalize="none"
            keyboardType="numeric"
            onChangeText={addPills => this.setState({ add: addPills })}
            value={this.state.add}
          />
          <Text style={{ color: "#FF0000", fontWeight: "bold" }}>capsule(s)</Text>
        </View>
        <TouchableOpacity style={styles.showPicker} onPress={this.updateMedicinePills}>
          <Text style={{ color: "#FFF" }}>Refill</Text>
        </TouchableOpacity>
      </View>
    const empty =
      <View style={styles.capsules}>
        <TextInput style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
          placeholder="Number of Capsules in the container"
          autoCapitalize="none"
          keyboardType="numeric"
          onChangeText={pills => this.setState({ medicinePills: pills })}
          value={this.state.medicinePills}
        />
        <TouchableOpacity style={styles.showPicker} onPress={this.addMedicinePills}>
          <Text style={{ color: "#FFF" }}>Edit</Text>
        </TouchableOpacity>
      </View>

    let message
    if (this.state.text == "") {
      message = empty
    }
    if (parseInt(this.state.text) == 0) {
      message = none
    }
    if (parseInt(this.state.text) <= 10 && parseInt(this.state.text) > 0) {
      message = lessThan10
    }
    if (parseInt(this.state.text) > 10) {
      message = normal
    }
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="#FFF" />
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

        {message}

        <View style={styles.prescription}>
          <Text style={styles.time}>{this.state.prescription.number} capsule</Text>
          <Text style={styles.time}>{this.state.prescription.times} times</Text>
          <Text style={styles.repeat}>{this.state.prescription.type}</Text>
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
    flex: 1,
    backgroundColor: '#DEE8F1',
  },
  back: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 30,
    height: 30,
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
    marginTop: 70,
    marginHorizontal: 16,
    marginBottom: 8
  },
  description: {
    marginTop: 12
  },
  reminder: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  prescription: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  capsules: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  time: {
    fontSize: 18,
    alignSelf: "center"
  },
  repeat: {
    fontSize: 18
  },
  showPicker: {
    backgroundColor: "#1565C0",
    borderRadius: 4,
    height: 40,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  }
})