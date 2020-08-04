// Author: Phuoc Hoang Minh Nguyen
// Description: Show the list of medicines that is in patient's prescriptions
// Status: In development

import React from "react"
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native"
import { SearchBar } from "react-native-elements"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

export default class MedicineScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      medicines: [],
      text: "",
      myArray: [],
      medicineNameList: [],
    };
  }

  componentDidMount() {
    // To take user's medicine based on medicine listed in "prescription" collection.
    firestore().collection("prescription").onSnapshot((queryPrescriptionSnapshot) => {
      let temp = []
      queryPrescriptionSnapshot.forEach((documentPrescriptionSnapshot) => {
        if (documentPrescriptionSnapshot.data().patientEmail == auth().currentUser.email) {
          temp.push(documentPrescriptionSnapshot.data().name)
        }
      })
      this.setState({ medicineNameList: temp })
      let temp2 = [];
      for (let i = 0; i < this.state.medicineNameList.length; i++) {
        firestore().collection("medicine").onSnapshot((queryMedicineSnapshot) => {
          queryMedicineSnapshot.forEach((documentMedicineSnapshot) => {
            if (documentMedicineSnapshot.data().name == this.state.medicineNameList[i]) {
              temp2.push({
                ...documentMedicineSnapshot.data(),
                key: documentMedicineSnapshot.id,
              });
            }
          });
          this.setState({
            medicines: temp2,
            myArray: temp2,
            loading: false,
          })
        })
      }
    })
  }

  // Click on each item in flatlist will lead user to MediInforScreen 
  // to show that medicine details with reminders.
  handleClick = (dataInfor) => {
    this.props.navigation.navigate("MediInfoScreen", dataInfor)
  }

  // Information appears on each item.
  renderItem = (item) => {
    let dataInfor = {
      image: item.image,
      name: item.name,
      description: item.description,
      barcode: item.barcode
    }
    return (
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => { this.handleClick(dataInfor) }}
      >
        <Image
          source={
            item.image
              ? { uri: item.image }
              : require("../../assets/tempAvatar.jpg")
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  // Responsible for SearchBar to work.
  searchFilterFunction(newText) {
    const newData = this.state.medicines.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase()
      const textData = newText.toUpperCase()
      return itemData.indexOf(textData) > -1
    })
    this.setState({
      myArray: newData,
      text: newText,
    })
  }

  addItem = () => {
    this.props.navigation.navigate("AddMedicine")
  }

  render() {
    let message
    if (this.state.medicineNameList.length == 0) {
      message =
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.emptyText}>You are not currently on medication</Text>
          <Text>Please add a medicine,</Text>
          <Text>or contact your doctor for a prescription</Text>
        </View>
    } else {
      message =
        <FlatList
          style={styles.feed}
          data={this.state.myArray}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
        />
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SearchBar
            placeholder="Search Medicine..."
            lightTheme
            round
            onChangeText={(newText) => this.searchFilterFunction(newText)}
            value={this.state.text}
          />
        </View>
        {message}
        <TouchableOpacity style={styles.addMedicine} onPress={this.addItem}>
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
})