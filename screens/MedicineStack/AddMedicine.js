import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default class AddMedicine extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Add Medicine</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DEE8F1',
    },
})