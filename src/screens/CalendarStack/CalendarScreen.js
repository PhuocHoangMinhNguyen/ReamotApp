// Author: Phuoc Hoang Minh Nguyen
// Description: Used to show patient's taking medication history
// Status: Optimized

import React from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DatePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { ProgressChart } from 'react-native-chart-kit';
import Background from '../../components/Background';

var tempAvatar = require('../../assets/images/tempAvatar.png');

// Module-level cache: avoids re-fetching the medicine catalogue on every
// navigation to CalendarScreen (each mount creates a new component instance).
let _medicineCache = null;

class CalendarScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  state = {
    medicine: [],
    show: false,
    testDate: new Date(Date.now()),
    chartData: {
      data: [],
    },
    missedLength: 0,
    takenLength: 0,
    chartConfig: {
      backgroundGradientFrom: '#DEE8F1',
      backgroundGradientTo: '#DEE8F1',
      color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
    },
    loading: true,
  };

  medicineMap = new Map();
  historyUnsubscribe = null;
  loadToken = 0;

  // calculate chart data from snapshot counts (no extra Firestore reads)
  calculate = (takenLength, missedLength) => {
    const total = takenLength + missedLength;
    const safePercentage = total === 0 ? 0 : takenLength / total;

    // decide color
    let r = 0;
    let g = 0;
    let b = 0;
    if (safePercentage <= 0.5) {
      r = 255;
      g = 0;
      b = 0;
    } else if (safePercentage >= 0.75) {
      r = 0;
      g = 255;
      b = 0;
    } else {
      r = 255;
      g = 127;
      b = 0;
    }

    this.setState({
      chartData: {
        ...this.state.chartData,
        data: [safePercentage],
      },
      chartConfig: {
        ...this.state.chartConfig,
        color: (opacity = 1) => `rgba(${r}, ${g}, ${b}, ${opacity})`,
      },
    });
  };

  // Load the history of taking medicine for day chosen and the information of medicines
  // appeared in the history.
  // Then calculate some value to show the progress chart
  loadItems = () => {
    if (this.historyUnsubscribe) {
      this.historyUnsubscribe();
    }
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return;
    }
    this.loadToken += 1;
    this.historyUnsubscribe = firestore()
      .collection('history')
      .where('patientEmail', '==', currentUser.email)
      .where('date', '==', moment(this.state.testDate).format('MMMM Do YYYY'))
      .onSnapshot(querySnapshot => {
        let result = [];
        let takenLength = 0;
        let missedLength = 0;
        querySnapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          const med = this.medicineMap.get(data.medicine);
          if (med) {
            result.push({
              ...med,
              ...data,
              key: documentSnapshot.id,
            });
          }
          if (data.status === 'taken') {
            takenLength++;
          } else if (data.status === 'missed') {
            missedLength++;
          }
        });
        this.setState({ medicine: result, loading: false });
        this.calculate(takenLength, missedLength);
      });
  };

  async componentDidMount() {
    if (_medicineCache) {
      this.medicineMap = _medicineCache;
    } else {
      const medSnapshot = await firestore().collection('medicine').get();
      medSnapshot.forEach(doc => {
        this.medicineMap.set(doc.data().name, doc.data());
      });
      _medicineCache = this.medicineMap;
    }
    this.loadItems();
  }

  componentWillUnmount() {
    if (this.historyUnsubscribe) {
      this.historyUnsubscribe();
    }
  }

  // Show DatePicker
  showMode = () => {
    this.setState({ show: true });
  };

  // When a date is chosen from DatePicker
  onChange = (_event, selectedDate) => {
    const { testDate } = this.state;
    const currentDate = selectedDate || testDate;
    this.setState({ show: Platform.OS === 'ios', testDate: currentDate }, () =>
      this.loadItems(),
    );
  };

  // Information appears on each item.
  renderItem(item) {
    return (
      <SafeAreaView
        style={item.status === 'taken' ? styles.feedItem : styles.missedItem}
      >
        <FastImage
          style={styles.image}
          source={item.image ? { uri: item.image } : tempAvatar}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.missedName}>{item.name}</Text>
          <Text style={styles.missedTime}>
            {item.startTime
              ? moment(item.startTime.toDate()).format('hh:mm a')
              : ''}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  render() {
    const { testDate, medicine, show, chartConfig, loading } = this.state;
    return (
      <View style={styles.container}>
        <Background />
        <Text style={styles.header}>History</Text>
        <Text style={styles.header1}>
          Patient's history of taking medicine per day
        </Text>
        <Text style={styles.testDate}>
          {moment(testDate).format('MMMM Do YYYY')}
        </Text>
        <TouchableOpacity style={styles.button} onPress={this.showMode}>
          <Text style={styles.buttonText}>Show Calendar</Text>
        </TouchableOpacity>
        {show && (
          <DatePicker value={testDate} mode="date" onChange={this.onChange} />
        )}
        {loading ? (
          <ActivityIndicator size="large" color="#1565C0" style={styles.feed} />
        ) : (
          <FlatList
            style={styles.feed}
            data={medicine}
            renderItem={({ item }) => this.renderItem(item)}
          />
        )}
        <View style={styles.chart}>
          <Text style={styles.chartHeader}>Day Progress</Text>
          {medicine.length > 0 ? (
            <ProgressChart
              data={this.state.chartData.data}
              width={Dimensions.get('window').width}
              height={160}
              strokeWidth={20}
              radius={50}
              chartConfig={chartConfig}
            />
          ) : (
            <Text style={styles.chartBody}>No Medicine Taken/Missed</Text>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  feedItem: {
    backgroundColor: '#004481',
    borderRadius: 5,
    padding: 8,
    flexDirection: 'row',
    marginVertical: 8,
  },
  missedItem: {
    backgroundColor: '#FF0000',
    borderRadius: 5,
    padding: 8,
    flexDirection: 'row',
    marginVertical: 8,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    marginLeft: 8,
  },
  feed: {
    marginHorizontal: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#454D65',
  },
  missedName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  missedTime: {
    color: '#FFF',
  },
  button: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    height: 40,
    backgroundColor: '#1565C0',
    borderRadius: 4,
    marginVertical: 12,
    marginEnd: 16,
  },
  buttonText: {
    color: '#FFF',
  },
  header: {
    fontSize: 24,
    color: '#FFF',
    marginTop: -150,
    marginHorizontal: 16,
  },
  header1: {
    color: '#FFF',
    marginHorizontal: 16,
  },
  testDate: {
    fontSize: 20,
    color: '#FFF',
    marginHorizontal: 16,
    marginTop: 8,
  },
  chart: {
    backgroundColor: '#DEE8F1',
  },
  chartHeader: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
  },
  chartBody: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
    marginTop: 30,
    height: 120,
  },
  itemInfo: {
    flex: 1,
  },
});

export default CalendarScreen;
