// Author: Phuoc Hoang Minh Nguyen
// Description: Used to scan medicine barcode when the alarm is sounded
// Status: In development

import React from 'react'
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { RNCamera } from 'react-native-camera'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ReactNativeAN from 'react-native-alarm-notification'
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import moment from "moment"

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    message: "Take your Medicine",
};

export default class BarcodeScan extends React.Component {
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
    }

    onBarCodeRead = async (e) => {
        const { name, barcode } = this.state.medicine
        const { firebaseId, barcodeRead, alarmId } = this.state
        if (barcode == e.data) {
            if (barcodeRead == false) {
                this.setState({ barcodeRead: true })
                // Stop Alarm Sound
                ReactNativeAN.stopAlarmSound()
                // Remove Notification
                ReactNativeAN.removeAllFiredNotifications()

                // Set a new fireDate 5 minutes later.
                //
                // The alarm currently reset after every "loop" starting from the time the alarm is turned off.
                // It should start from the time the alarm is set instead.
                const fireDates = ReactNativeAN.parseDate(new Date(Date.now() + 300000))
                // 10 minutes = 600.000 miliseconds
                // 5 minutes = 300.000 miliseconds.
                // 1 hour = 3.600.000 miliseconds
                // 24 hours = 86.400.000 miliseconds.
                // 7 days = 168 hours = 604.800.000 miliseconds

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
                firestore().collection("reminder").doc(firebaseId)
                    .update({
                        idAN: idAN,
                        alarmId: alarmId
                    })
                this.props.navigation.navigate("MedicineScreen")

                // When the alarm is turned off, add the medicine into "history" collection
                firestore().collection("history").add({
                    medicine: name,
                    patientEmail: auth().currentUser.email,
                    time: moment().format('h:mm a'),
                    date: moment().format('MMMM Do YYYY'),
                    status: "taken"
                })
                // Problem: Keep minus pills by 1 repeatly
                let temporaryID
                let firebasePills
                const mPills = firestore().collection("medicinePills")
                mPills.get().then(querySnapshot => {
                    querySnapshot.forEach(documentSnapshot => {
                        if (documentSnapshot.data().medicine == this.state.medicine.name
                            && documentSnapshot.data().patientEmail == auth().currentUser.email) {
                            temporaryID = documentSnapshot.id
                            firebasePills = documentSnapshot.data().pills
                        }
                    })
                    const value = parseInt(firebasePills, 10) - 1
                    mPills.doc(temporaryID).update({
                        pills: value.toString()
                    })
                })
            }
            Alert.alert("Alarm Sound is Stopped")
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