// Global Jest setup — runs after the test framework is installed in each test file

// ── Firebase modules ──────────────────────────────────────────────────────────
jest.mock('@react-native-firebase/auth');
jest.mock('@react-native-firebase/firestore');
jest.mock('@react-native-firebase/storage');

// ── Device-only native modules ────────────────────────────────────────────────
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
  const FastImage = ({ source, style, testID }) =>
    React.createElement(Image, { source, style, testID });
  FastImage.resizeMode = { contain: 'contain', cover: 'cover', stretch: 'stretch', center: 'center' };
  FastImage.priority = { low: 'low', normal: 'normal', high: 'high' };
  FastImage.cacheControl = { immutable: 'immutable', web: 'web', cacheOnly: 'cacheOnly' };
  return { __esModule: true, default: FastImage };
});
jest.mock('react-native-alarm-notification');
jest.mock('react-native-simple-toast');
jest.mock('react-native-image-picker');

// ── UI components backed by native code ──────────────────────────────────────
jest.mock('@react-native-community/checkbox', () => {
  const React = require('react');
  const { View } = require('react-native');
  const CheckBox = ({ value, onValueChange, testID }) =>
    React.createElement(View, {
      testID: testID || 'checkbox',
      accessibilityRole: 'checkbox',
      accessibilityState: { checked: value },
      onTouchEnd: () => onValueChange && onValueChange(!value),
    });
  return { __esModule: true, default: CheckBox };
});

// ── Vector icons ──────────────────────────────────────────────────────────────
// Each icon family is mocked as a plain View so tests never load native fonts.
const makeIconMock = (displayName) => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = ({ name, testID }) =>
    React.createElement(View, { testID: testID || `icon-${name}` });
  Icon.displayName = displayName;
  return { __esModule: true, default: Icon };
};

jest.mock('@react-native-vector-icons/ionicons',             () => makeIconMock('Ionicons'));
jest.mock('@react-native-vector-icons/ant-design',           () => makeIconMock('AntDesign'));
jest.mock('@react-native-vector-icons/fontawesome',          () => makeIconMock('FontAwesome'));
jest.mock('@react-native-vector-icons/material-design-icons',() => makeIconMock('MaterialDesignIcons'));
jest.mock('@react-native-vector-icons/material-icons',       () => makeIconMock('MaterialIcons'));

// ── Animation / gesture libraries ────────────────────────────────────────────
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-gesture-handler', () => ({}));

// ── react-native-elements (SearchBar etc.) ────────────────────────────────────
jest.mock('react-native-elements', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return {
    SearchBar: ({ onChangeText, value, placeholder, testID }) =>
      React.createElement(TextInput, {
        testID: testID || 'search-bar',
        onChangeText,
        value,
        placeholder,
      }),
  };
});
