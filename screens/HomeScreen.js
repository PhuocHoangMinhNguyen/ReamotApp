import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Agenda } from "react-native-calendars";

export default class HomeScreen extends React.Component {
  state = {
    items: {}
  };

  renderItem(item) {
    return (
      <TouchableOpacity style={styles.item}>
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <Agenda
        items={this.state.items}
        renderItem={this.renderItem.bind(this)}
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
    marginTop: 17
  }
});
