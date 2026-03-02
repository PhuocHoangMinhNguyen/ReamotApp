module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    // In the Jest (test) environment, replace @babel/parser with hermes-parser
    // so that all newer Flow syntax used in react-native 0.76+ (mapped types,
    // `as` type assertions, etc.) is correctly parsed before being stripped.
    test: {
      plugins: ['babel-plugin-syntax-hermes-parser'],
      presets: [['@babel/preset-flow', { all: true }]],
    },
  },
};
