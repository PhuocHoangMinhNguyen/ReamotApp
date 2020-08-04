// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to delete their daily reminder and stop sounding alarm
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

export default class ChangeReminder extends React.Component {
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
            }
        }
    }

    componentDidMount() {
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
                    <TouchableOpacity style={styles.button}
                        onPress={() => {
                            // To stop alarm sound, go to BarcodeScan
                            this.props.navigation.navigate("BarcodeScan", {
                                medicine: this.props.navigation.state.params.medicine,
                                itemTime: this.props.navigation.state.params.itemTime,
                                firebaseId: this.state.firebase.firebaseId,
                            })
                        }}>
                        <Text style={{ color: "#FFF" }}>Stop Alarm Sound</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={this.deleteAlarm}>
                        <Text style={{ color: "#FFF" }}>Delete Alarm</Text>
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
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
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