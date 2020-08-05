// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make appointment to the doctor or pharmacist of their chosen.
// Status: In development

import React from "react"
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

export default class AppointmentList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            appointmentList: [],
        }
    }

    componentDidMount() {
        let temp = []
        firestore().collection("appointment").onSnapshot((querySnapshot) => {
            querySnapshot.forEach((documentSnapshot) => {
                if (documentSnapshot.data().patientEmail == auth().currentUser.email) {
                    temp.push({
                        ...documentSnapshot.data(),
                        key: documentSnapshot.id
                    })
                }
            })
            this.setState({ appointmentList: temp })
        })
    }

    renderItem(item) {
        return (
            <SafeAreaView style={styles.feedItem}>
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ color: "#000000", fontSize: 15 }}>Doctor Name: </Text>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text>{item.doctor}</Text>
                    </View>
                </View>
                <View style={styles.appoint}>
                    <Text style={{ color: "#000000", fontSize: 15 }}>Appoiment Time: </Text>
                    <Text>{item.date}</Text>
                    <Text>{item.time}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ color: "#000000", fontSize: 15 }}>Reason: </Text>
                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text>{item.reason}</Text>
                    </View>
                </View>
            </SafeAreaView >
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Your Appointment List</Text>
                <FlatList
                    style={styles.feed}
                    data={this.state.appointmentList}
                    renderItem={({ item }) => this.renderItem(item)}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DEE8F1',
    },
    back: {
        position: "absolute",
        top: 20,
        left: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 8,
        marginVertical: 8,
    },
    feed: {
        marginHorizontal: 30,
        marginTop: 20
    },
    appoint: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    header: {
        alignSelf: "center",
        color: "#000000",
        fontSize: 20,
        marginTop: 50
    },
})