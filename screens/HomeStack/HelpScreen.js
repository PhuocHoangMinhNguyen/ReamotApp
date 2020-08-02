import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default class HelpScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Help Screen</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DEE8F1',
    },
    margin: {
        marginHorizontal: 30,
        marginVertical: 10
    },
    marginBold: {
        marginHorizontal: 30,
        marginVertical: 10,
        fontWeight: "bold"
    },
    marginHeader: {
        marginHorizontal: 30,
        marginTop: 50,
        marginBottom: 10,
        fontWeight: "bold",
        fontSize: 22
    },
    marginBottom: {
        marginHorizontal: 30,
        marginTop: 10,
        marginBottom: 300,
    }
})