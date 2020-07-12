import React from "react";
import { StyleSheet, FlatList, Image, View, Text, Button } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";

export default class CalendarScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      medicine: [],
      history: [],
      show: false,
      testDate: new Date(Date.now()),
    }
  }

  componentDidMount() {
    // Check from History
    firestore().collection("history").onSnapshot((querySnapshot) => {
      let temp = [];
      querySnapshot.forEach((documentSnapshot) => {
        if (documentSnapshot.data().patientEmail == auth().currentUser.email) {
          temp.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        }
      })
      this.setState({ history: temp });

      // Check from Medicine
      let temp2 = [];
      for (let i = 0; i < this.state.history.length; i++) {
        firestore().collection("medicine").onSnapshot((querySnapshot2) => {
          querySnapshot2.forEach((documentSnapshot2) => {
            if (documentSnapshot2.data().name == this.state.history[i].medicine) {
              temp2.push({
                ...documentSnapshot2.data(),
                time: this.state.history[i].time,
                date: this.state.history[i].date,
                key: documentSnapshot2.id,
              });
            }
          });
          this.setState({ medicine: temp2 });
        })
      }
    })
  }

  showMode = () => {
    this.setState({ show: true })
  }

  onChangeDate = (event, selectedDate) => {
    const { testDate } = this.state;
    let currentDate = selectedDate || testDate;
    this.setState({
      show: Platform.OS === 'ios',
      testDate: currentDate,
    });
  }

  renderItem(item) {
    const correctItem =
      <View style={styles.feedItem}>
        <Image
          source={
            item.image
              ? { uri: item.image }
              : require("../../assets/tempAvatar.jpg")
          }
          style={styles.image}
        />
        <View style={styles.name}>
          <Text>{item.name}</Text>
          <Text>{item.time}</Text>
        </View>
      </View>
    let message;
    if (item.date == moment(this.state.testDate).format("MMMM Do YYYY")) {
      message = correctItem
    }
    return (
      message
    );
  }

  render() {
    return (
      <View>
        <View style={styles.testDateContainer}>
          <Text style={styles.testDate}>
            {moment(this.state.testDate).format("MMMM Do YYYY")}
          </Text>
        </View>
        <FlatList
          style={styles.feed}
          data={this.state.medicine}
          renderItem={({ item }) => this.renderItem(item)}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.button}>
          <View />
          <Button
            onPress={this.showMode}
            title="Show Calendar"
            color="#018ABE"
          />
        </View>
        {this.state.show && (
          <DateTimePicker
            testID="dateTimePicker"
            timeZoneOffsetInMinutes={0}
            value={this.state.testDate}
            mode="day"
            is24Hour={false}
            display="default"
            onChange={this.onChangeDate}
          />
        )}
      </View>
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
    height: 50,
    borderRadius: 18,
    marginRight: 16,
    marginLeft: 8
  },
  feed: {
    marginHorizontal: 16,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65",
  },
  button: {
    marginVertical: 15,
    marginHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  testDateContainer: {
    alignItems: "center",
    marginTop: 12
  },
  testDate: {
    fontSize: 24,
  }
});
