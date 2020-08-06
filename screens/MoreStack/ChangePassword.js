import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import Toast from "react-native-simple-toast"
import auth from "@react-native-firebase/auth"

export default class ChangePassword extends React.Component {
    handleChangePassword = () => {
        auth().sendPasswordResetEmail(auth().currentUser.email).then(
            Toast.show("Please Check your Email...")
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.image}
                    source={require('../../assets/confusedMan.png')} />
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#DEE8F1',
    },
    image: {
        width: 250,
        height: 250
    },
    text: {
        fontWeight: "bold",
        fontSize: 16
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