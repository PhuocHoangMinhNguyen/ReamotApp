// Author: Phuoc Hoang Minh Nguyen
// Description: 
//  - Showing doctor or pharmacist details, who has access to user medical details
//  - Show options to:
//      - Revoke access to user medical details.
//      - Make Appointment (if the chosen one is a doctor, not pharmacist)
// Status: Optimized

import React from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-simple-toast";
import { ConfirmDialog } from "react-native-simple-dialogs";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Background from '../../components/Background';

var tempAvatar = require("../../assets/tempAvatar.png")

class AccessedDoctorScreen extends React.Component {
    state = {
        doctor: {},
        dialogVisible: false,
        show: false
    }

    componentDidMount() {
        // Take doctor/pharmacist data from DoctorScreen, including avatar, name, and type.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromDoctorScreen = this.props.navigation.state.params
        this.setState({ doctor: paramsFromDoctorScreen });
        // If the item chosen has type == "Doctor", 
        // it will show the make appointment button
        if (paramsFromDoctorScreen.type == "Doctor") {
            this.setState({ show: true });
        }
    }

    // Open a dialog to make sure if user wants to revoke doctor/pharmacist access to user's data.
    handleRevokeAccessToDoctor = () => { this.setState({ dialogVisible: true }) }

    // Send user to AppointmentMaker to choose appointment time and reason.
    handleSchedule = () => { this.props.navigation.navigate("AppointmentMaker", this.state.doctor) }

    // If the user is sure to revoke doctor/pharmacist access to user's data
    handleYes = () => {
        const { doctor } = this.state
        // If the target is a doctor
        if (doctor.type == "Doctor") {
            // Remove the doctor email from user's doctorList
            firestore().collection("users").doc((auth().currentUser || {}).uid)
                .update({
                    doctorList: firestore.FieldValue.arrayRemove(doctor.email)
                });
            // Remove user's email from doctor's patientList
            firestore().collection("doctor").doc(doctor.id).update({
                patientList: firestore.FieldValue.arrayRemove(auth().currentUser.email)
            });
        }
        // If the target is a pharmacist
        if (doctor.type == "Pharmacist") {
            // Remove the pharmacist email from user's pharmacistList
            firestore().collection("users").doc((auth().currentUser || {}).uid)
                .update({
                    pharmacistList: firestore.FieldValue.arrayRemove(doctor.email)
                });
            // Remove user's email from pharmacist's patientList
            firestore().collection("pharmacist").doc(doctor.id).update({
                patientList: firestore.FieldValue.arrayRemove(auth().currentUser.email)
            });
        }
        this.setState({ dialogVisible: false });
        Toast.show("Your request is confirmed !");
        this.props.navigation.goBack();
    }

    render() {
        let header
        if (this.state.doctor.type == "Doctor") {
            header = <Text style={styles.header}>Doctor Information</Text>
        } else {
            header = <Text style={styles.header}>Pharmacist Information</Text>
        }
        return (
            <View style={styles.container}>
                <Background />
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                {header}
                <View style={styles.information}>
                    <Image style={styles.image}
                        source={this.state.doctor.avatar
                            ? { uri: this.state.doctor.avatar }
                            : tempAvatar
                        } />
                    <Text style={{ fontSize: 18 }}>{this.state.doctor.name}</Text>
                    <Text>Address: {this.state.doctor.address}</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={this.handleRevokeAccessToDoctor}>
                    <Text style={{ color: "#FFF" }}>Revoke access of medical details</Text>
                </TouchableOpacity>
                {this.state.show && (
                    <TouchableOpacity style={styles.button} onPress={this.handleSchedule}>
                        <Text style={{ color: "#FFF" }}>Schedule An Appointment</Text>
                    </TouchableOpacity>
                )}
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
                            this.setState({ dialogVisible: false });
                            Toast.show("Your request is canceled !");
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
        backgroundColor: "#FFF"
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
    header: {
        alignSelf: "center",
        color: "#FFF",
        fontSize: 20,
        marginTop: -150
    },
    information: {
        backgroundColor: "#DDD",
        alignItems: "center",
        borderRadius: 5,
        padding: 16,
        marginVertical: 12,
        marginHorizontal: 30,
    },
    image: {
        width: 100,
        height: 100
    },
    button: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginVertical: 12,
        marginHorizontal: 30
    },
});

export default AccessedDoctorScreen