// Author: Phuoc Hoang Minh Nguyen
// Description: Forgot Password Screen
// Status: Optimized

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import Toast from "react-native-simple-toast";
import Background from '../../components/Background';

var confusedMan = require('../../assets/confusedMan.png');

class ForgotPasswordScreen extends React.Component {
    state = {
        forgottenEmail: ""
    }

    // A link will be sent to provided email address to reset password.
    handleChangePassword = () => {
        const emailTrim = this.state.forgottenEmail.trim();
        if (emailTrim == "") {
            Toast.show("Please Enter Email Address to Change Password");
        } else {
            auth().sendPasswordResetEmail(emailTrim)
                .then(() => this.props.navigation.navigate("LoginScreen"))
                .then(() => Toast.show("Please Check your Email..."));
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Background />
                <TouchableOpacity style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.smallerContainer}>
                    <View style={{ alignItems: "center" }}>
                        <Image style={styles.image} source={confusedMan} />
                        <Text style={styles.text}>Did someone forget their password?</Text>
                        <Text>That's ok...</Text>
                        <Text>Just enter a your email address and</Text>
                        <Text>we will help you set a new password in no time</Text>
                    </View>
                    <View style={styles.textInputContainer}>
                        <TextInput placeholder="Email Address"
                            autoCapitalize="none"
                            onChangeText={newEmail => this.setState({ forgottenEmail: newEmail })}
                            value={this.state.forgottenEmail} />
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
        backgroundColor: "#FFF",
        alignItems: "center",
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
        backgroundColor: "#DDD",
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
        height: 250,
        backgroundColor: '#DDD',
        borderRadius: 125,
    },
    text: {
        fontWeight: "bold",
        fontSize: 16,
        marginVertical: 12
    },
});

export default ForgotPasswordScreen