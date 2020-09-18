// Author: Phuoc Hoang Minh Nguyen
// Description: Used to show patient's taking medication history
// Status: Optimized

import React from "react"
import {
  StyleSheet,
  FlatList,
  Image,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import DatePicker from '@react-native-community/datetimepicker'
import moment from "moment"
import { ProgressChart } from "react-native-chart-kit"

var tempAvatar = require("../../assets/tempAvatar.jpg")

class CalendarScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  }

  state = {
    medicine: [],
    show: false,
    testDate: new Date(Date.now()),
    chartData: {
      data: []
    },
    missedLength: 0,
    takenLength: 0,
    chartConfig: {
      backgroundGradientFrom: "#FFF",
      backgroundGradientTo: "#FFF",
      color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
    }
  }

  calculate = async () => {
    // Get history documents with status missed to calculate percentage
    let docsMissedLength = 0
    const missedCollection = firestore().collection('history')
      .where('patientEmail', '==', auth().currentUser.email)
      .where('date', '==', moment(this.state.testDate).format('MMMM Do YYYY'))
      .where('status', '==', "missed")
    await missedCollection.get().then((querySnapshot) => {
      docsMissedLength = querySnapshot.docs.length
    })

    // Get history documents with status taken to calculate percentage
    let docsTakenLength = 0
    const takenCollection = firestore().collection('history')
      .where('patientEmail', '==', auth().currentUser.email)
      .where('date', '==', moment(this.state.testDate).format('MMMM Do YYYY'))
      .where('status', '==', "taken")
    await takenCollection.get().then((querySnapshot) => {
      docsTakenLength = querySnapshot.docs.length
    })

    // calculate percentage
    const percentageArray = []
    const percentage = (docsTakenLength * 1.0) / (docsTakenLength + docsMissedLength)

    // decide color
    let r = 0
    let g = 0
    let b = 0
    if (percentage <= 0.5) {
      r = 255
      g = 0
      b = 0
    } else if (percentage >= 0.75) {
      r = 0
      g = 255
      b = 0
    } else {
      r = 255
      g = 127
      b = 0
    }

    percentageArray[0] = percentage
    // tag it to this.state.chartData.data
    this.setState({
      chartData: {
        ...this.state.chartData, data: percentageArray
      },
      chartConfig: {
        ...this.state.chartConfig, color: (opacity = 1) => `rgba(${r}, ${g}, ${b}, ${opacity})`
      }
    })
  }

  loadItems = () => {
    firestore().collection("history")
      .where('patientEmail', '==', auth().currentUser.email)
      .where('date', '==', moment(this.state.testDate).format('MMMM Do YYYY'))
      .onSnapshot(querySnapshot => {
        let result = []
        querySnapshot.forEach(documentSnapshot => {
          firestore().collection("medicine")
            .where('name', '==', documentSnapshot.data().medicine).get()
            .then(queryMedicineSnapshot => {
              let docs = queryMedicineSnapshot.docs
              for (let doc of docs) {
                const selectedItem = {
                  ...doc.data(),
                  ...documentSnapshot.data(),
                  key: documentSnapshot.id
                }
                result.push(selectedItem)
              }
            }).then(() => {
              this.setState({ medicine: result })
            })
        })
      })
    this.calculate()
  }

  componentDidMount() {
    this.loadItems()
  }

  // Show DatePicker
  showMode = () => {
    this.setState({ show: true })
  }

  // When a date is chosen from DatePicker
  onChange = (event, selectedDate) => {
    const { testDate } = this.state
    const currentDate = selectedDate || testDate;
    this.setState({
      show: Platform.OS === 'ios',
      testDate: currentDate,
    })
    this.loadItems()
  }

  // Information appears on each item.
  renderItem(item) {
    const correctItem =
      <SafeAreaView style={item.status == "taken" ? styles.feedItem : styles.missedItem}>
        <Image style={styles.image}
          source={item.image ? { uri: item.image } : tempAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={item.status == "taken" ? styles.name : styles.missedName}>{item.name}</Text>
          <Text style={item.status == "taken" ? styles.blank : styles.missedTime}>
            {`${item.startTime.toDate().getHours()}:${item.startTime.toDate().getMinutes()}`}
          </Text>
        </View>
      </SafeAreaView>
    if (item.date == moment(this.state.testDate).format("MMMM Do YYYY")) {
      return correctItem
    } else {
      // Blank text used so that the list can be processed normally
      return <Text style={{ height: 0.1 }}></Text>
    }
  }

  render() {
    const { testDate, medicine, show, chartConfig } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.testDateContainer}>
          <Text style={styles.testDate}>
            {moment(testDate).format("MMMM Do YYYY")}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={this.showMode}>
          <Text style={styles.buttonText}>Show Calendar</Text>
        </TouchableOpacity>
        {show && (
          <DatePicker
            value={testDate}
            mode="date"
            onChange={this.onChange}
          />
        )}
        <FlatList
          style={styles.feed}
          data={medicine}
          renderItem={({ item }) => this.renderItem(item)}
        />
        <View style={styles.chart}>
          <Text style={styles.chartHeader}>Day Progress</Text>
          <ProgressChart
            data={this.state.chartData.data}
            width={Dimensions.get("window").width}
            height={160}
            strokeWidth={20}
            radius={50}
            chartConfig={chartConfig}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
  },
  feedItem: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    padding: 8,
    flexDirection: "row",
    marginVertical: 8,
  },
  missedItem: {
    backgroundColor: "#FF0000",
    borderRadius: 5,
    padding: 8,
    flexDirection: "row",
    marginVertical: 8,
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
    fontSize: 15,
    fontWeight: "500",
    color: "#454D65",
  },
  missedName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  missedTime: {
    color: "#FFF",
  },
  button: {
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    width: 110,
    height: 40,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    marginVertical: 16,
    marginEnd: 16
  },
  buttonText: {
    color: "#FFF"
  },
  testDateContainer: {
    alignItems: "center",
    marginTop: 30
  },
  testDate: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000"
  },
  chart: {
    backgroundColor: "#FFF",
    marginBottom: 30
  },
  chartHeader: {
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    color: "#000"
  }
})

export default CalendarScreen