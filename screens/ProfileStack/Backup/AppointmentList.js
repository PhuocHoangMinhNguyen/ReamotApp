// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to make appointment to the doctor or pharmacist of their chosen.
// Status: In development

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import firestore from "@react-native-firebase/firestore"
import auth from "@react-native-firebase/auth"

export default class AppointmentList extends React.Component {
    static navigationOptions = {
        headerShown: false,
    }

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
                <Text>{item.doctor}</Text>
            </SafeAreaView>
        )
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
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 5,
        padding: 8,
        flexDirection: "row",
        marginVertical: 8,
    },
    feed: {
        marginHorizontal: 16,
    },
})