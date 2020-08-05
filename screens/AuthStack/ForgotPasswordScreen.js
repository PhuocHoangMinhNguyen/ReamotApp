import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import auth from "@react-native-firebase/auth"
import Toast from "react-native-simple-toast"

export default class ForgotPasswordScreen extends React.Component {
    state = {
        forgottenEmail: ""
    }

    handleChangePassword = () => {
        const emailTrim = this.state.forgottenEmail.trim()
        if (emailTrim == "") {
            this.props.navigation.navigate("LoginScreen")
            Toast.show("Please Enter Email Address to Change Password")
        } else {
            auth().sendPasswordResetEmail(emailTrim).then(
                Toast.show("Please Check your Email...")
            )
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.smallerContainer}>
                    <View style={{ alignItems: "center" }}>
                        <Image style={styles.image}
                            source={require('../../assets/confusedMan.png')} />
                        <Text style={styles.text}>Did someone forget their password?</Text>
                        <Text>That's ok...</Text>
                        <Text>Just enter a your email address and</Text>
                        <Text>we will help you set a new password in no time</Text>
                    </View>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            placeholder="Email Address"
                            autoCapitalize="none"
                            onChangeText={newEmail => this.setState({ forgottenEmail: newEmail })}
                            value={this.state.forgottenEmail}
                        />
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={this.handleChangePassword}>
                        <Text style={styles.submitText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: '#DEE8F1',
    },
    smallerContainer: {
        marginHorizontal: 30,
        marginTop: -100
    },
    back: {
        position: "absolute",
        top: 24,
        left: 32,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center"
    },
    textInputContainer: {
        backgroundColor: "#FFF",
        marginTop: 12,
        borderRadius: 4,
    },
    submitButton: {
        alignSelf: "flex-end",
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
    },
    image: {
        width: 250,
        height: 250
    },
    text: {
        fontWeight: "bold",
        fontSize: 16
    },
})