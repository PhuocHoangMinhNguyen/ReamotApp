import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default class HelpScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>About Us</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>Why do you need this app?</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>It has been found that up to 50% of patients with prescription medicines
                    do not take the doses as prescribed or have poor adherence.</Text>
                    <Text style={styles.answerText}>The objective of Reamot app is to close the loop between the Physicians,
                    Pharmacists and Patients in relation to the accuracy of medication taking and treatment adherence.
                    This solution is a fully integrated app website application that delivers real time data to both the doctor
                    and the Pharmacist.</Text>
                    <Text style={styles.answerText}>Patients can now register for a simple and easy to use prescription reminder app that records
                    when and if they correctly take their medication. This data is made available to the patients
                    doctors and pharmacists.</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>What can this app do?</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}></Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}></Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DEE8F1',
    },
    questionSection: {
        backgroundColor: "#FFF",
        borderRadius: 4,
        marginLeft: 30,
        marginRight: 70,
        marginVertical: 8,
        padding: 10,
    },
    answerSection: {
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginLeft: 70,
        marginRight: 30,
        marginVertical: 8,
        padding: 10,
    },
    questionText: {
        fontWeight: "bold",
        fontSize: 15
    },
    answerText: {
        color: "#FFF"
    }
})