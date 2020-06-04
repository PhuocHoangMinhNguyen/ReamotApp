import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Agenda } from "react-native-calendars";
import firestore from "@react-native-firebase/firestore";

dummyDatabase = {
  name: "Drug Alert Street Drugs Single Kit",
  time: "4:20pm"
}

export default class CalendarScreen extends React.Component {
  state = {
    items: {},
    reminder: []
  };

  componentDidMount() {
    firestore().collection("reminder").onSnapshot((querySnapshot) => {
      let temp = [];

      querySnapshot.forEach((documentSnapshot) => {
        temp.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
      });

      this.setState({ reminder: temp });
    }
    )
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  loadItems(day) {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = this.timeToString(time);
        if (!this.state.items[strTime]) {
          this.state.items[strTime] = [];
          this.state.items[strTime].push({
            name: dummyDatabase.name,
            time: dummyDatabase.time,
            height: Math.max(50, Math.floor(Math.random() * 150))
          });
        }
      }
      const newItems = {};
      Object.keys(this.state.items).forEach(key => {
        newItems[key] = this.state.items[key];
      });
      this.setState({
        items: newItems
      });
    }, 1000);
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Text>This is empty date!</Text>
      </View>
    );
  }

  renderItem(item) {
    return (
      <TouchableOpacity style={styles.item}>
        <Image
          source={require("../assets/tempAvatar.jpg")}
          style={styles.image} />
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text>{item.name}</Text>
          <Text>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Agenda
        items={this.state.items}
        loadItemsForMonth={this.loadItems.bind(this)}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        pastScrollRange={1}
        futureScrollRange={2}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  item: {
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
  }
});
