// Author: Phuoc Hoang Minh Nguyen
// Description: Delete all reminders when logging out,
// and set all reminders when logging in
// Status: Optimized
import ReactNativeAN from 'react-native-alarm-notification';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

// Notification Data Structure.
const alarmNotifData = {
  schedule_type: 'once',
  channel: 'reminder',
  loop_sound: true,
  message: 'Take your Medicine',
};

class UserReminders {
  // Delete All Existing Reminders on the phone when logging out
  deleteReminders = async patientEmail => {
    firestore()
      .collection('reminder')
      .where('patientEmail', '==', patientEmail)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(documentSnapshot => {
          ReactNativeAN.deleteAlarm(documentSnapshot.data().idAN.toString());
        });
      });
  };

  setReminders = async patientEmail => {
    // Double check if there is any alarm working before logging in
    const alarm = await ReactNativeAN.getScheduledAlarms();
    console.log(alarm);

    const medicineSnapshot = await firestore().collection('medicine').get();
    const medicineList = [];
    medicineSnapshot.forEach(doc => medicineList.push(doc.data()));

    const reminderSnapshot = await firestore()
      .collection('reminder')
      .where('patientEmail', '==', patientEmail)
      .get();

    // Schedule all alarms and collect the (alarmId, docId, reminderTime) tuples.
    const pendingUpdates = [];
    reminderSnapshot.forEach(documentSnapshot => {
      const alarmID = Math.floor(Math.random() * 10000).toString();
      const reminderTime = documentSnapshot.data().time.toDate();
      while (reminderTime < Date.now()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      console.log(moment(reminderTime).format());
      medicineList.forEach(medi => {
        if (medi.name == documentSnapshot.data().medicine) {
          const details = {
            ...alarmNotifData,
            fire_date: ReactNativeAN.parseDate(reminderTime),
            title: documentSnapshot.data().medicine,
            alarm_id: alarmID,
            data: {
              image: medi.image,
              name: medi.name,
              description: medi.description,
              barcode: medi.barcode,
              itemTime: reminderTime.toString(),
            },
          };
          ReactNativeAN.scheduleAlarm(details);
          pendingUpdates.push({
            alarmID,
            docId: documentSnapshot.id,
            reminderTime,
          });
        }
      });
    });

    // Fetch scheduled alarms once now that all alarms have been registered.
    const scheduledAlarms = await ReactNativeAN.getScheduledAlarms();

    // Build a single batch and commit once instead of one write per reminder.
    const batch = firestore().batch();
    pendingUpdates.forEach(({ alarmID, docId, reminderTime }) => {
      let idAN = '';
      for (let i = 0; i < scheduledAlarms.length; i++) {
        if (scheduledAlarms[i].alarmId == alarmID) {
          idAN = scheduledAlarms[i].id;
          break;
        }
      }
      batch.update(firestore().collection('reminder').doc(docId), {
        idAN,
        alarmId: alarmID,
        time: reminderTime,
      });
    });
    await batch.commit();
  };
}

export default new UserReminders();
