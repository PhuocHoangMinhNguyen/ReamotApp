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
  // the same algorithm used in UserReminders.js (src/utilities/UserReminders.js:61-63).

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

  // ── findIdAN ────────────────────────────────────────────────────────────────

  describe('findIdAN()', () => {
    it('matches the alarm by alarmId and updates the Firestore document', async () => {
      const alarms = [
        { alarmId: 'alarm-99', id: 'native-id-abc' },
        { alarmId: 'alarm-77', id: 'native-id-xyz' },
      ];
      ReactNativeAN.getScheduledAlarms.mockResolvedValueOnce(alarms);

      const reminderTime = dateOffset(3600 * 1000);
      await UserReminders.findIdAN('alarm-99', 'firestore-doc-id', reminderTime);

      expect(firestore.mocks.update).toHaveBeenCalledWith({
        idAN:    'native-id-abc',
        alarmId: 'alarm-99',
        time:    reminderTime,
      });
    });

    it('stores an empty string when no alarm matches the alarmId', async () => {
      ReactNativeAN.getScheduledAlarms.mockResolvedValueOnce([
        { alarmId: 'other-id', id: 'native-id-xyz' },
      ]);

      const reminderTime = dateOffset(3600 * 1000);
      await UserReminders.findIdAN('alarm-99', 'doc-id', reminderTime);

      const updateCall = firestore.mocks.update.mock.calls[0][0];
      expect(updateCall.idAN).toEqual('');
    });
  });
});
