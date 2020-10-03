// Author: Phuoc Hoang Minh Nguyen
// Description: 
// If the account hasnt been verified, this screen will be shown when user login.
// Status: Optimized

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import auth from "@react-native-firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-simple-toast";

class VerificationScreen extends React.Component {
    render() {
        return (
            <View style={styles.view}>
                <View style={{ alignItems: "center" }}>
                    <Text style={styles.text}>A Verification Email was sent to your Email Address</Text>
                </View>
                <Image style={styles.image}
                    source={require('../assets/GrowingTree.jpg')} />
                <View style={styles.refreshing}>
                    <View style={{ justifyContent: "center" }}>
                        <Text style={styles.text}>Refresh after Verifying your account</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            auth().currentUser.reload()
                            if (auth().currentUser.emailVerified) {
                                this.props.navigation.navigate("App")
                            } else {
                                Toast.show("Email not Verified")
                            }
                        }}
                    >
                        <Ionicons name="reload" size={30} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.signOut} onPress={() => auth().signOut()}>
                    <Text style={styles.signOutText}>Login to another Account</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: '#DEE8F1',
    },
    text: {
        fontWeight: "bold",
    },
    refreshing: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginBottom: 16
    },
    image: {
        width: 350,
        height: 350,
        borderRadius: 180,
        marginVertical: 16
    },
    signOut: {
        alignItems: "center"
    },
    signOutText: {
        color: "#1565C0",
        textDecorationLine: "underline"
    }
})

export default VerificationScreen