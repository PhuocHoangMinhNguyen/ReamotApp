// Author: Phuoc Hoang Minh Nguyen
// Description: Used as a backup plan for HomeStack
// Status: In development

import React from "react"
import { Text, StyleSheet, FlatList, SafeAreaView, Image, TouchableOpacity, View } from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      medicines: [],
      reminder: [],
    };
  }

  componentDidMount() {
    // To take user's medicine based on medicine listed in "prescription" collection.\
    firestore().collection("reminder").onSnapshot((queryReminderSnapshot) => {
      let temp = []
      queryReminderSnapshot.forEach((documentReminderSnapshot) => {
        if (documentReminderSnapshot.data().patientEmail == auth().currentUser.email) {
          temp.push({
            ...documentReminderSnapshot.data(),
            key: documentReminderSnapshot.id
          })
        }
      })
      this.setState({ reminder: temp })
      let temp2 = [];
      // Problem: Because setstate is inside for loop, if reminder.length == 0
      // this.state.medicines wont be update.
      if (this.state.reminder.length == 0) {
        this.setState({ medicines: [] })
      } else {
        for (let i = 0; i < this.state.reminder.length; i++) {
          firestore().collection("medicine").onSnapshot((queryMedicineSnapshot) => {
            queryMedicineSnapshot.forEach((documentMedicineSnapshot) => {
              if (documentMedicineSnapshot.data().name == this.state.reminder[i].medicine) {
                temp2.push({
                  ...documentMedicineSnapshot.data(),
                  time: this.state.reminder[i].times,
                  key: documentMedicineSnapshot.id,
                });
              }
            });
            this.setState({ medicines: temp2 })
          })
        }
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
        <Image
          source={
            item.image
              ? { uri: item.image }
              : require("../../assets/tempAvatar.jpg")
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.name}>{item.time}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    let message
    if (this.state.medicines.length == 0) {
      message =
        <View style={{ flex: 1, marginTop: -150, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.emptyText}>You have no active reminder</Text>
          <Text>Please add a medicine,</Text>
          <Text>or contact your doctor for a prescription</Text>
        </View>
    } else {
      message =
        <FlatList
          style={styles.feed}
          data={this.state.medicines}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
        />
    }
    return (
      <SafeAreaView style={styles.container}>
        <Image style={{ width: 350, height: 350, borderRadius: 180 }}
          source={require('../../assets/GrowingTree.jpg')} />
        {message}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
    alignItems: 'center'
  },
  feed: {
    marginHorizontal: 16,
    paddingVertical: 20
  },
  feedItem: {
    backgroundColor: '#004481',
    borderRadius: 10,
    padding: 7,
    margin: 4,
    width: 120,
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
    color: "white",
  },
  emptyText: {
    fontWeight: "bold",
    fontSize: 20
  },
})