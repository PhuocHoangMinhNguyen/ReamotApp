import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Button, ScrollView } from 'react-native'
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth";
import Toast from "react-native-simple-toast"

import ReactNativeAN from 'react-native-alarm-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'

// Notification Data Structure.
const alarmNotifData = {
    vibrate: true,
    play_sound: true,
    schedule_type: "repeat",
    repeat_interval: 5, // repeat for 5 mins
    channel: "takemedicine",
    loop_sound: true,
    message: " "
};

export default class ChangeReminder extends React.Component {
    _isMounted = false

    static navigationOptions = {
        headerShown: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            alarmID: "",
            medicine: {},
            alarm: {
                update: '',
                // testDate is the date shown when time is picked
                testDate: new Date(Date.now()),
                fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
                show: false,
                // "Changed" is the value to indicate when a new time is picked
                // change to true when a new time is picked
                changed: false,
                // "Initial" is the inial text next to DateTimePicker,
                // which is the reminder time value inside firestore before editing.
                initial: ''
            }
        };
        this.scheduleAlarm = this.scheduleAlarm.bind(this);
        this.stopAlarm = this.stopAlarm.bind(this);
    }

    componentDidMount() {
        this._isMounted = true
        // Text value from params and put it as state.medicine
        let paramsFromMediInfoScreen = this.props.navigation.state.params.medicine;
        this.setState({ medicine: paramsFromMediInfoScreen });
        // Text value from params and put it as state.alarm.initial
        let paramsTime = this.props.navigation.state.params.itemTime;
        this.setState({
            alarm: {
                ...this.state.alarm,
                initial: paramsTime
            }
        })
        // Find the alarm Id of the reminder that is going to be changed.
        let temp = ""
        firestore().collection("reminder").onSnapshot((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
                if (documentSnapshot.data().medicine == this.state.medicine.name
                    && documentSnapshot.data().patientEmail == auth().currentUser.email
                    && documentSnapshot.data().times == this.state.alarm.initial) {
                    temp = documentSnapshot.id
                }
            })
            // Assign temp to alarmID.
            this.setState({ alarmID: temp })
            console.log("Change Reminder - Check alarm ID in Firestore: " + this.state.alarmID)
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    // set a NEW alarm, store it in firestore, and replace the existing alarm
    scheduleAlarm = () => {
        // Delete Existing Alarm
        ReactNativeAN.deleteAlarm(
            firestore().collection("reminder").doc(this.state.alarmID).id
        );
        const { testDate, fireDate } = this.state.alarm;
        const { name } = this.state.medicine;
        const details = { ...alarmNotifData, fire_date: fireDate, title: name, alarm_id: this.state.alarmID };
        console.log(`Change Reminder - Check alarm_id in ReactNativeAN: ${details.alarm_id}`);
        this.setState({
            alarm: {
                ...this.state.alarm,
                update: `alarm set: ${fireDate}`
            }
        });
        ReactNativeAN.scheduleAlarm(details);
        firestore().collection("reminder").doc(this.state.alarmID).set({
            medicine: name,
            times: moment(testDate).format('hh:mm a'),
            patientEmail: auth().currentUser.email,
        }).then(() => {
            Toast.show("Reminder Set!")
        })
        this.props.navigation.goBack()
    };

    // stop the current alarm sound
    stopAlarm = () => {
        const { testDate, initial } = this.state.alarm
        const { name } = this.state.medicine
        this.setState({
            alarm: {
                ...this.state.alarm,
                update: ''
            }
        });
        ReactNativeAN.stopAlarmSound();
        ReactNativeAN.removeAllFiredNotifications();
        /*
        firestore().collection("history").add({
            medicine: name,
            patientEmail: auth().currentUser.email,
            time: moment().format('h:mm:ss a'),
            date: moment().format('MMMM Do YYYY')
        })
        */
    };

    // delete alarm from reminder collection in firestore
    deleteAlarm = () => {
        // Delete the reminder from "reminder" collection
        firestore().collection("reminder").doc(this.state.alarmID).delete()
            .then(() => {
                Toast.show("Reminder Deleted!")
            })
        // Get alarm_id
        console.log("Change Reminder - Check AlarmID before Deleting: " + firestore().collection("reminder").doc(this.state.alarmID).id)
        ReactNativeAN.stopAlarmSound();
        ReactNativeAN.removeAllFiredNotifications();
        ReactNativeAN.deleteAlarm(
            firestore().collection("reminder").doc(this.state.alarmID).id
        );
        this.props.navigation.goBack()
    }

    getScheduledAlarms = async () => {
        const alarm = await ReactNativeAN.getScheduledAlarms();
        this.setState({
            alarm: {
                ...this.state.alarm,
                update: JSON.stringify(alarm)
            }
        });
    }

    showMode = () => {
        this.setState({
            alarm: {
                ...this.state.alarm,
                show: true
            }
        })
    }

    onChange = (event, selectedDate) => {
        const { testDate } = this.state.alarm;
        let currentDate = selectedDate || testDate;
        this.setState({
            alarm: {
                ...this.state.alarm,
                show: Platform.OS === 'ios',
                testDate: currentDate,
                changed: true,
            }
        });
    }

    render() {
        const { update, testDate, show, changed, initial } = this.state.alarm;
        let message;
        if (changed == true) {
            message = moment(testDate).format('hh:mm a')
        } else {
            message = initial
        }
        return (
            <ScrollView style={styles.container}>
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
                                    : require("../../assets/tempAvatar.jpg")
                            }
                            style={styles.image}
                        />
                        <Text style={styles.name}>{this.state.medicine.name}</Text>
                    </View>
                </View>
                <View style={{ flex: 1, padding: 20 }}>
                    <View>
                        <View style={styles.timePicker}>
                            <Button onPress={this.showMode} title="Show time picker!" />
                            <Text>{message}</Text>
                        </View>
                        {show && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                timeZoneOffsetInMinutes={0}
                                value={testDate}
                                mode="time"
                                is24Hour={false}
                                display="default"
                                onChange={this.onChange}
                            />
                        )}
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.scheduleAlarm}
                            title="Schedule Alarm"
                            color="#018ABE"
                        />
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.stopAlarm}
                            title="Stop Alarm Sound"
                            color="#018ABE"
                        />
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.deleteAlarm}
                            title="Delete alarm"
                            color="#018ABE"
                        />
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.getScheduledAlarms}
                            title="Get Scheduled Alarms"
                            color="#018ABE"
                        />
                    </View>
                    <Text>{update}</Text>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 100
    },
    back: {
        position: "absolute",
        marginTop: -100,
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
        marginHorizontal: 16
    },
    timePicker: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 16,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between"
    },
});
