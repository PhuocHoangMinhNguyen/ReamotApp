import React from 'react';
import { render, act } from '@testing-library/react-native';
import firestore from '@react-native-firebase/firestore';

jest.mock('../../src/components/Background', () => () => null);
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ testID }) => React.createElement(View, { testID: testID || 'datetimepicker' });
});
jest.mock('react-native-chart-kit', () => ({
  ProgressChart: () => null,
}));

// Flush all promises and pending async lifecycle methods.
const flushAsync = () => act(async () => {});

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

describe('CalendarScreen', () => {
  // Re-require CalendarScreen in each test so that the module-level
  // _medicineCache variable is reset to null for every test.
  let CalendarScreen;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.isolateModules(() => {
      CalendarScreen = require('../../src/screens/CalendarStack/CalendarScreen').default;
    });
  });

  it('renders the History header', async () => {
    firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot([]));
    const { getByText } = render(<CalendarScreen navigation={mockNavigation} />);
    await flushAsync();
    expect(getByText('History')).toBeTruthy();
  });

  it('fetches the medicine catalogue on first mount', async () => {
    firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot([]));
    render(<CalendarScreen navigation={mockNavigation} />);
    await flushAsync();
    expect(firestore.mocks.get).toHaveBeenCalled();
  });

  it('subscribes to history for the selected date', async () => {
    firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot([]));
    render(<CalendarScreen navigation={mockNavigation} />);
    await flushAsync();
    expect(firestore.mocks.where).toHaveBeenCalledWith(
      'patientEmail',
      '==',
      'patient@example.com',
    );
    expect(firestore.mocks.onSnapshot).toHaveBeenCalled();
  });

  it('renders history items from snapshot', async () => {
    firestore.mocks.get.mockResolvedValueOnce(
      firestore.makeSnapshot([
        { id: 'med1', data: () => ({ name: 'Aspirin', image: null, description: 'Pain relief', barcode: '001' }) },
      ]),
    );
    firestore.mocks.onSnapshot.mockImplementationOnce(cb => {
      cb(
        firestore.makeSnapshot([
          {
            id: 'hist1',
            data: () => ({
              medicine: 'Aspirin',
              status: 'taken',
              patientEmail: 'patient@example.com',
              date: 'March 5th 2026',
              startTime: null,
            }),
          },
        ]),
      );
      return jest.fn();
    });

    const { getByText } = render(<CalendarScreen navigation={mockNavigation} />);
    await flushAsync();
    expect(getByText('Aspirin')).toBeTruthy();
  });

  it('shows "No Medicine Taken/Missed" when history is empty', async () => {
    firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot([]));
    firestore.mocks.onSnapshot.mockImplementationOnce(cb => {
      cb(firestore.makeSnapshot([]));
      return jest.fn();
    });

    const { getByText } = render(<CalendarScreen navigation={mockNavigation} />);
    await flushAsync();
    expect(getByText('No Medicine Taken/Missed')).toBeTruthy();
  });

  it('unsubscribes from Firestore on unmount', async () => {
    firestore.mocks.get.mockResolvedValueOnce(firestore.makeSnapshot([]));
    const mockUnsub = jest.fn();
    firestore.mocks.onSnapshot.mockReturnValueOnce(mockUnsub);

    const { unmount } = render(<CalendarScreen navigation={mockNavigation} />);
    await flushAsync();
    unmount();

    expect(mockUnsub).toHaveBeenCalledTimes(1);
  });
});
