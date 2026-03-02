import React from 'react';
import { render, act } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeStack/HomeScreen';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';

jest.mock('../../src/components/Background', () => () => null);
jest.mock('../../src/components/TreeImage', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ value }) =>
    React.createElement(View, { testID: `tree-value-${Math.round(value)}` });
});

const mockNavigation = { navigate: jest.fn() };

// ── Firestore timestamp helper ────────────────────────────────────────────────
const makeTimestamp = (date = new Date()) => ({ toDate: () => date });

// ── Helpers to create doc snapshots ──────────────────────────────────────────
function makeDoc(id, data) {
  return { id, data: () => data };
}

function futureTimestamp() {
  return makeTimestamp(new Date(Date.now() + 60 * 60 * 1000)); // 1 h from now
}

function pastTimestamp() {
  return makeTimestamp(new Date(Date.now() - 60 * 60 * 1000)); // 1 h ago
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: all onSnapshot calls respond with empty data.
    firestore.mocks.onSnapshot.mockImplementation(cb => {
      cb(firestore.makeSnapshot([]));
      return jest.fn();
    });
  });

  // ── Empty state ─────────────────────────────────────────────────────────────

  it('shows the empty-state message when there are no reminders or history', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('You have no active reminder')).toBeTruthy();
  });

  it('shows the guidance text in empty state', () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Please add a medicine,')).toBeTruthy();
  });

  // ── With history data ───────────────────────────────────────────────────────

  it('shows the Medicines Taken section header when history exists', () => {
    const today = moment().format('MMMM Do YYYY');
    const medicineDocs = [
      makeDoc('med1', { name: 'Aspirin', image: null, description: 'Pain relief', barcode: '111' }),
    ];
    const historyDocs = [
      makeDoc('h1', {
        medicine:    'Aspirin',
        date:        today,
        status:      'taken',
        patientEmail: 'patient@example.com',
        startTime:   makeTimestamp(),
      }),
    ];

    // Call #1 → medicine; calls #2,3,4 → history / miss / reminder collections.
    firestore.mocks.onSnapshot
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot(medicineDocs)); return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot(historyDocs));  return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot([]));            return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot([]));            return jest.fn(); });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Medicines Taken')).toBeTruthy();
  });

  it('shows the Upcoming Reminders section header when reminders exist', () => {
    const medicineDocs = [
      makeDoc('med1', { name: 'Aspirin', image: null, description: 'desc', barcode: '111' }),
    ];
    const reminderDocs = [
      makeDoc('r1', {
        medicine:    'Aspirin',
        time:        futureTimestamp(),
        patientEmail: 'patient@example.com',
      }),
    ];

    firestore.mocks.onSnapshot
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot(medicineDocs)); return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot([]));           return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot([]));           return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot(reminderDocs)); return jest.fn(); });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    expect(getByText('Upcoming Reminders')).toBeTruthy();
  });

  // ── TreeImage value ─────────────────────────────────────────────────────────

  it('passes value=100 to TreeImage when all medicines are taken with no upcoming', () => {
    const today = moment().format('MMMM Do YYYY');
    const medicineDocs = [makeDoc('med1', { name: 'Aspirin', image: null, description: '', barcode: '' })];
    const historyDocs  = [
      makeDoc('h1', { medicine: 'Aspirin', date: today, status: 'taken', patientEmail: 'p@p.com', startTime: makeTimestamp() }),
    ];
    // Mock TreeImage to expose the `value` prop via testID.
    firestore.mocks.onSnapshot
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot(medicineDocs)); return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot(historyDocs));  return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot([]));           return jest.fn(); })
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot([]));           return jest.fn(); });

    const { getByTestId } = render(<HomeScreen navigation={mockNavigation} />);
    // counting=0, taken=1, missed=0 → value = 1*100/(0+1) = 100
    expect(getByTestId('tree-value-100')).toBeTruthy();
  });

  // ── Cleanup ─────────────────────────────────────────────────────────────────

  it('calls unsubscribe when unmounted', () => {
    const mockUnsubscribe = jest.fn();
    firestore.mocks.onSnapshot.mockImplementation(cb => {
      cb(firestore.makeSnapshot([]));
      return mockUnsubscribe;
    });

    const { unmount } = render(<HomeScreen navigation={mockNavigation} />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  it('is connected to the correct Firestore collections', () => {
    render(<HomeScreen navigation={mockNavigation} />);
    const collections = firestore.mocks.collection.mock.calls.map(c => c[0]);
    expect(collections).toContain('medicine');
  });

  it('filters history by the current user email', () => {
    const medicineDocs = [makeDoc('m1', { name: 'Aspirin', image: null, description: '', barcode: '' })];
    firestore.mocks.onSnapshot
      .mockImplementationOnce(cb => { cb(firestore.makeSnapshot(medicineDocs)); return jest.fn(); })
      .mockImplementation(cb => { cb(firestore.makeSnapshot([])); return jest.fn(); });

    render(<HomeScreen navigation={mockNavigation} />);
    expect(firestore.mocks.where).toHaveBeenCalledWith(
      'patientEmail',
      '==',
      auth.mocks.currentUser.email,
    );
  });
});
