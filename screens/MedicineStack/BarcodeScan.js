// Author: Phuoc Hoang Minh Nguyen
// Description: Used to scan medicine barcode when the alarm is sounded
// Status: Optimized

import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReactNativeAN from 'react-native-alarm-notification';
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import moment from "moment";

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    message: "Take your Medicine",
    data: { content: 'My name is Minh' },
}

class BarcodeScan extends React.Component {
    constructor(props) {
        super(props)
        this.handleTourch = this.handleTourch.bind(this)
        this.state = {
            //prevent the alarm to be read twice
            barcodeRead: false,
            // To update Firebase document data including idAN and alarmId
            firebaseId: "",
            // medicine details
            medicine: {},
            // Set flashOff by default
            flashOn: false,
            // Details in Problems.txt file, Problem 1
            alarmId: Math.floor(Math.random() * 10000).toString(),
            number: 0,
            itemTime: null,
        }
    }

    componentDidMount() {
        // Take medicine data from MedicineScreen, including image, name, description, and barcode.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromMediInfoScreen = this.props.navigation.state.params.medicine
        this.setState({ medicine: paramsFromMediInfoScreen })

        // Take value from params and put it as state.firebaseId
        let paramsFirebaseId = this.props.navigation.state.params.firebaseId
        this.setState({ firebaseId: paramsFirebaseId })

        // Take value from params and put it as state.itemTime
        let paramsItemTime = this.props.navigation.state.params.itemTime
        this.setState({ itemTime: paramsItemTime })

        // Take value from params and put it as state.number
        let paramsNumber = this.props.navigation.state.params.number
        this.setState({ number: paramsNumber })
    }

    onBarCodeRead = async (e) => {
        const { name, barcode } = this.state.medicine
        const { firebaseId, barcodeRead, alarmId } = this.state
        // If the barcode scanned is correct.
        if (barcode == e.data) {
            if (barcodeRead == false) {
                this.setState({ barcodeRead: true })
                // Stop Alarm Sound
                ReactNativeAN.stopAlarmSound()
                // Remove Notification
                ReactNativeAN.removeAllFiredNotifications()

                // Set New Alarm Time
                const newReminderTime = this.state.itemTime
                newReminderTime.setDate(newReminderTime.getDate() + 1)
                console.log("Barcode Scanner: " + newReminderTime)
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
                const firebaseReminder = this.state.itemTime
                firebaseReminder.setDate(firebaseReminder.getDate() - 1)
                firestore().collection("history").add({
                    medicine: name,
                    patientEmail: auth().currentUser.email,
                    startTime: firebaseReminder,
                    date: moment().format('MMMM Do YYYY'),
                    status: "taken"
                })
                let temporaryID
                let firebasePills
                const mPills = firestore().collection("medicinePills")
                mPills.where('medicine', '==', this.state.medicine.name)
                    .where('patientEmail', '==', auth().currentUser.email)
                    .get().then(querySnapshot => {
                        querySnapshot.forEach(documentSnapshot => {
                            temporaryID = documentSnapshot.id
                            firebasePills = documentSnapshot.data().pills
                        })
                        // Need to minus the correct number of pills, not just one
                        const value = firebasePills - this.state.number
                        mPills.doc(temporaryID).update({
                            pills: value
                        })
                    })
                this.props.navigation.navigate("MedicineScreen")
            }
            Alert.alert("Alarm Sound is Stopped")
            // If the barcode scanned is incorrect.
        } else {
            Alert.alert("Scanned Barcode is " + e.data, "Required Barcode is " + barcode)
        }
    }

    // Handle turning on, turning off flash. Currently just change the icon.
    handleTourch(value) {
        if (value === true) {
            this.setState({ flashOn: false })
        } else {
            this.setState({ flashOn: true })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <RNCamera
                    style={styles.preview}
                    onBarCodeRead={this.onBarCodeRead}
                />
                <View style={styles.bottomOverlay}>
                    <TouchableOpacity onPress={() => this.handleTourch(this.state.flashOn)}>
                        <Ionicons size={40} color="#FFF"
                            name={this.state.flashOn === true ? "flash" : "flash-off"} />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    bottomOverlay: {
        position: "absolute",
        width: "100%",
        flex: 20,
        flexDirection: "row",
        justifyContent: "space-between"
    },
})

export default BarcodeScan