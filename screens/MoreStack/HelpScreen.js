import React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"

export default class HelpScreen extends React.Component {
    render() {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>About Us</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>We are a group of 5 last-year La Trobe students,
                    collaboration with Aerion Technologies, wanting to make some contributions to improve people’s life.</Text>
                    <Text></Text>
                    <Text style={styles.answerText}>Contributors:</Text>
                    <Text style={styles.answerText}>-    Phuoc Hoang Minh Nguyen</Text>
                    <Text style={styles.answerText}>-    Quang Duy Nguyen</Text>
                    <Text style={styles.answerText}>-    Yaqdhan Sulaiman Fraish Al Mahrizi</Text>
                    <Text style={styles.answerText}>-    Jander Yang</Text>
                    <Text style={styles.answerText}>-    Joanne Scott</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>Why do you need this app?</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>It has been found that up to 50% of patients with prescription medicines
                    do not take the doses as prescribed or have poor adherence.</Text>
                    <Text></Text>
                    <Text style={styles.answerText}>The objective of Reamot app is to close the loop between the Physicians,
                    Pharmacists and Patients in relation to the accuracy of medication taking and treatment adherence.
                    This solution is a fully integrated app website application that delivers real time data to both the doctor
                    and the Pharmacist.</Text>
                    <Text></Text>
                    <Text style={styles.answerText}>Patients can now register for a simple and easy to use prescription reminder app that records
                    when and if they correctly take their medication. This data is made available to the patients
                    doctors and pharmacists.</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>What can this app do?</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Set up reminder to remind yourself to take some certain medicines, based on doctor’s prescription,
                    or you can add your own medicine with your own instructions.</Text>
                    <Text></Text>
                    <Text style={styles.answerText}>Revise your own history of taking medications</Text>
                    <Text></Text>
                    <Text style={styles.answerText}>Give access to doctors and pharmacists who using the system
                    so they can constantly keep track of your medication adherence.</Text>
                    <Text></Text>
                    <Text style={styles.answerText}>Make appointments with doctors.</Text>
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
            </ScrollView>
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