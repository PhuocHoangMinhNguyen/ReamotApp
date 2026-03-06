// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make a new daily reminder
// Status: Optimized

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';
import ReactNativeAN from 'react-native-alarm-notification';
import TimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import Background from '../../../components/Background';

// Notification Data Structure.
const alarmNotifData = {
  schedule_type: 'once',
  channel: 'reminder',
  loop_sound: true,
  message: 'Take your Medicine',
};

var tempAvatar = require('../../../assets/images/tempAvatar.png');

class NewReminder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      medicine: {},
      timePicker: {
        // Used for TimePicker
        testDate: new Date(Date.now()),
        // Used to show TimePicker
        show: false,
      },
      alarm: {
        // Details in Problems.txt file, Problem 1
        reminderId: Math.floor(Math.random() * 1e9).toString(),
        // Used for react-native-alarm-notification package
        fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
      },
      number: 0,
      scheduling: false,
    };
    this.scheduleAlarm = this.scheduleAlarm.bind(this);
  }

  componentDidMount() {
    this._mounted = true;
    // Take medicine data from MedicineScreen, including image, name, description, and barcode.
    // => Faster than accessing Cloud Firestore again.
    this.setState({
      medicine: this.props.route.params.medicine,
      number: this.props.route.params.number,
    });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  // This function called after the alarm is set.
  getANid = async details => {
    const { reminderId } = this.state.alarm;
    const { name } = this.state.medicine;
    const { testDate } = this.state.timePicker;
    // Retry until the native alarm appears in the list (up to 10 × 100ms)
    let idAN = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const alarm = await ReactNativeAN.getScheduledAlarms();
      for (let i = 0; i < alarm.length; i++) {
        if (alarm[i].alarmId === details.alarm_id) {
          idAN = alarm[i].id;
          break;
        }
      }
      if (idAN !== '') {
        break;
      }
    }
    // Officially add the alarm details into Firebase, alarm id is also from reminderId
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Toast.show('Session expired, please log in again');
      return;
    }
    firestore()
      .collection('reminder')
      .add({
        alarmId: reminderId,
        idAN: idAN,
        medicine: name,
        type: 'Daily',
        time: testDate,
        patientEmail: currentUser.email,
        numberOfPills: this.state.number,
      })
      .then(() => {
        Toast.show('Reminder Set!');
        if (this._mounted) {
          this.props.navigation.goBack();
        }
      });
  };

  // This function called when Schedule Alarm button is clicked
  scheduleAlarm = async () => {
    if (this.state.scheduling) {
      return;
    }
    this.setState({ scheduling: true });
    const { fireDate, reminderId } = this.state.alarm;
    const { name, barcode, image, description } = this.state.medicine;
    const { testDate } = this.state.timePicker;
    // Put more detail into Notification Data Structure, then set it as details for ReactNativeAN.
    // alarm_id is the new reminder id from reminderId, to convert from int to string.
    const details = {
      ...alarmNotifData,
      fire_date: fireDate,
      title: name,
      alarm_id: reminderId,
      data: {
        image: image,
        name: name,
        description: description,
        barcode: barcode,
        itemTime: testDate.toString(),
      },
    };
    // Officially make a new alarm with information from details.
    ReactNativeAN.scheduleAlarm(details);
    await this.getANid(details);
    if (this._mounted) {
      this.setState({ scheduling: false });
    }
  };

  // Show TimePicker
  showMode = () => {
    this.setState({
      timePicker: {
        ...this.state.timePicker,
        show: true,
      },
    });
  };

  // When a time is chosen from TimePicker
  onChange = (_event, selectedDate) => {
    const { testDate } = this.state.timePicker;
    let currentDate;
    const currentSecond = moment(Date.now()).format('ss');
    const secondValue = parseInt(currentSecond, 10) * 1000;
    const correctValue = Date.now() - secondValue;
    if (selectedDate == null) {
      currentDate = testDate;
    } else {
      if (selectedDate.setSeconds(0) <= new Date(correctValue)) {
        const difference = new Date(correctValue) - selectedDate.setSeconds(0);
        currentDate = new Date(correctValue + (86400000 - difference));
      } else {
        if (selectedDate.setSeconds(0) - new Date(correctValue) > 86400000) {
          const difference =
            selectedDate.setSeconds(0) - new Date(correctValue);
          currentDate = new Date(correctValue + (difference - 86400000));
        } else {
          currentDate = selectedDate;
        }
      }
    }
    // 5 minutes = 300.000 miliseconds.
    // 10 minutes = 600.000 miliseconds
    // 1 hour = 3.600.000 miliseconds
    // 24 hours = 86.400.000 miliseconds.
    // 7 days = 168 hours = 604.800.000 miliseconds
    if (__DEV__) {
      console.log('New Reminder: ' + currentDate);
    }
    this.setState({
      timePicker: {
        ...this.state.timePicker,
        show: Platform.OS === 'ios',
        testDate: currentDate,
      },
      alarm: {
        ...this.state.alarm,
        fireDate: ReactNativeAN.parseDate(currentDate),
      },
    });
  };

  render() {
    const { testDate, show } = this.state.timePicker;
    return (
      <View style={styles.container}>
        <Background />
        <TouchableOpacity
          style={styles.back}
          onPress={() => this.props.navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={32} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.header}>Set Reminder</Text>
        <View style={styles.information}>
          <View style={styles.imageRow}>
            <Image
              style={styles.image}
              source={
                this.state.medicine.image
                  ? { uri: this.state.medicine.image }
                  : tempAvatar
              }
            />
            <View style={styles.name}>
              <Text style={styles.medicineName}>
                {this.state.medicine.name}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.timeSection}>
          <View>
            <View style={styles.timePicker}>
              <TouchableOpacity
                style={styles.showPicker}
                onPress={this.showMode}
              >
                <Text style={styles.pickerText}>Show time picker!</Text>
              </TouchableOpacity>
              <Text style={styles.timeDisplay}>
                {moment(testDate).format('hh:mm a')}
              </Text>
            </View>
            {show && (
              <TimePicker
                value={testDate}
                mode="time"
                onChange={this.onChange}
              />
            )}
          </View>
          <TouchableOpacity
            style={[styles.button, this.state.scheduling && { opacity: 0.6 }]}
            onPress={() => this.scheduleAlarm()}
            disabled={this.state.scheduling}
          >
            <Text style={styles.pickerText}>
              {this.state.scheduling ? 'Scheduling...' : 'Schedule Alarm'}
            </Text>
          </TouchableOpacity>
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
  back: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(21, 22, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  name: {
    flex: 1,
    fontWeight: '600',
    marginLeft: 8,
    justifyContent: 'center',
  },
  header: {
    marginTop: -150,
    color: '#FFF',
    textAlign: 'center',
    fontSize: 24,
  },
  information: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    padding: 16,
    marginTop: 50,
    marginBottom: 12,
    marginHorizontal: 30,
  },
  timePicker: {
    backgroundColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#1565C0',
    borderRadius: 4,
    marginVertical: 12,
    marginHorizontal: 30,
  },
  showPicker: {
    backgroundColor: '#1565C0',
    borderRadius: 4,
    height: 40,
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRow: {
    flexDirection: 'row',
  },
  medicineName: {
    fontSize: 16,
  },
  timeSection: {
    flex: 1,
  },
  pickerText: {
    color: '#FFF',
  },
  timeDisplay: {
    alignSelf: 'center',
  },
});

export default NewReminder;
