import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Calendar from "react-calendar";
//import "react-calendar/dist/Calendar.css"

export default class CalendarScreen extends React.Component {
  state = {
    date: new Date()
  };

  onChange = date => this.setState({ date });

  render() {
    return (
      <View style={styles.container}>
        <Text>Calendar Screen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
