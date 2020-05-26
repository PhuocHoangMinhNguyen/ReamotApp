import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import ReactNativeAN from 'react-native-alarm-notification';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment'

const alarmNotifData = {
    alarm_id: "22",
    title: "Alarm",
    message: "Stand up",
    vibrate: true,
    play_sound: true,
    schedule_type: "once",
    channel: "wakeup",
    data: { content: "my notification id is 22" },
    loop_sound: true,
};

class AlarmApp extends Component {
    constructor(props, context) {
        super(props, context);

        const fire_date = ReactNativeAN.parseDate(new Date(Date.now()));

        this.state = {
            testDate: new Date(Date.now()),
            fireDate: fire_date,
            show: false
        };
        this.setAlarm = this.setAlarm.bind(this);
        this.stopAlarm = this.stopAlarm.bind(this);
    }

    setAlarm = () => {
        const { fireDate } = this.state;
        const details = { ...alarmNotifData, fire_date: fireDate };
        console.log(`alarm set: ${fireDate}`);
        this.setState({ update: `alarm set: ${fireDate}` });
        ReactNativeAN.scheduleAlarm(details);
    };

    stopAlarm = () => {
        this.setState({ update: '' });
        ReactNativeAN.stopAlarmSound();
    };

    showMode = () => {
        this.setState({ show: true })
    }

    onChange = (event, selectedDate) => {
        let currentDate = selectedDate || this.state.testDate;
        this.setState({ show: Platform.OS === 'ios', testDate: currentDate, fireDate: ReactNativeAN.parseDate(currentDate) });
        console.log("TestDate: " + this.state.testDate)
        console.log("FireDate: " + this.state.fireDate)
    }

    render() {
        return (
            <View style={{ flex: 1, padding: 20 }}>
                <View>
                    <View style={styles.timePicker}>
                        <Button onPress={this.showMode} title="Show time picker!" />
                        <Text>{moment(this.state.testDate).format('hh:mm a')}</Text>
                    </View>
                    {this.state.show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            timeZoneOffsetInMinutes={0}
                            value={this.state.testDate}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={this.onChange}
                        />
                    )}
                </View>
                <View style={{ marginVertical: 18 }}>
                    <Button
                        onPress={this.setAlarm}
                        title="Set Alarm"
                        color="#7fff00"
                    />
                </View>
                <View style={{ marginVertical: 18 }}>
                    <Button
                        onPress={this.stopAlarm}
                        title="Stop Alarm Sound"
                        color="#841584"
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    timePicker: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between"
    }
})

export default AlarmApp;