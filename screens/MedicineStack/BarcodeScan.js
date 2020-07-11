import React from 'react';
import {
    View,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
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
    //small_icon: "ic_launcher",
    message: "Take your Medicine",
};

export default class BarcodeScan extends React.Component {
    static navigationOptions = {
        headerShown: false,
    };

    constructor(props) {
        super(props);
        this.handleTourch = this.handleTourch.bind(this);
        this.state = {
            barcodeRead: false,
            barcode: "",
            alarmId: "",
            medicine: {},
            flashOn: false
        }
    }

    _isMounted = false

    componentDidMount() {
        this._isMounted = true
        // Text value from params and put it as state.medicine
        let paramsFromMediInfoScreen = this.props.navigation.state.params.medicine;
        this.setState({ medicine: paramsFromMediInfoScreen });

        let paramsAlarmId = this.props.navigation.state.params.alarmId;
        this.setState({ alarmId: paramsAlarmId });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onBarCodeRead = (e) => {
        const { name, barcode } = this.state.medicine
        const { alarmId, barcodeRead } = this.state
        this.setState({ barcodeRead: !barcodeRead })
        if (this.state.barcodeRead == true) {
            if (barcode == e.data) {
                ReactNativeAN.stopAlarmSound();
                ReactNativeAN.removeAllFiredNotifications();
                const fireDates = ReactNativeAN.parseDate(new Date(Date.now() + 300000));
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
                ReactNativeAN.scheduleAlarm(details);
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
                Alert.alert("Alarm Sound is Stopped");
            } else {
                Alert.alert("Scanned Barcode is " + e.data, "Required Barcode is " + barcode);
                //Alert.alert("It is not the correct barcode");
            }
        }
    }

    handleTourch(value) {
        if (value === true) {
            this.setState({ flashOn: false });
        } else {
            this.setState({ flashOn: true });
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
});