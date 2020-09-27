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
            itemTime: "",
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

        let paramsItemTime = this.props.navigation.state.params.itemTime
        this.setState({ itemTime: paramsItemTime })

        let paramsNumber = this.props.navigation.state.params.number
        this.setState({ number: paramsNumber })
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

                const hour = parseInt(this.state.itemTime.substring(0, 2))
                const minute = parseInt(this.state.itemTime.substring(3, 5))
                const morning_afternoon = this.state.itemTime.substring(6, 8)
                const now = new Date()
                now.setDate(now.getDate() + 1)
                if (morning_afternoon == "am") {
                    if (hour == 12) {
                        now.setHours(hour - 12, minute, 0)
                    } else {
                        now.setHours(hour, minute, 0)
                    }
                } else {
                    if (hour == 12) {
                        now.setHours(hour, minute, 0)
                    } else {
                        now.setHours(hour + 12, minute, 0)
                    }
                }
                console.log("Real Value Barcode: " + now)
                console.log("Real Value Barcode Format: " + moment(now).format())
                const fireDates = ReactNativeAN.parseDate(now)

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
                    time: this.state.itemTime,
                    startTime: new Date(Date.now()),
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

export default BarcodeScan