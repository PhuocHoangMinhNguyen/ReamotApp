import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from 'react-native'
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"

import ReactNativeAN from 'react-native-alarm-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'

const alarmNotifData = {
    vibrate: true,
    play_sound: true,
    schedule_type: "once",
    channel: "wakeup",
    loop_sound: true,
    message: " "
};

export default class NewReminder extends React.Component {
    static navigationOptions = {
        headerShown: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            medicine: {},
            reminder: {},
            alarm: {
                update: '',
                testDate: new Date(Date.now()),
                fireDate: ReactNativeAN.parseDate(new Date(Date.now())),
                show: false
            }
        };
        this.scheduleAlarm = this.scheduleAlarm.bind(this);
        this.stopAlarm = this.stopAlarm.bind(this);
    }

    componentDidMount() {
        let paramsFromMediInfoScreen = this.props.navigation.state.params;
        this.setState({ medicine: paramsFromMediInfoScreen });
    }

    scheduleAlarm = () => {
        const { testDate, fireDate } = this.state.alarm;
        const { name } = this.state.medicine;
        const details = { ...alarmNotifData, fire_date: fireDate, title: name, alarm_id: `${name} ${moment(testDate).format('hh:mm a')}` };
        console.log(`alarm set: ${fireDate}`);
        this.setState({
            alarm: {
                ...this.state.alarm,
                update: `alarm set: ${fireDate}`
            }
        });
        ReactNativeAN.scheduleAlarm(details);
        firestore().collection("reminder").add({
            id: `${name} ${moment(testDate).format('hh:mm a')}`,
            medicine: name,
            times: moment(testDate).format('hh:mm a'),
            patientName: null,
        })
        this.props.navigation.goBack()
    };

    stopAlarm = () => {
        this.setState({
            alarm: {
                ...this.state.alarm,
                update: ''
            }
        });
        ReactNativeAN.stopAlarmSound();
    };

    viewAlarms = async () => {
        const list = await ReactNativeAN.getScheduledAlarms();
        this.setState({
            alarm: {
                ...this.state.alarm,
                update: JSON.stringify(list)
            }
        });
    }

    deleteAlarm = () => {
        const { name } = this.state.medicine
        const { testDate } = this.state.alarm
        console.log(`${name} ${moment(testDate).format('hh:mm a')}`)
        firestore().collection("reminder").doc(`${name} ${moment(testDate).format('hh:mm a')}`)
        this.props.navigation.goBack()
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
        const { testDate, fireDate } = this.state.alarm;
        let currentDate = selectedDate || testDate;
        this.setState({
            alarm: {
                ...this.state.alarm,
                show: Platform.OS === 'ios',
                testDate: currentDate,
                fireDate: ReactNativeAN.parseDate(currentDate)
            }
        });
        console.log("TestDate: " + testDate)
        console.log("FireDate: " + fireDate)
    }

    render() {
        const { update, testDate, show } = this.state.alarm;
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="ios-arrow-round-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.information}>
                    <View style={{ flexDirection: "row" }}>
                        <Image
                            source={
                                this.state.medicine.image
                                    ? { uri: this.state.medicine.image }
                                    : require("../assets/tempAvatar.jpg")
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
                            onPress={this.stopAlarm}
                            title="Stop Alarm Sound"
                            color="#018ABE"
                        />
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.viewAlarms}
                            title="See all active alarms"
                            color="#018ABE"
                        />
                    </View>
                    <View style={{ marginVertical: 5 }}>
                        <Button
                            onPress={this.deleteAlarm}
                            title="Delete alarm"
                            color="#018ABE"
                        />
                    </View>
                    <Text>{update}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 100
    },
    back: {
        position: "absolute",
        marginTop: -100,
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
