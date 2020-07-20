// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make appointment to the doctor or pharmacist of their chosen.
// Status: In development

import React from "react"
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from "react-native"
import { SearchBar } from "react-native-elements"
import firestore from "@react-native-firebase/firestore"

export default class DoctorScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      doc_phar: [],
      text: "",
      myArray: [],
    }
  }

  componentDidMount() {
    let temp = []
    // push doctor data into temp
    firestore().collection("doctor").onSnapshot((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        temp.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
          type: "Doctor"
        })
      })
    })

    // push pharmacist data into temp
    firestore().collection("pharmacist").onSnapshot((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        temp.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
          type: "Pharmacist"
        })
      })
      // put temp data into myArray and doc_phar attributes of state
      this.setState({
        doc_phar: temp,
        myArray: temp,
        loading: false,
      })
    })
  }

  // Click on each item in flatlist will lead user to doctorinfo screen 
  // to show that doctor/pharmacist information with some options.
  handleClick = (dataInfor) => {
    this.props.navigation.navigate("DoctorInfo", dataInfor)
  }

  // Information appears on each item.
  renderItem = (item) => {
    let dataInfor = {
      avatar: item.avatar,
      name: item.name,
      type: item.type,
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

  // Responsible for SearchBar to work.
  searchFilterFunction(newText) {
    const newData = this.state.doc_phar.filter(function (item) {
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

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SearchBar
            placeholder="Search Doctor/ Pharmacist..."
            lightTheme
            round
            onChangeText={(newText) => this.searchFilterFunction(newText)}
            value={this.state.text}
          />
        </View>
        <FlatList
          style={styles.feed}
          data={this.state.myArray}
          renderItem={({ item }) => this.renderItem(item)}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBECF4",
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
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65",
  },
})