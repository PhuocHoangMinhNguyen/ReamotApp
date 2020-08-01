// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make appointment to the doctor of their chosen,
// who already has access to user medical details.
// Status: In development

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Toast from "react-native-simple-toast"
import { ConfirmDialog } from "react-native-simple-dialogs"
import DateTimePicker from "@react-native-community/datetimepicker"
import moment from "moment"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

export default class AppointmentMaker extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            doctor: {},
            dialogVisible: false,
            showDate: false,
            testDate: new Date(Date.now()),
            showTime: false,
            testTime: new Date(Date.now()),
            reason: ""
        }
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

    // Show Dialog
    handlePress = () => { this.setState({ dialogVisible: true }) }

    // If user click yes when the dialog appears
    handleYes = () => {
        const patient = auth().currentUser.email
        this.setState({ dialogVisible: false })
        firestore().collection("appointment")
            .add({
                doctor: this.state.doctor.name,
                date: moment(this.state.testDate).format("MMM Do YYYY"),
                time: moment(this.state.testTime).format('hh:mm a'),
                reason: this.state.reason,
                patientEmail: patient
            })
            .then(() => {
                Toast.show("Your appointment is confirmed !")
                this.props.navigation.goBack()
            })
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.timePicker}>
                    <Button onPress={this.showModeDate} title="Choose a day!" />
                    <Text>{moment(this.state.testDate).format("MMM Do YYYY")}</Text>
                </View>
                {this.state.showDate && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        timeZoneOffsetInMinutes={0}
                        value={this.state.testDate}
                        mode="day"
                        is24Hour={false}
                        display="default"
                        onChange={this.onChangeDate}
                    />
                )}
                <View style={styles.timePicker}>
                    <Button onPress={this.showModeTime} title="Choose a Time!" />
                    <Text>{moment(this.state.testTime).format('hh:mm a')}</Text>
                </View>
                {this.state.showTime && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        timeZoneOffsetInMinutes={0}
                        value={this.state.testTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
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
                <View style={styles.button}>
                    <Button
                        title="Set Appointment"
                        onPress={this.handlePress} />
                </View>
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
        justifyContent: "center",
        backgroundColor: '#DEE8F1',
    },
    back: {
        position: "absolute",
        top: 24,
        left: 32,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center",
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
        alignItems: "flex-end",
        marginVertical: 8,
        marginHorizontal: 16
    },
    inputTitle: {
        color: "#8A8F9E",
        fontSize: 12,
        textTransform: "uppercase"
    },
    input: {
        borderBottomColor: "#8A8F9E",
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: "#161F3D"
    },
    reason: {
        marginHorizontal: 16,
        marginVertical: 8
    }
})