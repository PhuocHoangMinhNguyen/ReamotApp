import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default class MediInfoScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    //this.handlePress = this.handlePress.bind(this);
    this.state = {
      medicine: {},
    };
  }

  componentDidMount() {
    let paramsFromMedicineScreen = this.props.navigation.state.params;
    this.setState({ medicine: paramsFromMedicineScreen });
  }

  handlePress = () => {
    this.props.navigation.navigate("Reminder", this.props.navigation.state.params)
  }

  render() {
    let dataReminder = {
      image: "",
      name: ""
    };
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="ios-arrow-round-back" size={32} color="#FFF" />
        </TouchableOpacity>
        <View style={{ marginHorizontal: 16 }}>
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
        </View>
        <Button
          onPress={this.handlePress}
          title="Change Reminder"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    position: "absolute",
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
  },
  description: {
    marginTop: 12
  }
});
