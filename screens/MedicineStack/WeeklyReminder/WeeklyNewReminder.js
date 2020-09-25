// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make a new weekly reminder
// Status: Currently working similar to daily reminder

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native'
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

var tempAvatar = require("../../../assets/tempAvatar.jpg")
var background = require('../../../assets/background.png')

class WeeklyNewReminder extends React.Component {
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
        }
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
                type: "Weekly",
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
        }
        // Officially make a new alarm with information from details.
        ReactNativeAN.scheduleAlarm(details)
        this.getANid(details)
    }

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
        let currentDate
        const currentSecond = moment(Date.now()).format('ss')
        const secondValue = parseInt(currentSecond) * 1000
        const correctValue = Date.now() - secondValue
        if (selectedDate == null) {
            currentDate = testDate
        } else {
            if (selectedDate.setSeconds(0) <= new Date(correctValue)) {
                const difference = new Date(correctValue) - selectedDate.setSeconds(0)
                currentDate = new Date(correctValue + (86400000 - difference))
            } else {
                if (selectedDate.setSeconds(0) - new Date(correctValue) > 86400000) {
                    const difference = selectedDate.setSeconds(0) - new Date(correctValue)
                    currentDate = new Date(correctValue + (difference - 86400000))
                } else {
                    currentDate = selectedDate
                }
            }
        }
        // 5 minutes = 300.000 miliseconds.
        // 10 minutes = 600.000 miliseconds
        // 1 hour = 3.600.000 miliseconds
        // 24 hours = 86.400.000 miliseconds.
        // 7 days = 168 hours = 604.800.000 miliseconds
        console.log("Current Date: " + currentDate)
        console.log("Current Date Format: " + moment(currentDate).format())
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
        })
    }

    render() {
        const { testDate, show } = this.state.timePicker
        return (
            <View style={styles.container}>
                <Image style={styles.containter}
                    source={background}
                />
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.header}>Set Reminder</Text>
                <View style={styles.information}>
                    <View style={{ flexDirection: "row" }}>
                        <Image
                            source={
                                this.state.medicine.image
                                    ? { uri: this.state.medicine.image }
                                    : tempAvatar
                            }
                            style={styles.image}
                        />
                        <View style={styles.name}>
                            <Text style={{ fontSize: 16 }}>{this.state.medicine.name}</Text>
                        </View>
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
                                value={testDate}
                                mode="time"
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
    containter: {
        width: Dimensions.get("window").width, //for full screen
    },
    container: {
        flex: 1,
        backgroundColor: "#FFF"
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
        fontWeight: "600",
        marginLeft: 8,
        justifyContent: "center"
    },
    header: {
        marginTop: -150,
        color: "#FFF",
        textAlign: "center",
        fontSize: 24,
    },
    information: {
        backgroundColor: "#ddd",
        borderRadius: 5,
        padding: 16,
        marginTop: 50,
        marginBottom: 12,
        marginHorizontal: 30
    },
    timePicker: {
        backgroundColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 30,
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
        marginHorizontal: 30
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

export default WeeklyNewReminder