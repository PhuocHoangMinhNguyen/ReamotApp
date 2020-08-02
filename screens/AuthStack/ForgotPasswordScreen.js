import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

export default class ForgotPasswordScreen extends React.Component {
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
                    <Text>Please enter the email address used to sign up for Reamot</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput defaultValue="Email Address" />
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={() => { }}>
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
        //alignItems: "center",
        backgroundColor: '#DEE8F1',
    },
    smallerContainer: {
        marginHorizontal: 30
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
    }
})