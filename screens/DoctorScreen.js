import React from "react";
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { SearchBar } from "react-native-elements";
import firestore from "@react-native-firebase/firestore";

export default class DoctorScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      doc_phar: [],
      text: "",
      myArray: [],
    }
  }

  unsubscribe = null;

  componentDidMount() {
    this.unsubscribe = firestore()
      .collection("doctor")
      .onSnapshot((querySnapshot) => {
        let temp = [];

        querySnapshot.forEach((documentSnapshot) => {
          temp.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });

        this.setState({
          doc_phar: temp,
          myArray: temp,
          loading: false,
        });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleClick = (dataInfor) => {
    //this.props.navigation.navigate("DoctorInfo", dataInfor);
    this.props.navigation.navigate("DoctorInfo");
  }

  renderItem = (item) => {
    let dataInfor = {
      avatar: item.avatar,
      name: item.name,
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
            item.avatar
              ? { uri: item.avatar }
              : require("../assets/tempAvatar.jpg")
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  searchFilterFunction(newText) {

  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <SearchBar
            placeholder="Search Doctor..."
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
