import React from 'react';
import { Image, StyleSheet } from 'react-native';

// Images are stored in a lookup array so only the required asset is resolved
// at render time instead of all six being loaded at bundle start.
const TREE_FRAMES = [
  require('../assets/images/growing_0.png'),         // value == 0
  require('../assets/images/growing_0_to_25.png'),   // 0 < value < 25
  require('../assets/images/growing_25_to_50.png'),  // 25 <= value < 50
  require('../assets/images/growing_50_to_75.png'),  // 50 <= value < 75
  require('../assets/images/growing_75_to_100.png'), // 75 <= value < 100
  require('../assets/images/GrowingTree.png'),        // value >= 100
];

function getFrameIndex(value) {
  if (value <= 0) return 0;
  if (value < 25) return 1;
  if (value < 50) return 2;
  if (value < 75) return 3;
  if (value < 100) return 4;
  return 5;
}

const TEST_IDS = ['tree-dead', 'tree-0-25', 'tree-25-50', 'tree-50-75', 'tree-75-100', 'tree-full'];

const TreeImage = ({ value }) => {
  const index = getFrameIndex(value);
  return (
    <Image
      testID={TEST_IDS[index]}
      style={styles.image}
      source={TREE_FRAMES[index]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginTop: -150,
    alignSelf: 'center',
  },
});

export default TreeImage;
