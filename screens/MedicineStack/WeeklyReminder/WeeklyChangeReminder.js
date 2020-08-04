// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to delete their weekly reminder and stop sounding alarm
// Status: Currently working similar to daily reminder

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from 'react-native'
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
import Toast from "react-native-simple-toast"
import ReactNativeAN from 'react-native-alarm-notification'
import TimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import { ConfirmDialog } from "react-native-simple-dialogs"

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    message: "Take your Medicine",
}

export default class WeeklyChangeReminder extends React.Component {
    _isMounted

    constructor(props) {
        super(props)
        this.state = {
            medicine: {},
            // Ids from Firebase.
            firebase: {
                firebaseId: "",
                idAN: "",
            },
            timePicker: {
                // Used for TimePicker
                testDate: new Date(Date.now()),
                // Used to show TimePicker
                show: false,
                // "Changed" is the value to indicate when a new time is picked
                // change to true when a new time is picked
                changed: false,
                // "Initial" is the inial text next to TimePicker,
                // which is the reminder time value inside firestore before editing.
                initial: ''
            },
            alarm: {
                // Used for react-native-alarm-notification package
                fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
            },
            dialogVisible: false,
        }
    }

    componentDidMount() {
        this._isMounted = true
        // Take medicine data from MedicineScreen, including image, name, description, and barcode.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromMediInfoScreen = this.props.navigation.state.params.medicine
        this.setState({ medicine: paramsFromMediInfoScreen })

        // Take value from params and put it as state.timePicker.initial
        let paramsTime = this.props.navigation.state.params.itemTime
        this.setState({
            timePicker: {
                ...this.state.timePicker,
                initial: paramsTime
            }
        })

        // Find the document Id and idAN in Cloud Firestore
        let tempIdAN = ""
        let tempFirebase = ""
        firestore().collection("reminder").onSnapshot((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
                if (documentSnapshot.data().medicine == this.state.medicine.name
                    && documentSnapshot.data().patientEmail == auth().currentUser.email
                    && documentSnapshot.data().times == this.state.timePicker.initial) {
                    tempFirebase = documentSnapshot.id
                    tempIdAN = documentSnapshot.data().idAN
                }
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
        this._isMounted = false
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
        const { testDate } = this.state.timePicker;
        let currentDate = selectedDate || testDate;
        this.setState({
            timePicker: {
                ...this.state.timePicker,
                show: Platform.OS === 'ios',
                testDate: currentDate,
                changed: true,
            },
            alarm: {
                ...this.state.alarm,
                fireDate: ReactNativeAN.parseDate(currentDate),
            }
        })
    }

    handleMiss = () => { this.setState({ dialogVisible: true }) }

    handleYes = async () => {
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
            status: "missed"
        })
    }

    render() {
        const { testDate, show, changed, initial } = this.state.timePicker
        let message;
        if (changed == true) {
            message = moment(testDate).format('hh:mm a')
        } else {
            message = initial
        }
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
                            <Text style={{ alignSelf: "center" }}>{message}</Text>
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
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                        <TouchableOpacity style={styles.button}
                            onPress={() => {
                                // To stop alarm sound, go to BarcodeScan
                                this.props.navigation.navigate("BarcodeScan", {
                                    medicine: this.props.navigation.state.params.medicine,
                                    itemTime: this.props.navigation.state.params.itemTime,
                                    firebaseId: this.state.firebase.firebaseId,
                                })
                            }}>
                            <Text style={{ color: "#FFF" }}>Take Medicine</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}
                            onPress={this.handleMiss}>
                            <Text style={{ color: "#FFF" }}>Miss Medicine</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={this.deleteAlarm}>
                        <Text style={{ color: "#FFF" }}>Delete Alarm</Text>
                    </TouchableOpacity>
                </View>
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
        padding: 10,
        marginTop: 70,
        marginBottom: 12,
        marginHorizontal: 16
    },
    timePicker: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 16,
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
        marginHorizontal: 16,
        padding: 20
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