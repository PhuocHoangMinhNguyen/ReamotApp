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
    const querySnapshot = await firestore()
      .collection('reminder')
      .where('patientEmail', '==', patientEmail)
      .get();
    querySnapshot.forEach(documentSnapshot => {
      const idAN = documentSnapshot.data().idAN;
      if (idAN) {
        ReactNativeAN.deleteAlarm(idAN.toString());
      }
    });
  };

  setReminders = async patientEmail => {
    // Double check if there is any alarm working before logging in
    const alarm = await ReactNativeAN.getScheduledAlarms();
    if (__DEV__) { console.log(alarm); }

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
      const alarmID = Math.floor(Math.random() * 1e9).toString();
      const reminderTime = documentSnapshot.data().time.toDate();
      while (reminderTime < Date.now()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      console.log(moment(reminderTime).format());
      const reminderType = documentSnapshot.data().type;
      medicineList.forEach(medi => {
        if (medi.name === documentSnapshot.data().medicine) {
          const details = {
            ...alarmNotifData,
            schedule_type: reminderType === 'Weekly' ? 'weekly' : 'once',
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

    // Poll getScheduledAlarms() until all expected alarm IDs appear (native side
    // may not register them synchronously). Retry up to 10 times, 100 ms apart.
    const expectedIds = new Set(pendingUpdates.map(u => u.alarmID));
    let scheduledAlarms = [];
    for (let attempt = 0; attempt < 10; attempt++) {
      scheduledAlarms = await ReactNativeAN.getScheduledAlarms();
      const foundIds = new Set(scheduledAlarms.map(a => a.alarmId));
      if ([...expectedIds].every(id => foundIds.has(id))) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Build a single batch and commit once instead of one write per reminder.
    const batch = firestore().batch();
    pendingUpdates.forEach(({ alarmID, docId, reminderTime }) => {
      let idAN = '';
      for (let i = 0; i < scheduledAlarms.length; i++) {
        if (scheduledAlarms[i].alarmId === alarmID) {
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
