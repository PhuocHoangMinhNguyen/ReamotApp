// Author: Phuoc Hoang Minh Nguyen
// Description: Used as a backup plan for HomeStack
// Status: In development

import React from "react"
import { Text, StyleSheet, FlatList, SafeAreaView, Image, TouchableOpacity } from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import Toast from "react-native-simple-toast"

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      medicines: [],
      medicineNameList: [],
    };
  }

  componentDidMount() {
    // To take user's medicine based on medicine listed in "prescription" collection.\
    if (auth().currentUser.emailVerified) {
      Toast.show("True")
    } else {
      Toast.show("False")
    }
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
          this.setState({ medicines: temp2 })
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
      barcode: item.barcode
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
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Image style={{ width: 350, height: 350, borderRadius: 180 }}
          source={require('../../assets/GrowingTree.jpg')} />
        <FlatList
          style={styles.feed}
          data={this.state.medicines}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
          horizontal={true}
        />
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
})