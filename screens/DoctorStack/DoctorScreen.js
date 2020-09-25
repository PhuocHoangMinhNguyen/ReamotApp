// Author: Phuoc Hoang Minh Nguyen
// Description: Showing Doctors and Pharmacists who have access to user's information.
// Status: Optimized

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  Image,
  Dimensions
} from "react-native";
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"

var tempAvatar = require("../../assets/tempAvatar.jpg")
var background = require('../../assets/background.png')

class DoctorScreen extends Component {
  state = {
    accessedDoctor: [],
    accessedPharmacist: [],
  }

  unsubscribe = null

  componentDidMount() {
    // check doctor and pharmacist email from "doctorList" and "pharmacistList" from "users" collection
    // Then use the doctor and pharmacist email to find the infor from "doctor" and "pharmacist" collection

    // doctor and pharmacist email from "users" document
    let tempPharmacistEmail = []
    let tempDoctorEmail = []

    // doctor and pharmacist info using emails from "users" document
    //let tempAccessedDoctor = []
    //let tempAccessedPharmacist = []

    this.unsubscribe = firestore().collection("users").doc((auth().currentUser || {}).uid)
      .onSnapshot(documentSnapshot => {
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
            firestore().collection("doctor")
              .where('doctorEmail', 'in', tempDoctorEmail)
              .onSnapshot(querySnapshot => {
                let tempAccessedDoctor = []
                querySnapshot.forEach(documentSnapshot => {
                  tempAccessedDoctor.push({
                    ...documentSnapshot.data(),
                    key: documentSnapshot.id,
                    type: "Doctor"
                  })
                })
                this.setState({ accessedDoctor: tempAccessedDoctor })
              })
          }
          if (tempPharmacistEmail != null) {
            // Accessed Pharmacist
            firestore().collection("pharmacist")
              .where('pharmacistEmail', 'in', tempPharmacistEmail)
              .onSnapshot(querySnapshot => {
                let tempAccessedPharmacist = []
                querySnapshot.forEach(documentSnapshot => {
                  tempAccessedPharmacist.push({
                    ...documentSnapshot.data(),
                    key: documentSnapshot.id,
                    type: "Pharmacist"
                  })
                })
                this.setState({ accessedPharmacist: tempAccessedPharmacist })
              })
          }
        }
      })
  }

  componentWillUnmount() {
    this.unsubscribe()
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
      email: emailInfo,
      id: item.key
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
              : tempAvatar
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
    let message
    if (this.state.accessedDoctor.length == 0 && this.state.accessedPharmacist.length == 0) {
      message =
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.emptyText}>You have no accessed doctor</Text>
          <Text style={styles.emptyText}>and accessed pharmacist</Text>
        </View>
    } else {
      message =
        <SectionList style={styles.feed}
          sections={[
            { title: "Accessed Doctor", data: this.state.accessedDoctor },
            { title: "Accessed Pharmacist", data: this.state.accessedPharmacist },
          ]}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => this.renderItem(item)}
          renderSectionHeader={({ section: { title } }) => {
            if (title === 'Accessed Doctor') {
              return <Text style={styles.headerWhite}>{title}</Text>
            } else {
              return <Text style={styles.header}>{title}</Text>
            }
          }}
        />
    }
    return (
      <View style={styles.container}>
        <Image style={styles.containter}
          source={background}
        />
        <Text style={styles.header1}>{`Doctors & Pharmacists`}</Text>
        <Text style={styles.header2}>{`Doctors and pharmacists who have accessed to your medication records`}</Text>
        {message}
        <TouchableOpacity style={styles.button} onPress={this.addAccess}>
          <Text style={{ color: "#FFF" }}>Give Access to Another Doctor/ Pharmacist</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containter: {
    width: Dimensions.get("window").width, //for full screen
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8
  },
  header: {
    fontSize: 18,
    color: '#000'
  },
  headerWhite: {
    fontSize: 18,
    color: '#FFF'
  },
  title: {
    fontSize: 24
  },
  feed: {
    marginTop: 26,
    marginHorizontal: 16,
  },
  feedItem: {
    backgroundColor: "#ddd",
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
  },
  emptyText: {
    fontWeight: "bold",
    fontSize: 20
  },
  header1: {
    color: "#FFF",
    marginHorizontal: 16,
    marginTop: -150,
    fontSize: 24
  },
  header2: {
    color: "#FFF",
    marginHorizontal: 16,
  }
})

export default DoctorScreen