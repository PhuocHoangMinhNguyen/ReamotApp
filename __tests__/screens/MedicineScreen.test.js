import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MedicineScreen from '../../src/screens/MedicineStack/MedicineScreen';
import firestore from '@react-native-firebase/firestore';
import ReactNativeAN from 'react-native-alarm-notification';
import Toast from 'react-native-simple-toast';

// NavigationService is used for notification-tap navigation — mock it here.
jest.mock('../../src/utilities/NavigationService', () => ({
  navigate: jest.fn(),
}));

const mockNavigation = { navigate: jest.fn() };

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDoc(id, data) {
  return { id, data: () => data };
}

const ASPIRIN_MEDICINE = makeDoc('med1', {
  name:        'Aspirin',
  image:       null,
  description: 'Pain relief',
  barcode:     '111',
});

const ASPIRIN_PRESCRIPTION = makeDoc('p1', {
  name:        'Aspirin',
  patientEmail: 'patient@example.com',
  adder:       'patient',
});

describe('MedicineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: empty data for both medicine and prescription snapshots.
    firestore.mocks.onSnapshot.mockImplementation(cb => {
      cb(firestore.makeSnapshot([]));
      return jest.fn();
    });
  });

  // ── Empty state ─────────────────────────────────────────────────────────────

  it('shows the empty-state message when there are no prescriptions', () => {
    const { getByText } = render(<MedicineScreen navigation={mockNavigation} />);
    expect(getByText('You are not currently on medication')).toBeTruthy();
  });

  it('always renders the Add Medicine button', () => {
    const { getByText } = render(<MedicineScreen navigation={mockNavigation} />);
    expect(getByText('Add Medicine')).toBeTruthy();
  });

  // ── With data ───────────────────────────────────────────────────────────────

  it('renders a medicine item when prescription and medicine data exist', () => {
    // Call #1: medicine collection; Call #2: prescription collection.
    firestore.mocks.onSnapshot
      .mockImplementationOnce(cb => {
        cb(firestore.makeSnapshot([ASPIRIN_MEDICINE]));
        return jest.fn();
      })
      .mockImplementationOnce(cb => {
        cb(firestore.makeSnapshot([ASPIRIN_PRESCRIPTION]));
        return jest.fn();
      });

    const { getByText } = render(<MedicineScreen navigation={mockNavigation} />);
    expect(getByText('Aspirin')).toBeTruthy();
  });

  it('navigates to MediInfoScreen when a medicine item is tapped', () => {
    firestore.mocks.onSnapshot
      .mockImplementationOnce(cb => {
        cb(firestore.makeSnapshot([ASPIRIN_MEDICINE]));
        return jest.fn();
      })
      .mockImplementationOnce(cb => {
        cb(firestore.makeSnapshot([ASPIRIN_PRESCRIPTION]));
        return jest.fn();
      });

    const { getByText } = render(<MedicineScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Aspirin'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'MediInfoScreen',
      expect.objectContaining({ name: 'Aspirin' }),
    );
  });

  it('navigates to AddMedicine when the Add Medicine button is pressed', () => {
    const { getByText } = render(<MedicineScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Add Medicine'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddMedicine');
  });

  // ── Search ──────────────────────────────────────────────────────────────────

  it('filters the medicine list as the user types in the search bar', () => {
    const ibuprofen = makeDoc('med2', { name: 'Ibuprofen', image: null, description: '', barcode: '' });
    const ibuprofenRx = makeDoc('p2', { name: 'Ibuprofen', patientEmail: 'patient@example.com', adder: 'patient' });

    firestore.mocks.onSnapshot
      .mockImplementationOnce(cb => {
        cb(firestore.makeSnapshot([ASPIRIN_MEDICINE, ibuprofen]));
        return jest.fn();
      })
      .mockImplementationOnce(cb => {
        cb(firestore.makeSnapshot([ASPIRIN_PRESCRIPTION, ibuprofenRx]));
        return jest.fn();
      });

    const { getByTestId, getByText, queryByText } = render(
      <MedicineScreen navigation={mockNavigation} />,
    );

    fireEvent.changeText(getByTestId('search-bar'), 'Asp');
    expect(getByText('Aspirin')).toBeTruthy();
    expect(queryByText('Ibuprofen')).toBeNull();
  });

  // ── Cleanup ─────────────────────────────────────────────────────────────────

  it('calls unsubscribe when unmounted', () => {
    const mockUnsubscribe = jest.fn();
    firestore.mocks.onSnapshot.mockImplementation(cb => {
      cb(firestore.makeSnapshot([]));
      return mockUnsubscribe;
    });

    const { unmount } = render(<MedicineScreen navigation={mockNavigation} />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
