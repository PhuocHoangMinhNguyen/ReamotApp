// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to view appointment to the doctor or pharmacist of their chosen.
// Status: Optimized, but might need more design

import React from "react"
import { View, Text, StyleSheet, FlatList, SafeAreaView, Dimensions, Image } from "react-native"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

var background = require('../../assets/background.png')

class AppointmentList extends React.Component {
    state = {
        appointmentList: [],
    }

    unsubscribe = null

    componentDidMount() {
        this.unsubscribe = firestore().collection("appointment")
            .where('patientEmail', '==', auth().currentUser.email)
            .onSnapshot((querySnapshot) => {
                let temp = []
                querySnapshot.forEach((documentSnapshot) => {
                    temp.push({
                        ...documentSnapshot.data(),
                        key: documentSnapshot.id
                    })
                })
                this.setState({ appointmentList: temp })
            })
    }

    componentWillUnmount() {
        this.unsubscribe()
    }

    // Information appeared on each item.
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
                <Image style={styles.containter}
                    source={background}
                />
                <Text style={styles.header}>Your Appointment List</Text>
                <FlatList
                    style={styles.feed}
                    data={this.state.appointmentList}
                    renderItem={({ item }) => this.renderItem(item)}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    containter: {
        width: Dimensions.get("window").width, //for full screen
    },
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        alignItems: "center",
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
        backgroundColor: "#DDD",
        borderRadius: 5,
        padding: 8,
        marginVertical: 8,
    },
    feed: {
        marginHorizontal: 30
    },
    appoint: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    header: {
        alignSelf: "center",
        color: "#FFF",
        fontSize: 24,
        marginTop: -150,
        marginBottom: 30
    },
})

export default AppointmentList