// Author: Phuoc Hoang Minh Nguyen
// Description: Showing Doctors and Pharmacists who have access to user medical information.
// Status: Optimized

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  SectionList,
  TouchableOpacity,
  Image,
} from "react-native";
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"

export default class DoctorScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      accessedDoctor: [],
      accessedPharmacist: [],
    }
  }

  componentDidMount() {
    // check doctor and pharmacist email from "doctorList" and "pharmacistList" from "users" collection
    // Then use the doctor and pharmacist email to find the infor from "doctor" and "pharmacist" collection

    // doctor and pharmacist email from "users" document
    let tempPharmacistEmail = []
    let tempDoctorEmail = []

    // doctor and pharmacist info using emails from "users" document
    //let tempAccessedDoctor = []
    //let tempAccessedPharmacist = []

    firestore().collection("users").doc((auth().currentUser || {}).uid)
      .onSnapshot((documentSnapshot) => {
        tempPharmacistEmail = documentSnapshot.data().pharmacistList
        tempDoctorEmail = documentSnapshot.data().doctorList

        // if both tempDoctorEmail and tempPharmacistEmail are null.
        if (tempDoctorEmail == null && tempPharmacistEmail == null) {
          // TempDoctorPharmacist is null
          tempDoctorPharmacist = null

          // If they are not null
        } else {
          if (tempDoctorEmail != null) {

            // Accessed Doctor
            firestore().collection("doctor").onSnapshot((querySnapshot) => {
              let tempAccessedDoctor = []
              querySnapshot.forEach((documentSnapshot) => {
                for (let i = 0; i < tempDoctorEmail.length; i++) {
                  if (tempDoctorEmail[i] == documentSnapshot.data().doctorEmail) {
                    tempAccessedDoctor.push({
                      ...documentSnapshot.data(),
                      key: documentSnapshot.id,
                      type: "Doctor"
                    })
                  }
                }
              })
              this.setState({ accessedDoctor: tempAccessedDoctor })
            })
          }
          if (tempPharmacistEmail != null) {
            // Accessed Pharmacist
            firestore().collection("pharmacist").onSnapshot((querySnapshot) => {
              let tempAccessedPharmacist = []
              querySnapshot.forEach((documentSnapshot) => {
                for (let i = 0; i < tempPharmacistEmail.length; i++) {
                  if (tempPharmacistEmail[i] == documentSnapshot.data().pharmacistEmail) {
                    tempAccessedPharmacist.push({
                      ...documentSnapshot.data(),
                      key: documentSnapshot.id,
                      type: "Pharmacist"
                    })
                  }
                }
              })
              this.setState({ accessedPharmacist: tempAccessedPharmacist })
            })
          }
        }
      })
  }

  handleClick = (dataInfor) => {
    this.props.navigation.navigate("AccessedDoctorScreen", dataInfor)
  }

  addAccess = () => {
    this.props.navigation.navigate("AddAccess")
  }

  renderItem = (item) => {
    let emailInfo
    if (item.type == "Doctor") {
      emailInfo = item.doctorEmail
    } else {
      emailInfo = item.pharmacistEmail
    }
    let dataInfor = {
      avatar: item.avatar,
      name: item.name,
      type: item.type,
      email: emailInfo
    }
    return (
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => {
          this.handleClick(dataInfor)
        }}
      >
        <Image
          source={
            item.avatar
              ? { uri: item.avatar }
              : require("../../assets/tempAvatar.jpg")
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text>{item.type}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <SectionList style={styles.feed}
          sections={[
            { title: "Accessed Doctor", data: this.state.accessedDoctor },
            { title: "Accessed Pharmacist", data: this.state.accessedPharmacist },
          ]}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => this.renderItem(item)}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.header}>{title}</Text>
          )}
        />
        <TouchableOpacity style={styles.button} onPress={this.addAccess}>
          <Text style={{ color: "#FFF" }}>Give Access to Another Doctor/ Pharmacist</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8
  },
  header: {
    fontSize: 18,
    fontWeight: "bold"
  },
  title: {
    fontSize: 24
  },
  feed: {
    marginTop: 16,
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
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    marginVertical: 12,
    marginHorizontal: 16
  }
})

