import NavigationService, { navigationRef } from '../../src/utilities/NavigationService';

// The module uses createNavigationContainerRef() from @react-navigation/native.
// We mock that package to control isReady() and navigate() per test.
jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: () => ({
    isReady:  jest.fn(),
    navigate: jest.fn(),
  }),
}));

describe('NavigationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('navigate()', () => {
    it('calls navigationRef.navigate when the navigator is ready', () => {
      navigationRef.isReady.mockReturnValue(true);

      NavigationService.navigate('HomeScreen', { id: 42 });

      expect(navigationRef.navigate).toHaveBeenCalledTimes(1);
      expect(navigationRef.navigate).toHaveBeenCalledWith('HomeScreen', { id: 42 });
    });

    it('does nothing when the navigator is not yet ready', () => {
      navigationRef.isReady.mockReturnValue(false);

      NavigationService.navigate('HomeScreen');

      expect(navigationRef.navigate).not.toHaveBeenCalled();
    });

    it('forwards params correctly', () => {
      navigationRef.isReady.mockReturnValue(true);
      const params = { medicine: 'Aspirin', time: '08:00' };

      NavigationService.navigate('ChangeReminder', params);

      expect(navigationRef.navigate).toHaveBeenCalledWith('ChangeReminder', params);
    });

    it('handles undefined params', () => {
      navigationRef.isReady.mockReturnValue(true);

      NavigationService.navigate('MedicineScreen');

      expect(navigationRef.navigate).toHaveBeenCalledWith('MedicineScreen', undefined);
    });
  });
});
