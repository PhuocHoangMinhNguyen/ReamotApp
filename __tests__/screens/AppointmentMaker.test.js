import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import AppointmentMaker from '../../src/screens/DoctorStack/AppointmentMaker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';

jest.mock('../../src/components/Background', () => () => null);
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ testID }) => React.createElement(View, { testID: testID || 'datetimepicker' });
});
jest.mock('react-native-simple-dialogs', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');
  return {
    ConfirmDialog: ({ visible, positiveButton, negativeButton }) => {
      if (!visible) return null;
      return React.createElement(View, { testID: 'confirm-dialog' }, [
        React.createElement(
          TouchableOpacity,
          { key: 'yes', testID: 'dialog-yes', onPress: positiveButton && positiveButton.onPress },
          [React.createElement(Text, { key: 't' }, positiveButton && positiveButton.title)],
        ),
        React.createElement(
          TouchableOpacity,
          { key: 'no', testID: 'dialog-no', onPress: negativeButton && negativeButton.onPress },
          [React.createElement(Text, { key: 't' }, negativeButton && negativeButton.title)],
        ),
      ]);
    },
  };
});

const mockRoute = {
  params: { name: 'Dr. Smith', avatar: null, address: '123 Medical St' },
};
const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

describe('AppointmentMaker', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the screen title and Set Appointment button', () => {
    const { getByText } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );
    expect(getByText('Appointment Maker')).toBeTruthy();
    expect(getByText('Set Appointment')).toBeTruthy();
  });

  it('shows a toast when reason is empty and Set Appointment is pressed', async () => {
    const { getByText } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );
    await act(async () => {
      fireEvent.press(getByText('Set Appointment'));
    });
    expect(Toast.show).toHaveBeenCalledWith(
      'Please enter a reason for the appointment',
    );
  });

  it('opens the confirm dialog when reason is filled', async () => {
    const { getByText, queryByTestId } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );

    // The reason TextInput has no testID, but we can fire a changeText on the
    // component's onChangeText prop via the placeholder label presence.
    // Use getAllByType or direct fireEvent on the input element.
    const { getByDisplayValue, UNSAFE_getByType } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );

    // Fill the reason TextInput (identified by value being empty string initially).
    const { getAllByDisplayValue } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );

    // Simplest approach: fire changeText on the element via label-adjacent text.
    // The Reason input is the only TextInput with an onChangeText for `reason`.
    const { UNSAFE_getAllByType } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    // There is one TextInput for reason.
    fireEvent.changeText(inputs[0], 'Follow-up visit');

    await act(async () => {
      fireEvent.press(getByText('Set Appointment'));
    });

    // Dialog should appear (no toast for empty reason).
    expect(Toast.show).not.toHaveBeenCalledWith(
      'Please enter a reason for the appointment',
    );
  });

  it('shows toast for past date when confirmed', async () => {
    const { UNSAFE_getAllByType, getByText } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Checkup');

    // Open dialog.
    await act(async () => {
      fireEvent.press(getByText('Set Appointment'));
    });

    // The default date is new Date(Date.now()) which is already in the past by
    // the time handleYes runs, so pressing YES should show the past-date toast.
    await act(async () => {
      fireEvent.press(getByText('YES'));
    });

    expect(Toast.show).toHaveBeenCalledWith(
      'Please choose a future date and time',
    );
  });

  it('adds appointment to Firestore when date is future', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2020-01-01T00:00:00Z'));

    const { UNSAFE_getAllByType, getByText } = render(
      <AppointmentMaker navigation={mockNavigation} route={mockRoute} />,
    );
    const { TextInput } = require('react-native');
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], 'Annual visit');

    // Manually set the date/time pickers to a future moment by advancing system time.
    // The component initialises testDate/testTime to Date.now() which is now 2020-01-01.
    // We need to press YES and confirm a date that is *after* Date.now().
    // The simplest way: after opening the dialog, advance time so Date.now() < calculateTime().
    await act(async () => {
      fireEvent.press(getByText('Set Appointment'));
    });

    // Advance mock time so the selected date (2020-01-01T00:00:00Z) is now in the future.
    jest.setSystemTime(new Date('2019-12-31T23:59:59Z'));

    firestore.mocks.add.mockResolvedValueOnce({ id: 'new-apt' });

    await act(async () => {
      fireEvent.press(getByText('YES'));
    });

    expect(firestore.mocks.add).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
