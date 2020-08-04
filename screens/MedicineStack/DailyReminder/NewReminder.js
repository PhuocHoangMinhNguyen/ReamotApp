// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make a new daily reminder
// Status: In development

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from 'react-native'
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import Toast from "react-native-simple-toast"
import ReactNativeAN from 'react-native-alarm-notification'
import TimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    message: "Take your Medicine",
}

export default class NewReminder extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            medicine: {},
            timePicker: {
                // Used for TimePicker
                testDate: new Date(Date.now()),
                // Used to show TimePicker
                show: false
            },
            alarm: {
                // Details in Problems.txt file, Problem 1
                reminderId: Math.floor(Math.random() * 10000).toString(),
                // Used for react-native-alarm-notification package
                fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
            }
        };
        this.scheduleAlarm = this.scheduleAlarm.bind(this)
    }

    componentDidMount() {
        // Take medicine data from MedicineScreen, including image, name, description, and barcode.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromMedicineScreen = this.props.navigation.state.params
        this.setState({ medicine: paramsFromMedicineScreen })
    }

    // This function called after the alarm is set.
    getANid = async (details) => {
        const { reminderId } = this.state.alarm
        const { name } = this.state.medicine
        const { testDate } = this.state.timePicker
        // Get the alarm's "id", set it as idAN attribute for Cloud Firestore
        const alarm = await ReactNativeAN.getScheduledAlarms()
        let idAN = ""
        for (let i = 0; i < alarm.length; i++) {
            if (alarm[i].alarmId == details.alarm_id) {
                idAN = alarm[i].id
            }
        }
        // Officially add the alarm details into Firebase, alarm id is also from reminderId
        firestore().collection("reminder")
            .add({
                alarmId: reminderId,
                idAN: idAN,
                medicine: name,
                type: "Daily",
                times: moment(testDate).format('hh:mm a'),
                patientEmail: auth().currentUser.email,
            })
            .then(() => {
                Toast.show("Reminder Set!")
                this.props.navigation.goBack()
            })
    }

    // This function called when Schedule Alarm button is clicked
    scheduleAlarm = () => {
        const { fireDate, reminderId } = this.state.alarm
        const { name } = this.state.medicine
        // Put more detail into Notification Data Structure, then set it as details for ReactNativeAN.
        // alarm_id is the new reminder id from reminderId, to convert from int to string.
        const details = {
            ...alarmNotifData,
            fire_date: fireDate,
            title: name,
            alarm_id: reminderId,
        };
        // Officially make a new alarm with information from details.
        ReactNativeAN.scheduleAlarm(details)
        this.getANid(details)
    };

    // Show TimePicker
    showMode = () => {
        this.setState({
            timePicker: {
                ...this.state.timePicker,
                show: true
            }
        })
    }

    // When a time is chosen from TimePicker
    onChange = (event, selectedDate) => {
        const { testDate } = this.state.timePicker
        let currentDate = selectedDate || testDate
        this.setState({
            timePicker: {
                ...this.state.timePicker,
                show: Platform.OS === 'ios',
                testDate: currentDate,
            },
            alarm: {
                ...this.state.alarm,
                fireDate: ReactNativeAN.parseDate(currentDate)
            }
        });
    }

    render() {
        const { testDate, show } = this.state.timePicker
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.information}>
                    <View style={{ flexDirection: "row" }}>
                        <Image
                            source={
                                this.state.medicine.image
                                    ? { uri: this.state.medicine.image }
                                    : require("../../../assets/tempAvatar.jpg")
                            }
                            style={styles.image}
                        />
                        <Text style={styles.name}>{this.state.medicine.name}</Text>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View>
                        <View style={styles.timePicker}>
                            <TouchableOpacity style={styles.showPicker} onPress={this.showMode}>
                                <Text style={{ color: "#FFF" }}>Show time picker!</Text>
                            </TouchableOpacity>
                            <Text style={{ alignSelf: "center" }}>{moment(testDate).format('hh:mm a')}</Text>
                        </View>
                        {show && (
                            <TimePicker
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
                    <TouchableOpacity style={styles.button} onPress={this.scheduleAlarm}>
                        <Text style={{ color: "#FFF" }}>Schedule Alarm</Text>
                    </TouchableOpacity>
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
    back: {
        position: "absolute",
        top: 24,
        left: 24,
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
        marginTop: 70,
        marginBottom: 12,
        marginHorizontal: 16
    },
    timePicker: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    button: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginVertical: 12,
        marginHorizontal: 16
    },
    showPicker: {
        backgroundColor: "#1565C0",
        borderRadius: 4,
        height: 40,
        width: 120,
        alignItems: "center",
        justifyContent: "center",
    }
})