import React from "react"
import { View, Text, StyleSheet } from "react-native"
import auth from "@react-native-firebase/auth"

export default class VerificationScreen extends React.Component {
    componentDidMount() {
        auth().currentUser.reload()
    }

    render() {
        return (
            <View style={styles.view}>
                <Text style={styles.text}>A Verification Email was sent to your Email Address</Text>
                <Text style={styles.text}>Verify your Email before using the application</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        fontWeight: "bold"
    }
})