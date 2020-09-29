// Author: Phuoc Hoang Minh Nguyen
// Description: Delete all reminders when logging out, 
// and set all reminders when logging in
// Status: Optimized
import ReactNativeAN from 'react-native-alarm-notification'
import firestore from "@react-native-firebase/firestore"
import moment from 'moment'

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    message: "Take your Medicine",
}

class UserReminders {
    // Delete All Existing Reminders on the phone when logging out
    deleteReminders = async patientEmail => {
        firestore().collection('reminder')
            .where('patientEmail', '==', patientEmail)
            .get().then(querySnapshot => {
                querySnapshot.forEach(documentSnapshot => {
                    ReactNativeAN.deleteAlarm(documentSnapshot.data().idAN.toString())
                })
            })
    }

    // calculate reminder time (in date format) based on time on Firebase (which was in 
    // string format), to set that reminder time using react-native-alarm-notification
    calculateReminderTime = reminderTime => {
        const hour = parseInt(reminderTime.substring(0, 2))
        const minute = parseInt(reminderTime.substring(3, 5))
        const morning_afternoon = reminderTime.substring(6, 8)
        const now = new Date()
        if (morning_afternoon == "am") {
            if (hour == 12) {
                now.setHours(hour - 12, minute, 0)
            } else {
                now.setHours(hour, minute, 0)
            }
        } else {
            if (hour == 12) {
                now.setHours(hour, minute, 0)
            } else {
                now.setHours(hour + 12, minute, 0)
            }
        }
        if (now <= Date.now()) {
            now.setDate(now.getDate() + 1)
        }
        console.log(moment(now).format())
        return now
    }

    // Get the NEW alarm's "id", set it as idAN to update in Cloud Firestore
    findIdAN = async (alarm_id, id) => {
        const alarm = await ReactNativeAN.getScheduledAlarms()
        let idAN = ""
        for (let i = 0; i < alarm.length; i++) {
            if (alarm[i].alarmId == alarm_id) {
                idAN = alarm[i].id
            }
        }
        // This is having problem because you cannot set a firestore inside a firestore.
        firestore().collection('reminder').doc(id).update({
            idAN: idAN,
            alarmId: alarm_id
        })
    }

    setReminders = async (patientEmail) => {
        // Double check if there is any alarm working before logging in
        const alarm = await ReactNativeAN.getScheduledAlarms()
        console.log(alarm)

        firestore().collection('reminder')
            .where('patientEmail', '==', patientEmail)
            .get().then(querySnapshot => {
                querySnapshot.forEach(documentSnapshot => {
                    const alarmID = Math.floor(Math.random() * 10000).toString()
                    // calculate reminder time (in date format) based on time on Firebase (which was in 
                    // string format), to set that reminder time using react-native-alarm-notification
                    const reminderTime = this.calculateReminderTime(documentSnapshot.data().times)
                    console.log(moment(reminderTime).format())
                    const details = {
                        ...alarmNotifData,
                        fire_date: ReactNativeAN.parseDate(reminderTime),
                        title: documentSnapshot.data().medicine,
                        alarm_id: alarmID
                    }
                    ReactNativeAN.scheduleAlarm(details)

                    // Get the NEW alarm's "id", set it as idAN to update in Cloud Firestore
                    this.findIdAN(details.alarm_id, documentSnapshot.id)
                })
            })
    }
}

export default new UserReminders()