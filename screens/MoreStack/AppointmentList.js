// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to view upcomming and past doctor appointment.
// Status: Optimized, but might need more design

import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import Background from '../../components/Background';
import moment from 'moment';

class AppointmentList extends React.Component {
    state = {
        upcomming_appointmentList: [],
        past_appointmentList: []
    }

    unsubscribe = null

    componentDidMount() {
        const dateNow = new Date();
        this.unsubscribe = firestore().collection("appointment")
            .where('patientEmail', '==', auth().currentUser.email)
            .onSnapshot(querySnapshot => {
                let tempUpcomming = []
                let tempPast = []
                querySnapshot.forEach(documentSnapshot => {
                    if (documentSnapshot.data().time.toDate() < dateNow) {
                        tempPast.push({
                            ...documentSnapshot.data(),
                            key: documentSnapshot.id
                        });
                    } else {
                        tempUpcomming.push({
                            ...documentSnapshot.data(),
                            key: documentSnapshot.id
                        });
                    }
                });
                this.setState({
                    past_appointmentList: tempPast,
                    upcomming_appointmentList: tempUpcomming
                });
            });
    }

    componentWillUnmount() {
        this.unsubscribe();
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
                    <Text>{`${moment(item.time.toDate()).format("MMM Do YYYY")} ${moment(item.time.toDate()).format('hh:mm a')}`}</Text>
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
                <Background />
                <Text style={styles.header}>Appointment List</Text>
                <Text style={styles.header1}>List of Upcomming and Past Appointment</Text>
                <Text style={styles.titleUpcomming}>Upcomming Appointments</Text>
                <FlatList style={styles.feed}
                    data={this.state.upcomming_appointmentList}
                    renderItem={({ item }) => this.renderItem(item)} />
                <Text style={styles.titlePast}>Past Appointments</Text>
                <FlatList style={styles.feed}
                    data={this.state.past_appointmentList}
                    renderItem={({ item }) => this.renderItem(item)} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
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
        color: "#FFF",
        fontSize: 24,
        marginTop: -150,
        marginHorizontal: 30,
        marginBottom: 12
    },
    header1: {
        color: "#FFF",
        marginHorizontal: 30,
        marginBottom: 30,
    },
    titleUpcomming: {
        marginHorizontal: 30,
        color: '#FFF',
        fontSize: 18
    },
    titlePast: {
        marginHorizontal: 30,
        fontSize: 18
    }
});

export default AppointmentList