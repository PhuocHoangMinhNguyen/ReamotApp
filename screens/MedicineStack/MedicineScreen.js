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
      medicineNameList: [],
    };
  }

  componentDidMount() {
    firestore()
      .collection("prescription")
      .onSnapshot((queryPrescriptionSnapshot) => {
        let temp = []
        queryPrescriptionSnapshot.forEach((documentPrescriptionSnapshot) => {
          if (documentPrescriptionSnapshot.data().patientEmail == auth().currentUser.email) {
            temp.push(documentPrescriptionSnapshot.data().name)
            console.log(documentPrescriptionSnapshot.data().name)
          }
        })
        this.setState({ medicineNameList: temp })
        console.log(this.state.medicineNameList.length)
        let temp2 = [];
        for (let i = 0; i < this.state.medicineNameList.length; i++) {
          firestore()
            .collection("medicine")
            .onSnapshot((queryMedicineSnapshot) => {
              queryMedicineSnapshot.forEach((documentMedicineSnapshot) => {
                if (documentMedicineSnapshot.data().name == this.state.medicineNameList[i]) {
                  temp2.push({
                    ...documentMedicineSnapshot.data(),
                    key: documentMedicineSnapshot.id,
                  });
                }
              });
            });
        }
        this.setState({
          medicines: temp2,
          myArray: temp2,
          loading: false,
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
