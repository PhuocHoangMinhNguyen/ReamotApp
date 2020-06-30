import React from "react";
import { StyleSheet, FlatList, TouchableOpacity, Image, View, Text } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export default class CalendarScreen extends React.Component {
  state = {
    medicine: [],
    reminder: []
  };

  componentDidMount() {
    // Check from Reminder
    firestore().collection("reminder").onSnapshot((querySnapshot) => {
      let temp = [];
      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientName == auth().currentUser.email) {
          temp.push(documentSnapshot.data().medicine);
        }
      })
      this.setState({ reminder: temp });

      // Check from Medicine
      let temp2 = [];
      for (let i = 0; i < this.state.reminder.length; i++) {
        firestore().collection("medicine").onSnapshot((queryReminderSnapshot) => {
          queryReminderSnapshot.forEach((documentReminderSnapshot) => {
            if (documentReminderSnapshot.data().name == this.state.reminder[i]) {
              temp2.push({
                ...documentReminderSnapshot.data(),
                key: documentReminderSnapshot.id,
              });
            }
          });
          this.setState({ medicine: temp2 });
        })
      }
    })
  }

  renderItem(item) {
    return (
      <View style={styles.feedItem}>
        <Image
          source={
            item.image
              ? { uri: item.image }
              : require("../../assets/tempAvatar.jpg")
          }
          style={styles.image}
        />
        <Text style={styles.name}>{item.name}</Text>
      </View>
    );
  }

  render() {
    return (
      <FlatList
        style={styles.feed}
        data={this.state.medicine}
        renderItem={({ item }) => this.renderItem(item)}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  feedItem: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    flexDirection: "row"
  },
  image: {
    width: 50,
    height: 50
  },
  feed: {
    marginHorizontal: 16,
  },
});
