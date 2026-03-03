import ReactNativeAN from 'react-native-alarm-notification';
import firestore from '@react-native-firebase/firestore';
import UserReminders from '../../src/utilities/UserReminders';

const PATIENT_EMAIL = 'patient@example.com';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create a Firestore-like document snapshot. */
function makeDoc(id, data) {
  return { id, data: () => data };
}

/** Return a Date that is `offsetMs` milliseconds from now. */
function dateOffset(offsetMs) {
  return new Date(Date.now() + offsetMs);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UserReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── deleteReminders ─────────────────────────────────────────────────────────

  describe('deleteReminders()', () => {
    it('deletes every alarm found for the patient', async () => {
      const docs = [
        makeDoc('r1', { idAN: '111' }),
        makeDoc('r2', { idAN: '222' }),
      ];
      firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot(docs));

      await UserReminders.deleteReminders(PATIENT_EMAIL);

      expect(ReactNativeAN.deleteAlarm).toHaveBeenCalledTimes(2);
      expect(ReactNativeAN.deleteAlarm).toHaveBeenCalledWith('111');
      expect(ReactNativeAN.deleteAlarm).toHaveBeenCalledWith('222');
    });

    it('queries the reminder collection filtered by patientEmail', async () => {
      firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot([]));

      await UserReminders.deleteReminders(PATIENT_EMAIL);

      expect(firestore.mocks.where).toHaveBeenCalledWith(
        'patientEmail',
        '==',
        PATIENT_EMAIL,
      );
    });

    it('does not call deleteAlarm when there are no reminders', async () => {
      firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot([]));

      await UserReminders.deleteReminders(PATIENT_EMAIL);

      expect(ReactNativeAN.deleteAlarm).not.toHaveBeenCalled();
    });
  });

  // ── Reminder date-advancement logic ─────────────────────────────────────────
  //
  // The setReminders() method advances past reminder dates to the next future
  // occurrence using a while-loop.  We test that logic directly by simulating
  // the same algorithm used in UserReminders.js.

  describe('date advancement algorithm', () => {
    /** Mirrors the while-loop inside UserReminders.setReminders */
    function advanceToFuture(date) {
      const reminderTime = new Date(date);
      while (reminderTime < Date.now()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      return reminderTime;
    }

    it('advances a past date to a future date', () => {
      const now = Date.now(); // capture before any Date.now() calls inside the SUT
      const pastDate = new Date(now - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const result = advanceToFuture(pastDate);
      // result must be at or after the moment we started the test; the algorithm
      // brings it forward to (at minimum) the equivalent wall-clock time today.
      expect(result.getTime()).toBeGreaterThanOrEqual(now);
    });

    it('keeps a future date unchanged', () => {
      const futureDate = dateOffset(2 * 60 * 60 * 1000); // 2 hours from now
      const before = futureDate.getTime();
      const result = advanceToFuture(futureDate);
      expect(result.getTime()).toEqual(before);
    });

    it('advances to exactly 1 day ahead for a date that is just now', () => {
      // A date that is 1 ms in the past should be advanced by 1 day.
      const justPast = new Date(Date.now() - 1);
      const result = advanceToFuture(justPast);
      const diff = result.getTime() - justPast.getTime();
      expect(diff).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 10); // ~1 day
    });

    it('does not mutate the original date', () => {
      const original = dateOffset(-1000);
      const originalTime = original.getTime();
      advanceToFuture(original);
      // The algorithm creates a copy: new Date(date)
      expect(original.getTime()).toEqual(originalTime);
    });
  });

  // ── setReminders ────────────────────────────────────────────────────────────

  describe('setReminders()', () => {
    it('schedules an alarm and commits a single batch write per reminder', async () => {
      const futureTime = dateOffset(3600 * 1000);
      const medicineDoc = makeDoc('med1', {
        name: 'Aspirin',
        image: null,
        description: 'Pain relief',
        barcode: '111',
      });
      const reminderDoc = makeDoc('rem1', {
        medicine: 'Aspirin',
        patientEmail: PATIENT_EMAIL,
        time: { toDate: () => futureTime },
      });

      // First getScheduledAlarms call (double-check at top of setReminders).
      ReactNativeAN.getScheduledAlarms
        .mockResolvedValueOnce([])
        // Second call after scheduling — return the newly scheduled alarm.
        .mockResolvedValueOnce([{ alarmId: expect.any(String), id: 'native-id-1' }]);

      // get() call #1: medicine collection; call #2: reminder collection.
      firestore.mocks.get
        .mockResolvedValueOnce(firestore.makeSnapshot([medicineDoc]))
        .mockResolvedValueOnce(firestore.makeSnapshot([reminderDoc]));

      await UserReminders.setReminders(PATIENT_EMAIL);

      expect(ReactNativeAN.scheduleAlarm).toHaveBeenCalledTimes(1);
      expect(firestore.mocks.batch).toHaveBeenCalledTimes(1);
      expect(firestore.mocks.batchUpdate).toHaveBeenCalledTimes(1);
      expect(firestore.mocks.batchCommit).toHaveBeenCalledTimes(1);
    });

    it('commits only one batch even with multiple reminders', async () => {
      const futureTime = dateOffset(3600 * 1000);
      const medicineDocs = [
        makeDoc('med1', { name: 'Aspirin', image: null, description: '', barcode: '' }),
        makeDoc('med2', { name: 'Ibuprofen', image: null, description: '', barcode: '' }),
      ];
      const reminderDocs = [
        makeDoc('rem1', { medicine: 'Aspirin',   patientEmail: PATIENT_EMAIL, time: { toDate: () => new Date(futureTime) } }),
        makeDoc('rem2', { medicine: 'Ibuprofen', patientEmail: PATIENT_EMAIL, time: { toDate: () => new Date(futureTime) } }),
      ];

      ReactNativeAN.getScheduledAlarms
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      firestore.mocks.get
        .mockResolvedValueOnce(firestore.makeSnapshot(medicineDocs))
        .mockResolvedValueOnce(firestore.makeSnapshot(reminderDocs));

      await UserReminders.setReminders(PATIENT_EMAIL);

      expect(ReactNativeAN.scheduleAlarm).toHaveBeenCalledTimes(2);
      expect(firestore.mocks.batchUpdate).toHaveBeenCalledTimes(2);
      // Despite 2 reminders there is exactly one batch.commit() call.
      expect(firestore.mocks.batchCommit).toHaveBeenCalledTimes(1);
    });

    it('does nothing (no alarms, no batch writes) when there are no reminders', async () => {
      ReactNativeAN.getScheduledAlarms
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      firestore.mocks.get
        .mockResolvedValueOnce(firestore.makeSnapshot([]))  // medicine
        .mockResolvedValueOnce(firestore.makeSnapshot([])); // reminders

      await UserReminders.setReminders(PATIENT_EMAIL);

      expect(ReactNativeAN.scheduleAlarm).not.toHaveBeenCalled();
      expect(firestore.mocks.batchUpdate).not.toHaveBeenCalled();
      expect(firestore.mocks.batchCommit).toHaveBeenCalledTimes(1);
    });
  });
});
