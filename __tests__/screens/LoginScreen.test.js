import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/AuthStack/LoginScreen';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';
import UserReminders from '../../src/utilities/UserReminders';

// UserReminders.setReminders is called after successful login.
jest.mock('../../src/utilities/UserReminders', () => ({
  setReminders:    jest.fn(() => Promise.resolve()),
  deleteReminders: jest.fn(() => Promise.resolve()),
}));

// Background component renders an Image that needs no behaviour in tests.
jest.mock('../../src/components/Background', () => () => null);

const mockNavigation = {
  navigate: jest.fn(),
  goBack:   jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ───────────────────────────────────────────────────────────────

  it('renders the Sign in button', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText('Sign in')).toBeTruthy();
  });

  it('renders email and password inputs', () => {
    const { getByTestId } = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByTestId('login-email-input')).toBeTruthy();
    expect(getByTestId('login-password-input')).toBeTruthy();
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('shows a toast when the email field is empty', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Sign in'));
    expect(Toast.show).toHaveBeenCalledWith(
      'Please Enter Email Information',
      Toast.LONG,
    );
  });

  it('shows a toast when the password field is empty (email filled)', () => {
    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
    );
    fireEvent.changeText(getByTestId('login-email-input'), 'test@example.com');
    fireEvent.press(getByText('Sign in'));
    expect(Toast.show).toHaveBeenCalledWith('Please Enter Password', Toast.LONG);
  });

  it('trims leading/trailing whitespace from the email before validation', () => {
    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
    );
    // Email with only spaces → treated as empty after trim.
    fireEvent.changeText(getByTestId('login-email-input'), '   ');
    fireEvent.press(getByText('Sign in'));
    expect(Toast.show).toHaveBeenCalledWith(
      'Please Enter Email Information',
      Toast.LONG,
    );
  });

  // ── Firebase auth ───────────────────────────────────────────────────────────

  it('calls signInWithEmailAndPassword with trimmed email and password', async () => {
    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
    );
    fireEvent.changeText(getByTestId('login-email-input'), ' test@example.com ');
    fireEvent.changeText(getByTestId('login-password-input'), 'secret123');

    await act(async () => {
      fireEvent.press(getByText('Sign in'));
    });

    expect(auth.mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'test@example.com',
      'secret123',
    );
  });

  it('calls UserReminders.setReminders after successful login', async () => {
    auth.mocks.signInWithEmailAndPassword.mockResolvedValueOnce({
      user: auth.mocks.currentUser,
    });
    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
    );
    fireEvent.changeText(getByTestId('login-email-input'), 'patient@example.com');
    fireEvent.changeText(getByTestId('login-password-input'), 'pass');

    await act(async () => {
      fireEvent.press(getByText('Sign in'));
    });

    expect(UserReminders.setReminders).toHaveBeenCalledWith('patient@example.com');
  });

  // ── Password toggle ─────────────────────────────────────────────────────────

  it('navigates to ForgotPasswordScreen when the link is tapped', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Forgot Password?'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPasswordScreen');
  });

  it('navigates to RegisterScreen when Sign up link is tapped', () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText('Sign up'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RegisterScreen');
  });
});
