// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make appointment to the doctor or pharmacist of their chosen.
// Status: In development

import React from "react"
import { View, Image, Text, StyleSheet, TouchableOpacity, Button } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import Toast from "react-native-simple-toast"
import { ConfirmDialog } from "react-native-simple-dialogs"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

export default class DoctorInfoScreen extends React.Component {
    static navigationOptions = {
        headerShown: false,
    }

    constructor(props) {
        super(props)
        this.state = {
            doctor: {},
            dialogVisible: false,
        }
    }

    componentDidMount() {
        // Take doctor/pharmacist data from DoctorScreen, including avatar, name, and type.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromDoctorScreen = this.props.navigation.state.params
        this.setState({ doctor: paramsFromDoctorScreen })
    }

    // Give doctor/pharmacist access to user's data.
    handleGiveAccessToDoctor = () => { this.setState({ dialogVisible: true }) }

    handleYes = () => {
        const { doctor } = this.state
        if (doctor.type == "Doctor") {
            firestore().collection("users").doc((auth().currentUser || {}).uid)
                .update({
                    doctorList: firestore.FieldValue.arrayUnion(doctor.email)
                })
        }
        if (doctor.type == "Pharmacist") {
            firestore().collection("users").doc((auth().currentUser || {}).uid)
                .update({
                    pharmacistList: firestore.FieldValue.arrayUnion(doctor.email)
                })
        }
        this.setState({ dialogVisible: false })
        Toast.show("Your request is confirmed !")
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
                <View style={styles.information}>
                    <Image
                        source={
                            this.state.doctor.avatar
                                ? { uri: this.state.doctor.avatar }
                                : require("../../assets/tempAvatar.jpg")
                        }
                        style={styles.image} />
                    <View style={{ alignItems: "center" }}>
                        <Text style={{ fontSize: 18 }}>{this.state.doctor.name}</Text>
                    </View>
                </View>
                <View style={{ marginVertical: 5 }}>
                    <Button
                        title="Give access of medical details"
                        onPress={this.handleGiveAccessToDoctor} />
                </View>
                <ConfirmDialog
                    visible={this.state.dialogVisible}
                    title="Alert"
                    message="Are you sure?"
                    onTouchOutside={() => this.setState({ dialogVisible: false })}
                    positiveButton={{
                        title: "YES",
                        onPress: () => { this.handleYes() }
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => {
                            this.setState({ dialogVisible: false })
                            Toast.show("Your request is canceled !")
                        }
                    }}
                />
            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
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
        justifyContent: "center",
    },
    information: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    image: {
        width: 100,
        height: 100
    },
})