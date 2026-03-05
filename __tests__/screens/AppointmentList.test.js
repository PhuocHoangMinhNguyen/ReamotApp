import React from 'react';
import { render, act } from '@testing-library/react-native';
import AppointmentList from '../../src/screens/MoreStack/AppointmentList';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

jest.mock('../../src/components/Background', () => () => null);

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

describe('AppointmentList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default currentUser after any test that nulls it.
    auth.mocks.currentUser = { uid: 'test-uid-123', email: 'patient@example.com' };
  });

  it('renders section headers without crashing', () => {
    const { getByText } = render(<AppointmentList navigation={mockNavigation} />);
    expect(getByText('Appointment List')).toBeTruthy();
    expect(getByText('Upcoming Appointments')).toBeTruthy();
    expect(getByText('Past Appointments')).toBeTruthy();
  });

  it('queries appointments filtered by patientEmail', () => {
    render(<AppointmentList navigation={mockNavigation} />);
    expect(firestore.mocks.where).toHaveBeenCalledWith(
      'patientEmail',
      '==',
      'patient@example.com',
    );
    expect(firestore.mocks.onSnapshot).toHaveBeenCalled();
  });

  it('does not crash when currentUser is null', () => {
    // Make auth() return an object with currentUser: null for this one render.
    auth.mockReturnValueOnce({ currentUser: null });
    expect(() => render(<AppointmentList navigation={mockNavigation} />)).not.toThrow();
  });

  it('separates future appointments into Upcoming and past ones into Past', () => {
    const futureDate = new Date(Date.now() + 3600 * 1000); // 1 h from now
    const pastDate   = new Date(Date.now() - 3600 * 1000); // 1 h ago

    firestore.mocks.onSnapshot.mockImplementationOnce(cb => {
      cb(
        firestore.makeSnapshot([
          {
            id: 'apt-future',
            data: () => ({
              doctor: 'Dr. Future',
              reason: 'Annual check-up',
              time: { toDate: () => futureDate },
            }),
          },
          {
            id: 'apt-past',
            data: () => ({
              doctor: 'Dr. Past',
              reason: 'Blood test',
              time: { toDate: () => pastDate },
            }),
          },
        ]),
      );
      return jest.fn();
    });

    const { getByText } = render(<AppointmentList navigation={mockNavigation} />);
    expect(getByText('Dr. Future')).toBeTruthy();
    expect(getByText('Annual check-up')).toBeTruthy();
    expect(getByText('Dr. Past')).toBeTruthy();
    expect(getByText('Blood test')).toBeTruthy();
  });

  it('calls the Firestore unsubscribe function on unmount', () => {
    const mockUnsub = jest.fn();
    firestore.mocks.onSnapshot.mockReturnValueOnce(mockUnsub);

    const { unmount } = render(<AppointmentList navigation={mockNavigation} />);
    unmount();

    expect(mockUnsub).toHaveBeenCalledTimes(1);
  });
});
