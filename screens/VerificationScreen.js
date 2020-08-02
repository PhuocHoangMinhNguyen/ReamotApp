import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid } from "react-native"
import auth from "@react-native-firebase/auth"
import Ionicons from "react-native-vector-icons/Ionicons"
import Toast from "react-native-simple-toast"

export default class VerificationScreen extends React.Component {
    render() {
        return (
            <View style={styles.view}>
                <Text style={styles.text}>A Verification Email was sent to your Email Address</Text>
                <Text style={styles.text}>Refresh after Verify your account</Text>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => {
                        auth().currentUser.reload()
                        if (auth().currentUser.emailVerified) {
                            this.props.navigation.navigate("App")
                        } else {
                            Toast.show("Email not Verified")
                        }
                    }}
                >
                    <Ionicons name="reload" size={50} />
                </TouchableOpacity>
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