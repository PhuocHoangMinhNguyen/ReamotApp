import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Button, ScrollView } from 'react-native'
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"
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

export default class NewReminder extends React.Component {
    _isMounted = false

    static navigationOptions = {
        headerShown: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            reminderId: Math.floor(Math.random() * 100).toString(),
            medicine: {},
            alarm: {
                update: '',
                testDate: new Date(Date.now()),
                fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
                show: false
            }
        };
        this.scheduleAlarm = this.scheduleAlarm.bind(this);
    }

    componentDidMount() {
        this._isMounted = true
        let paramsFromMediInfoScreen = this.props.navigation.state.params;
        this.setState({ medicine: paramsFromMediInfoScreen });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getANid = async (details) => {
        const { testDate } = this.state.alarm
        const { name } = this.state.medicine
        const { reminderId } = this.state
        // Get the alarm's "id", set it as idAN
        const alarm = await ReactNativeAN.getScheduledAlarms()
        let idAN = ""
        for (let i = 0; i < alarm.length; i++) {
            if (alarm[i].alarmId == details.alarm_id) {
                idAN = alarm[i].id
            }
        }
        // Officially add the alarm details into Firebase, alarm id is also from reminderId
        firestore().collection("reminder")
            .add({
                alarmId: reminderId,
                idAN: idAN,
                medicine: name,
                times: moment(testDate).format('hh:mm a'),
                patientEmail: auth().currentUser.email,
            })
            .then(() => {
                Toast.show("Reminder Set!")
                this.props.navigation.goBack()
            })
    }

    scheduleAlarm = () => {
        const { fireDate } = this.state.alarm
        const { name } = this.state.medicine
        // Put more detail into Notification Data Structure, then set it as details for ReactNativeAN.
        // alarm_id is the new reminder id from reminderId, to convert from int to string.
        const details = {
            ...alarmNotifData,
            fire_date: fireDate,
            title: name,
            alarm_id: this.state.reminderId,
        };
        // Officially make a new alarm with information from details.
        ReactNativeAN.scheduleAlarm(details);
        this.getANid(details);
    };

    /* This is used to check the scheduled Alarms 
        - Uncomment only in testing phase
        - Delete prior release
    */
    getScheduledAlarms = async () => {
        const alarm = await ReactNativeAN.getScheduledAlarms()
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
                fireDate: ReactNativeAN.parseDate(currentDate)
            }
        });
    }

    render() {
        const { update, testDate, show } = this.state.alarm;
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
                            <Text>{moment(testDate).format('hh:mm a')}</Text>
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
                            onPress={this.scheduleAlarm}
                            title="Schedule Alarm"
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
        marginHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between"
    },
});
