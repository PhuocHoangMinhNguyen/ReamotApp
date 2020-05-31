import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Button, FlatList } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export default class MediInfoScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      medicine: {},
      prescription: {},
      reminder: [],
      arraySize: 0,
    };
  }

  componentDidMount() {
    //Get data from Medicine Screen
    let paramsFromMedicineScreen = this.props.navigation.state.params;
    this.setState({ medicine: paramsFromMedicineScreen });

    // Get Prescription data to know number of times.
    firestore().collection("prescription").onSnapshot((querySnapshot) => {
      let tempValue = 0;
      let tempValue2 = 0;

      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email
          && documentSnapshot.data().name == this.props.navigation.state.params.name) {
          tempValue = parseInt(documentSnapshot.data().times, 10)
          tempValue2 = parseInt(documentSnapshot.data().number, 10)
        }
      });
      this.setState({
        prescription: {
          times: tempValue,
          number: tempValue2
        }
      });
    }
    )

    // Get Reminder data
    firestore().collection("reminder").onSnapshot((querySnapshot) => {
      let temp = [];
      let counting = 0;

      querySnapshot.forEach((documentSnapshot) => {
        temp.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
        counting++;
      });

      this.setState({ reminder: temp, arraySize: counting });
    }
    )
  };

  handleNewReminder = () => {
    this.props.navigation.navigate("NewReminder", this.props.navigation.state.params)
  }
  handleChangeReminder = () => {
    this.props.navigation.navigate("ChangeReminder", {
      medicine: this.props.navigation.state.params,
    })
  }

  renderItem = (item) => {
    const nonEmptyItem =
      <View style={styles.prescription}>
        <Text style={styles.time}>{item.times}</Text>
        <Button style={styles.edit} title="Edit" onPress={this.handleChangeReminder} />
      </View>;
    const emptyItem =
      <TouchableOpacity style={styles.reminder} onPress={this.handleNewReminder}>
        <Text style={{ fontSize: 20 }}>+ Add Reminder</Text>
      </TouchableOpacity>;
    let message;
    if (item == "null") {
      message = emptyItem
    } else {
      message = nonEmptyItem
    }
    return (
      message
    );
  };

  render() {
    let database;
    if (this.state.arraySize < this.state.prescription.times) {
      for (let i = this.state.arraySize; i < this.state.prescription.times; i++) {
        this.state.reminder.push("null")
      }
    }
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

        <View style={styles.prescription}>
          <Text style={styles.time}>{this.state.prescription.number}</Text>
          <Text style={styles.time}>{this.state.prescription.times} times</Text>
          <Text style={styles.repeat}>Daily</Text>
        </View>

        <FlatList
          data={this.state.reminder}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
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
    marginVertical: 24,
    fontSize: 20
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
    justifyContent: "space-evenly"
  },
  prescription: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  time: {
    fontSize: 20
  },
  repeat: {
    fontSize: 20
  },
});
