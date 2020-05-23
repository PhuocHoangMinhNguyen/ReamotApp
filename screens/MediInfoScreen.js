import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Button, FlatList } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import firestore from "@react-native-firebase/firestore";

export default class MediInfoScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    //this.handlePress = this.handlePress.bind(this);
    this.state = {
      medicine: {},
      reminder: [],
    };
  }

  componentDidMount() {
    let paramsFromMedicineScreen = this.props.navigation.state.params;
    this.setState({ medicine: paramsFromMedicineScreen });

    firestore().collection("prescription").onSnapshot((querySnapshot) => {
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
  };

  handlePress = () => {
    this.props.navigation.navigate("Reminder", this.props.navigation.state.params)
  }

  renderItem = (item) => {
    console.log(item)
    return (
      <View style={styles.reminder}>
        <Text style={styles.time}>8:00AM</Text>
        <Text style={styles.repeat}>Daily</Text>
        <Button style={styles.edit} title="Edit" onPress={this.handlePress} />
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="ios-arrow-round-back" size={32} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.information}>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={
                this.state.medicine.image
                  ? { uri: this.state.medicine.image }
                  : require("../assets/tempAvatar.jpg")
              }
              style={styles.image}
            />
            <Text style={styles.name}>{this.state.medicine.name}</Text>
          </View>
          <Text style={styles.description}>{this.state.medicine.description}</Text>
        </View>

        <View style={styles.reminder}>
          <Text style={styles.time}>8:00AM</Text>
          <Text style={styles.repeat}>Daily</Text>
          <Button style={styles.edit} title="Edit" onPress={this.handlePress} />
        </View>

        <FlatList
          data={this.state.reminder}
          renderItem={({ item }) => this.renderItem(item)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    flex: 1,
  },
  back: {
    position: "absolute",
    marginTop: -70,
    top: 24,
    left: 32,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(21, 22, 48, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 100,
    height: 100
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    marginVertical: 24
  },
  information: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  description: {
    marginTop: 12
  },
  reminder: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  time: {
    fontSize: 25
  },
  repeat: {
    fontSize: 25
  }
});
