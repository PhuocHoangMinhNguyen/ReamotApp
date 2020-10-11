// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make appointment to the doctor of their chosen,
// who already has access to user medical details.
// Status: Optimized

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-simple-toast";
import { ConfirmDialog } from "react-native-simple-dialogs";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Background from '../../components/Background';

var tempAvatar = require("../../assets/tempAvatar.png")

class AppointmentMaker extends React.Component {
    state = {
        doctor: {},
        dialogVisible: false,
        showDate: false,
        testDate: new Date(Date.now()),
        showTime: false,
        testTime: new Date(Date.now()),
        reason: ""
    }

    componentDidMount() {
        // Take doctor/pharmacist data from DoctorScreen, including avatar, name, and type.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromDoctorScreen = this.props.navigation.state.params
        this.setState({ doctor: paramsFromDoctorScreen })
    }

    // Show DatePicker
    showModeDate = () => {
        this.setState({ showDate: true })
    }

    // Show TimePicker
    showModeTime = () => {
        this.setState({ showTime: true })
    }

    // When a date is chosen from DatePicker
    onChangeDate = (event, selectedDate) => {
        const { testDate } = this.state
        let currentDate = selectedDate || testDate;
        this.setState({
            showDate: Platform.OS === 'ios',
            testDate: currentDate,
        })
    }

    // When a time is chosen from TimePicker
    onChangeTime = (event, selectedTime) => {
        const { testTime } = this.state
        let currentTime = selectedTime || testTime
        this.setState({
            showTime: Platform.OS === 'ios',
            testTime: currentTime,
        })
    }

    // Open a Dialog to confirm if user wants to make the appointment
    handlePress = () => { this.setState({ dialogVisible: true }) }

    // If user confirms to make the appointment
    handleYes = () => {
        const time = this.calculateTime()
        console.log('Time: ' + time)
        this.setState({ dialogVisible: false })
        firestore().collection("appointment").add({
            doctor: this.state.doctor.name,
            time: time,
            reason: this.state.reason,
            patientEmail: auth().currentUser.email
        }).then(() => {
            Toast.show("Your appointment is confirmed !")
            this.props.navigation.goBack()
        })
    }

    // After pick date and time from different DateTimePicker, 
    // we need to merge the date of testDate with the time of testTime
    calculateTime = () => {
        const { testTime, testDate } = this.state
        const time = new Date()
        time.setFullYear(testDate.getFullYear())
        time.setMonth(testDate.getMonth())
        time.setDate(testDate.getDate())
        time.setHours(testTime.getHours())
        time.setMinutes(testTime.getMinutes())
        time.setSeconds(0)
        time.setMilliseconds(0)
        return time
    }

    render() {
        return (
            <View style={styles.container}>
                <Background />
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={30} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.header}>Appointment Maker</Text>
                <Text style={styles.header1}>Make an appointment with the chosen doctor</Text>
                <View style={styles.information}>
                    <Image style={styles.image}
                        source={this.state.doctor.avatar
                            ? { uri: this.state.doctor.avatar }
                            : tempAvatar
                        } />
                    <Text style={{ fontSize: 18 }}>{this.state.doctor.name}</Text>
                    <Text>Address: {this.state.doctor.address}</Text>
                </View>
                <View style={styles.timePicker}>
                    <TouchableOpacity style={styles.pickerButton} onPress={this.showModeDate}>
                        <Text style={{ color: "#FFF" }}>Choose a Day!</Text>
                    </TouchableOpacity>
                    <Text style={{ alignSelf: "center" }}>{moment(this.state.testDate).format("MMM Do YYYY")}</Text>
                </View>
                {this.state.showDate && (
                    <DateTimePicker
                        value={this.state.testDate}
                        onChange={this.onChangeDate}
                    />
                )}
                <View style={styles.timePicker}>
                    <TouchableOpacity style={styles.pickerButton} onPress={this.showModeTime}>
                        <Text style={{ color: "#FFF" }}>Choose a Time!</Text>
                    </TouchableOpacity>
                    <Text style={{ alignSelf: "center" }}>{moment(this.state.testTime).format('hh:mm a')}</Text>
                </View>
                {this.state.showTime && (
                    <DateTimePicker
                        value={this.state.testTime}
                        mode="time"
                        onChange={this.onChangeTime}
                    />
                )}
                <View style={styles.reason}>
                    <Text style={styles.inputTitle}>Reason</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={reason =>
                            this.setState({ reason: reason })
                        }
                        value={this.state.reason}
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={this.handlePress}>
                    <Text style={{ color: "#FFF" }}>Set Appointment</Text>
                </TouchableOpacity>
                <ConfirmDialog
                    visible={this.state.dialogVisible}
                    title="Alert"
                    message="Are you sure?"
                    onTouchOutside={() => this.setState({ dialogVisible: false })}
                    positiveButton={{
                        title: "YES",
                        onPress: this.handleYes
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
        backgroundColor: '#FFF',
    },
    back: {
        marginTop: -160,
        left: 30,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        color: "#FFF",
        fontSize: 24,
        marginBottom: 8,
        textAlign: "center"
    },
    header1: {
        color: "#FFF",
        marginBottom: 20,
        marginHorizontal: 30
    },
    timePicker: {
        backgroundColor: "#DDD",
        borderRadius: 5,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 30,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    button: {
        alignSelf: "flex-end",
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginVertical: 12,
        marginEnd: 30,
        width: 120
    },
    inputTitle: {
        color: "#8A8F9E",
        fontSize: 12,
        textTransform: "uppercase",
    },
    input: {
        borderBottomColor: "#8A8F9E",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: "#161F3D"
    },
    reason: {
        marginHorizontal: 30,
        marginVertical: 8,
        backgroundColor: "#DDD",
        padding: 10,
        borderRadius: 4
    },
    pickerButton: {
        backgroundColor: "#1565C0",
        borderRadius: 4,
        padding: 5,
        height: 35,
        justifyContent: "center",
        alignItems: "center",
    },
    information: {
        backgroundColor: "#DDD",
        alignItems: "center",
        borderRadius: 5,
        padding: 16,
        marginHorizontal: 30,
    },
    image: {
        width: 100,
        height: 100
    },
})

export default AppointmentMaker