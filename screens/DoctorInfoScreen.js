import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default class DoctorInfoScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Doctor Information Screen</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});