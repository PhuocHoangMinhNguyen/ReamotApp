// Author: Phuoc Hoang Minh Nguyen
// Description: 
// Delete all reminders when logging out, 
// and set all reminders when logging in
// Status: In development
import ReactNativeAN from 'react-native-alarm-notification'
import firestore from "@react-native-firebase/firestore"

// Notification Data Structure.
const alarmNotifData = {
    schedule_type: "once",
    channel: "reminder",
    loop_sound: true,
    message: "Take your Medicine",
}

class UserReminders {
    deleteReminders = () => {
        let temp = []
        firestore().collection('reminder').onSnapshot(querySnapshot => {
            querySnapshot.forEach(documentSnapshot => {
                temp.push(documentSnapshot.data().idAN)
            })
            for (let i = 0; i < temp.length; i++) {
                ReactNativeAN.deleteAlarm(temp[i].toString())
            }
        })
    }
    setReminders = () => {
        const alarmID = Math.floor(Math.random() * 10000).toString()
        firestore().collection('reminder').onSnapshot(querySnapshot => {
            querySnapshot.forEach(documentSnapshot => {
                const details = {
                    ...alarmNotifData,
                    // Step 1: Find FireDate
                    //fire_date: ReactNativeAN.parseDate(),
                    title: documentSnapshot.data().medicine,
                    alarm_id: alarmID
                }
                ReactNativeAN.scheduleAlarm(details)

                // Get the NEW alarm's "id", set it as idAN to update in Cloud Firestore
                const alarm = await ReactNativeAN.getScheduledAlarms()
                let idAN = ""
                for (let i = 0; i < alarm.length; i++) {
                    if (alarm[i].alarmId == details.alarm_id) {
                        idAN = alarm[i].id
                    }
                }

                firestore().collection("reminder").doc(documentSnapshot.id)
                    .update({
                        idAN: idAN,
                        alarmId: alarmID
                    })
            })
        })
    }
}

export default new UserReminders()