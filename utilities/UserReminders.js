// Author: Phuoc Hoang Minh Nguyen
// Description: 
// Delete all reminders when logging out, 
// and set all reminders when logging in
// Status: In development
import ReactNativeAN from 'react-native-alarm-notification'
import firestore from "@react-native-firebase/firestore"

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

    }
}

export default new UserReminders()