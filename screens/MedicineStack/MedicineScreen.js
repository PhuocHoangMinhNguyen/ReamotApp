import React from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { SearchBar } from "react-native-elements";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export default class MedicineScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      medicines: [],
      text: "",
      myArray: [],
    };
  }

  componentDidMount() {
    firestore()
      .collection("prescription")
      .onSnapshot((queryPrescriptionSnapshot) => {
        queryPrescriptionSnapshot.forEach((documentPrescriptionSnapshot) => {
          if (documentPrescriptionSnapshot.data().patientEmail == auth().currentUser.email) {
            firestore()
              .collection("medicine")
              .onSnapshot((queryMedicineSnapshot) => {
                let temp = [];

                queryMedicineSnapshot.forEach((documentMedicineSnapshot) => {
                  if (documentMedicineSnapshot.data().name == documentPrescriptionSnapshot.data().name) {
                    temp.push({
                      ...documentMedicineSnapshot.data(),
                      key: documentMedicineSnapshot.id,
                    });
                  }
                });

                this.setState({
                  medicines: temp,
                  myArray: temp,
                  loading: false,
                });
              });
          }
        });
      });
  }

  handleClick = (dataInfor) => {
    this.props.navigation.navigate("MediInfo", dataInfor);
  }

  renderItem = (item) => {
    let dataInfor = {
      image: item.image,
      name: item.name,
      description: item.description
    };
    return (
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => {
          this.handleClick(dataInfor);
        }}
      >
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
    );
  };

  searchFilterFunction(newText) {
    const newData = this.state.medicines.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
      const textData = newText.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      myArray: newData,
      text: newText,
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SearchBar
            placeholder="Search Medicine..."
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
    );
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
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65",
  },
});
