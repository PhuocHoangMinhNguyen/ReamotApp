// Author: Quang Duy Nguyen
// Description: Show medicine details of medicines shown on HomeScreen.
// Status: Optimized

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScrollView } from "react-native-gesture-handler";
import Background from '../../components/Background';

var tempAvatar = require("../../assets/tempAvatar.jpg")

class MedicationInformation extends React.Component {
    state = {
        medicine: {},
    }

    componentDidMount() {
        // Take medicine data from MedicineScreen, including image, name, description, and barcode.
        // => Faster than accessing Cloud Firestore again.
        let paramsFromMedicineScreen = this.props.navigation.state.params
        this.setState({ medicine: paramsFromMedicineScreen })
    }

    render() {
        return (
            <ScrollView style={styles.container}>
                <Background />
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.header}>Medicine Information</Text>
                <View style={styles.information}>
                    <View style={{ flexDirection: "row" }}>
                        <Image
                            source={
                                this.state.medicine.image
                                    ? { uri: this.state.medicine.image }
                                    : tempAvatar
                            }
                            style={styles.image}
                        />
                        <Text style={styles.name}>{this.state.medicine.name}</Text>
                    </View>
                    <Text style={styles.description}>{this.state.medicine.description}</Text>
                </View>
            </ScrollView>
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
    image: {
        width: 100,
        height: 100
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
        marginVertical: 24,
        fontSize: 20
    },
    header: {
        marginTop: -120,
        color: "#FFF",
        textAlign: "center",
        fontSize: 24
    },
    information: {
        backgroundColor: "#DDD",
        borderRadius: 5,
        padding: 16,
        marginTop: 20,
        marginHorizontal: 30,
    },
    description: {
        marginTop: 12
    },
})

export default MedicationInformation