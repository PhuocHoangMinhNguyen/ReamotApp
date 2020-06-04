import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default class AppointmentList extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Appointment List</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
});