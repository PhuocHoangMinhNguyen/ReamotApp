// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to change password
// Status: Optimized, but might need more design

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import Toast from "react-native-simple-toast"
import auth from "@react-native-firebase/auth"
import Background from '../../components/Background'

var confusedMan = require('../../assets/confusedMan.png')

class ChangePassword extends React.Component {
    // A link to reset password will be sent to current user's email
    handleChangePassword = () => {
        auth().sendPasswordResetEmail(auth().currentUser.email).then(
            Toast.show("Please Check your Email...")
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <Background />
                <Image style={styles.image}
                    source={confusedMan} />
                <Text style={styles.text}>Did someone forget their password?</Text>
                <Text>That's ok...</Text>
                <Text>Just click the button below and</Text>
                <Text>we will help you set a new password in no time</Text>
                <TouchableOpacity style={styles.submitButton} onPress={this.handleChangePassword}>
                    <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        alignItems: "center",
    },
    image: {
        width: 250,
        height: 250,
        marginTop: -120,
        backgroundColor: '#DDD',
        borderRadius: 125,
    },
    text: {
        fontWeight: "bold",
        fontSize: 16,
        marginVertical: 12
    },
    submitButton: {
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        height: 40,
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginTop: 12
    },
    submitText: {
        color: "#FFF"
    }
})

export default ChangePassword