// Author: Phuoc Hoang Minh Nguyen
// Description: Used to scan medicine barcode when the alarm is sounded
// Status: In development

import React from 'react'
import {
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native'
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
    //small_icon: "ic_launcher",
    message: "Take your Medicine",
};

export default class BarcodeScan extends React.Component {
    static navigationOptions = {
        headerShown: false,
    };

    constructor(props) {
        super(props)
        this.handleTourch = this.handleTourch.bind(this)
        this.state = {
            idAN: "",
            barcodeRead: false,
            barcode: "",
            firebaseId: "",
            medicine: {},
            flashOn: false,
            alarmId: Math.floor(Math.random() * 100).toString(),
        }
    }

    _isMounted = false

    componentDidMount() {
        this._isMounted = true
        // Text value from params and put it as state.medicine
        let paramsFromMediInfoScreen = this.props.navigation.state.params.medicine
        this.setState({ medicine: paramsFromMediInfoScreen })

        let paramsFirebaseId = this.props.navigation.state.params.firebaseId
        this.setState({ firebaseId: paramsFirebaseId })

        let paramsIdAN = this.props.navigation.state.params.idAN
        this.setState({ idAN: paramsIdAN })
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    onBarCodeRead = async (e) => {
        const { name, barcode } = this.state.medicine
        const { firebaseId, barcodeRead, alarmId } = this.state
        this.setState({ barcodeRead: !barcodeRead })
        if (this.state.barcodeRead == true) {
            if (barcode == e.data) {
                ReactNativeAN.stopAlarmSound();
                ReactNativeAN.removeAllFiredNotifications()
                // Might Need to delete current alarm
                // ReactNativeAN.deleteAlarm(this.state.idAN.toString());
                // The alarm currently reset after every "loop" starting from the time the alarm is turned off.
                // It should start from the time the alarm is set instead.
                const fireDates = ReactNativeAN.parseDate(new Date(Date.now() + 300000))
                // 10 minutes = 600.000 miliseconds
                // 5 minutes = 300.000 miliseconds.
                // 1 hour = 3.600.000 miliseconds
                // 24 hours = 86.400.000 miliseconds.
                const details = {
                    ...alarmNotifData,
                    fire_date: fireDates,
                    title: name,
                    alarm_id: alarmId
                };
                ReactNativeAN.scheduleAlarm(details)
                // Get the NEW alarm's "id", set it as idAN
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
                this.props.navigation.navigate("ChangeReminder", {
                    medicine: this.props.navigation.state.params.medicine,
                    itemTime: this.props.navigation.state.params.itemTime,
                });
                firestore().collection("history").add({
                    medicine: name,
                    patientEmail: auth().currentUser.email,
                    time: moment().format('h:mm a'),
                    date: moment().format('MMMM Do YYYY'),
                    status: "taken"
                })
                Alert.alert("Alarm Sound is Stopped")
            } else {
                Alert.alert("Scanned Barcode is " + e.data, "Required Barcode is " + barcode)
                //Alert.alert("It is not the correct barcode");
            }
        }
    }

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