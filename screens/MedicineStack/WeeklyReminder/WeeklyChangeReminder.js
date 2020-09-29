// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to delete their weekly reminder and stop sounding alarm
// Status: Currently working similar to daily reminder

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import Toast from "react-native-simple-toast"
import ReactNativeAN from 'react-native-alarm-notification'
import moment from 'moment'
import { ConfirmDialog } from "react-native-simple-dialogs"
import Background from '../../../components/Background'

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    message: "Take your Medicine",
}

var tempAvatar = require("../../../assets/tempAvatar.jpg")

class WeeklyChangeReminder extends React.Component {
    state = {
        medicine: {},
        // Ids from Firebase.
        firebase: {
            firebaseId: "",
            idAN: "",
            alarmId: Math.floor(Math.random() * 10000).toString(),
        },
        timePicker: {
            // Used for TimePicker
            testDate: new Date(Date.now()),
            // Used to show TimePicker
            show: false,
            // "Changed" is the value to indicate when a new time is picked
            // change to true when a new time is picked
            changed: false,
        },
        // "Initial" is the inial text next to TimePicker,
        // which is the reminder time value inside firestore before editing.
        initial: null,
        alarm: {
            // Used for react-native-alarm-notification package
            fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
        },
        dialogVisible: false,
        number: 0
    }

    unsubscribe = null

    componentDidMount() {
        // Take medicine data from MedicineScreen, including image, name, description, and barcode.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromMediInfoScreen = this.props.navigation.state.params.medicine
        this.setState({ medicine: paramsFromMediInfoScreen })

        // Take value from params and put it as state.timePicker.initial
        let paramsTime = this.props.navigation.state.params.itemTime
        this.setState({ initial: paramsTime })

        let paramsNumber = this.props.navigation.state.params.number
        this.setState({ number: paramsNumber })

        // Find the document Id and idAN in Cloud Firestore
        let tempIdAN = ""
        let tempFirebase = ""
        this.unsubscribe = firestore().collection("reminder")
            .where('patientEmail', '==', auth().currentUser.email)
            .where('time', '==', this.props.navigation.state.params.itemTime)
            .where('medicine', '==', this.props.navigation.state.params.medicine.name)
            .onSnapshot((querySnapshot) => {
                querySnapshot.forEach((documentSnapshot) => {
                    tempFirebase = documentSnapshot.id
                    tempIdAN = documentSnapshot.data().idAN
                })
                // Assign to firebaseId and idAN in state.firebase
                this.setState({
                    firebase: {
                        ...this.state.firebase,
                        firebaseId: tempFirebase,
                        idAN: tempIdAN,
                    }
                })
            })
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    // delete alarm from "reminder" collection in firestore
    deleteAlarm = () => {
        const { firebaseId, idAN } = this.state.firebase
        // Delete the reminder from "reminder" collection
        firestore().collection("reminder").doc(firebaseId).delete()
            .then(() => {
                // Delete Alarm using state.idAN
                ReactNativeAN.deleteAlarm(idAN.toString())
                Toast.show("Reminder Deleted!")
                this.props.navigation.goBack()
            })
    }

    // Show up a dialog to ask if user is sure to miss the reminder.
    handleMiss = () => { this.setState({ dialogVisible: true }) }

    // If the user is sure to miss the reminder
    handleYes = async () => {
        const { name } = this.state.medicine
        const { firebaseId, alarmId } = this.state.firebase
        // Stop Alarm Sound
        ReactNativeAN.stopAlarmSound()
        // Remove Notification
        ReactNativeAN.removeAllFiredNotifications()

        const newReminderTime = this.state.initial
        newReminderTime.setDate(newReminderTime.getDate() + 1)
        console.log("Real Value Weekly: " + newReminderTime)
        console.log("Real Value Weekly Format: " + moment(newReminderTime).format())
        const fireDates = ReactNativeAN.parseDate(newReminderTime)

        const details = {
            ...alarmNotifData,
            fire_date: fireDates,
            title: name,
            alarm_id: alarmId
        }
        ReactNativeAN.scheduleAlarm(details)

        // Get the NEW alarm's "id", set it as idAN to update in Cloud Firestore
        const alarm = await ReactNativeAN.getScheduledAlarms()
        let idAN = ""
        for (let i = 0; i < alarm.length; i++) {
            if (alarm[i].alarmId == details.alarm_id) {
                idAN = alarm[i].id
            }
        }
        firestore().collection("reminder").doc(firebaseId).update({
            idAN: idAN,
            alarmId: alarmId,
            time: newReminderTime
        })

        // When the alarm is turned off, add the medicine into "history" collection
        firestore().collection("history").add({
            medicine: name,
            patientEmail: auth().currentUser.email,
            startTime: this.state.initial,
            date: moment().format('MMMM Do YYYY'),
            status: "missed"
        })
        this.props.navigation.navigate("MedicineScreen")
    }

    render() {
        return (
            <View style={styles.container}>
                <Background />
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.header}>Edit Reminder</Text>
                <View style={styles.information}>
                    <View style={{ flexDirection: "row" }}>
                        <Image style={styles.image}
                            source={this.state.medicine.image
                                ? { uri: this.state.medicine.image }
                                : tempAvatar
                            } />
                        <View style={styles.name}>
                            <Text style={{ fontSize: 15 }}>{this.state.medicine.name}</Text>
                            <Text style={styles.time}>{moment(this.state.timePicker.initial.toDate()).format('hh:mm a')}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 30 }}>
                    <TouchableOpacity style={styles.button2}
                        onPress={() => {
                            // To stop alarm sound, go to BarcodeScan
                            this.props.navigation.navigate("BarcodeScan", {
                                medicine: this.props.navigation.state.params.medicine,
                                itemTime: this.props.navigation.state.params.itemTime,
                                firebaseId: this.state.firebase.firebaseId,
                                number: this.props.navigation.state.params.number,
                            })
                        }}>
                        <Text style={{ color: "#FFF" }}>Take Medicine</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button2}
                        onPress={this.handleMiss}>
                        <Text style={{ color: "#FFF" }}>Miss Medicine</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={this.deleteAlarm}>
                    <Text style={{ color: "#FFF" }}>Delete Alarm</Text>
                </TouchableOpacity>
                <ConfirmDialog
                    visible={this.state.dialogVisible}
                    title="Alert"
                    message="Are you sure?"
                    onTouchOutside={() => this.setState({ dialogVisible: false })}
                    positiveButton={{
                        title: "YES",
                        onPress: () => { this.handleYes() }
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => {
                            this.setState({ dialogVisible: false })
                            Toast.show("Your request is canceled !")
                        }
                    }}
                />
            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    back: {
        marginTop: -170,
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
        justifyContent: "center"
    },
    header: {
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
        marginHorizontal: 30,
        padding: 20
    },
    button2: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginVertical: 12,
        padding: 20
    },
    showPicker: {
        backgroundColor: "#1565C0",
        borderRadius: 4,
        height: 40,
        width: 120,
        alignItems: "center",
        justifyContent: "center",
    },
    time: {
        fontSize: 24,
        marginTop: 10
    }
})

export default WeeklyChangeReminder