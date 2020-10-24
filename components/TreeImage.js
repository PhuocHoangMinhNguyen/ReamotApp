import React from 'react';
import { Image, StyleSheet } from 'react-native';

var growing1 = require('../assets/images/growing_0.png');
var growing2 = require('../assets/images/growing_0_to_25.png');
var growing3 = require('../assets/images/growing_25_to_50.png');
var growing4 = require('../assets/images/growing_50_to_75.png');
var growing5 = require('../assets/images/growing_75_to_100.png');
var growing6 = require('../assets/images/GrowingTree.png');

const TreeImage = ({ value }) => {
    let image
    if (value == 0) {
        image = <Image style={styles.image}
            source={growing1} />
    } else if (value > 0 && value < 25) {
        image = <Image style={styles.image}
            source={growing2} />
    } else if (value >= 25 && value < 50) {
        image = <Image style={styles.image}
            source={growing3} />
    } else if (value >= 50 && value < 75) {
        image = <Image style={styles.image}
            source={growing4} />
    } else if (value >= 75 && value < 100) {
        image = <Image style={styles.image}
            source={growing5} />
    } else {
        image = <Image style={styles.image}
            source={growing6} />
    }
    return (image)
}

const styles = StyleSheet.create({
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginTop: -150,
        alignSelf: 'center'
    }
});

export default TreeImage