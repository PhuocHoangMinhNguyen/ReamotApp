import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default class DrawerMenu extends React.Component {
    render() {
        return (
            <View style={{ flex: 1, paddingTop: 40 }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => { }}>
                    <Text>My Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => { }}>
                    <Text>Help</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => { }}>
                    <Text>Log Out</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        marginVertical: 10,
        paddingHorizontal: 8,
    },
});