import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import EditScreen from '../../src/screens/MoreStack/EditScreen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';

jest.mock('../../src/components/Background', () => () => null);
jest.mock('../../src/utilities/UploadImage', () => ({
  uploadPhotoAsync: jest.fn(() => Promise.resolve('https://storage.example.com/avatar.jpg')),
}));

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

describe('EditScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the Edit Profile header', () => {
    const { getByText } = render(<EditScreen navigation={mockNavigation} />);
    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('subscribes to the user document in Firestore on mount', () => {
    render(<EditScreen navigation={mockNavigation} />);
    expect(firestore.mocks.onSnapshot).toHaveBeenCalled();
  });

  it('populates name field from Firestore snapshot', () => {
    firestore.mocks.onSnapshot.mockImplementationOnce(cb => {
      cb({
        exists: () => true,
        data: () => ({ name: 'Alice', phoneNumber: '0400000000', address: '1 Main St', avatar: null }),
      });
      return jest.fn();
    });

    const { getByDisplayValue } = render(<EditScreen navigation={mockNavigation} />);
    expect(getByDisplayValue('Alice')).toBeTruthy();
  });

  it('shows a toast and does not write when name is empty', async () => {
    // Snapshot provides empty name.
    firestore.mocks.onSnapshot.mockImplementationOnce(cb => {
      cb({ exists: () => true, data: () => ({ name: '', phoneNumber: '', address: '', avatar: null }) });
      return jest.fn();
    });

    const { getByText } = render(<EditScreen navigation={mockNavigation} />);

    await act(async () => {
      fireEvent.press(getByText('Save profile'));
    });

    expect(Toast.show).toHaveBeenCalledWith('Name cannot be empty');
    expect(firestore.mocks.update).not.toHaveBeenCalled();
  });

  it('calls Firestore update when name is non-empty', async () => {
    firestore.mocks.onSnapshot.mockImplementationOnce(cb => {
      cb({
        exists: () => true,
        data: () => ({ name: 'Alice', phoneNumber: '0400', address: 'Home', avatar: null }),
      });
      return jest.fn();
    });
    firestore.mocks.update.mockResolvedValueOnce();

    const { getByText } = render(<EditScreen navigation={mockNavigation} />);

    await act(async () => {
      fireEvent.press(getByText('Save profile'));
    });

    expect(firestore.mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice' }),
    );
    expect(Toast.show).toHaveBeenCalledWith('Your Account Details is edited !');
  });

  it('calls unsubscribe on unmount', () => {
    const mockUnsub = jest.fn();
    firestore.mocks.onSnapshot.mockReturnValueOnce(mockUnsub);

    const { unmount } = render(<EditScreen navigation={mockNavigation} />);
    unmount();

    expect(mockUnsub).toHaveBeenCalledTimes(1);
  });
});
