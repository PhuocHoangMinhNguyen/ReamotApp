// Manual mock for react-native-alarm-notification

const ReactNativeAN = {
  scheduleAlarm:     jest.fn(),
  deleteAlarm:       jest.fn(),
  getScheduledAlarms: jest.fn(() => Promise.resolve([])),
  parseDate:         jest.fn((date) => date.toISOString()),
  stopAlarmSound:    jest.fn(),
};

export default ReactNativeAN;
