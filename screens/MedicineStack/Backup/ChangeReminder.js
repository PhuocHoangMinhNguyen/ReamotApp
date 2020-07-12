import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Button, ScrollView } from 'react-native'
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth";
import Toast from "react-native-simple-toast"

import ReactNativeAN from 'react-native-alarm-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    //small_icon: "ic_launcher",
    message: "Take your Medicine",
};

export default class ChangeReminder extends React.Component {
    _isMounted = false

    static navigationOptions = {
        headerShown: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            stopAlarm: false,
            // Use to delete
            firebaseId: "",
            idAN: "",
            alarmID: "",
            medicine: {},
            alarm: {
                update: '',
                // testDate is the date shown when time is picked
                testDate: new Date(Date.now()),
                fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
                show: false,
                // "Changed" is the value to indicate when a new time is picked
                // change to true when a new time is picked
                changed: false,
                // "Initial" is the inial text next to DateTimePicker,
                // which is the reminder time value inside firestore before editing.
                initial: ''
            }
        };
    }

    componentDidMount() {
        this._isMounted = true
        // Text value from params and put it as state.medicine
        let paramsFromMediInfoScreen = this.props.navigation.state.params.medicine;
        this.setState({ medicine: paramsFromMediInfoScreen });

        // Text value from params and put it as state.alarm.initial
        let paramsTime = this.props.navigation.state.params.itemTime;
        this.setState({
            alarm: {
                ...this.state.alarm,
                initial: paramsTime
            }
        })

        // Find the alarm Id of the reminder that is going to be changed.
        let tempId = ""
        let tempIdAN = ""
        let tempFirebase = ""
        firestore().collection("reminder").onSnapshot((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
                if (documentSnapshot.data().medicine == this.state.medicine.name
                    && documentSnapshot.data().patientEmail == auth().currentUser.email
                    && documentSnapshot.data().times == this.state.alarm.initial) {
                    tempFirebase = documentSnapshot.id
                    tempId = documentSnapshot.data().alarmId
                    tempIdAN = documentSnapshot.data().idAN
                }
            })
            // Assign temp to alarmID.
            this.setState({
                firebaseId: tempFirebase,
                alarmID: tempId,
                idAN: tempIdAN,
            })
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    // delete alarm from reminder collection in firestore
    // Having Problems
    deleteAlarm = () => {
        // Delete the reminder from "reminder" collection
        firestore().collection("reminder").doc(this.state.firebaseId).delete()
            .then(() => {
                ReactNativeAN.deleteAlarm(this.state.idAN.toString());
                Toast.show("Reminder Deleted!")
                this.props.navigation.goBack()
            })
    }

    /* This is used to check the scheduled Alarms 
        - Uncomment only in testing phase
        - Delete prior release
    */
    getScheduledAlarms = async () => {
        const alarm = await ReactNativeAN.getScheduledAlarms();
        this.setState({
            alarm: {
                ...this.state.alarm,
                update: JSON.stringify(alarm)
            }
        });
    }

    showMode = () => {
        this.setState({
            alarm: {
                ...this.state.alarm,
                show: true
            }
        })
    }

    onChange = (event, selectedDate) => {
        const { testDate } = this.state.alarm;
        let currentDate = selectedDate || testDate;
        this.setState({
            alarm: {
                ...this.state.alarm,
                show: Platform.OS === 'ios',
                testDate: currentDate,
                fireDate: ReactNativeAN.parseDate(currentDate),
                changed: true,
            }
        });
    }

    render() {
        const { update, testDate, show, changed, initial } = this.state.alarm;
        let message;
        if (changed == true) {
            message = moment(testDate).format('hh:mm a')
        } else {
            message = initial
        }
        return (
            <ScrollView style={styles.container}>
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
                <View style={{ flex: 1, padding: 20 }}>
                    <View>
                        <View style={styles.timePicker}>
                            <Button onPress={this.showMode} title="Show time picker!" />
                            <Text>{message}</Text>
                        </View>
                        {show && (
                            <DateTimePicker
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
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={() => {
                                this.props.navigation.navigate("BarcodeScan", {
                                    medicine: this.props.navigation.state.params.medicine,
                                    itemTime: this.props.navigation.state.params.itemTime,
                                    firebaseId: this.state.firebaseId,
                                    idAN: this.state.idAN
                                })
                            }}
                            title="Stop Alarm Sound"
                            color="#018ABE"
                        />
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.deleteAlarm}
                            title="Delete Alarm"
                            color="#018ABE"
                        />
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.getScheduledAlarms}
                            title="Get Scheduled Alarm"
                            color="#018ABE"
                        />
                    </View>
                    <Text>{update}</Text>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50
    },
    back: {
        position: "absolute",
        marginTop: -60,
        top: 24,
        left: 32,
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
        marginVertical: 8,
        marginHorizontal: 16
    },
    timePicker: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 16,
        marginVertical: 8,
        flexDirection: "row",
        justifyContent: "space-between"
    },
});