// Author: Phuoc Hoang Minh Nguyen
// Description: Frequent Asked Questions Screen (Can also be used as tutorial for new users)
// Status: Optimized

import React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"

class HelpScreen extends React.Component {
    render() {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>About Us</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>We are a group of 5 last-year La Trobe students,
                    collaboration with Aerion Technologies, wanting to make some contributions to improve people’s life.</Text>
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
                    <Text style={styles.answerText}>Set up reminder to remind yourself to take some certain medicines, based on doctor’s prescription,
                    or you can add your own medicine with your own instructions.</Text>
                    <Text style={styles.answerText}>Revise your own history of taking medications</Text>
                    <Text style={styles.answerText}>Give access to doctors and pharmacists who using the system
                    so they can constantly keep track of your medication adherence.</Text>
                    <Text style={styles.answerText}>Make appointments with doctors.</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>Why should I create an account?</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>When you create an account,
                    your data is automatically backed up on our secured servers.
                    This allows you to log back in to your Medisafe account and
                    restore your data should you move to a new device or need to reinstall Medisafe.</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How do I create an account?</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Choose an avatar (optional) and enter your information in Register Screen</Text>
                    <Text style={styles.answerText}>Tap "Sign up"</Text>
                    <Text style={styles.answerText}>A verification email is sent to your email address.
                    Click on the link to verify your email</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I reset my password?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>If you have signed up:</Text>
                    <Text style={styles.answerText}>-   Click on the last icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>-   Click "Change Password"</Text>
                    <Text style={styles.answerText}>-   Click "Submit"</Text>
                    <Text style={styles.answerText}>-   An email is sent to your account's email address.
                    Click on the link in the email to make a new password</Text>
                    <Text style={styles.answerText}>If you have NOT signed up:</Text>
                    <Text style={styles.answerText}>-   Click on "Forgot Password" in Sign in Screen</Text>
                    <Text style={styles.answerText}>-   Enter your email address to get a "change-password" email</Text>
                    <Text style={styles.answerText}>-   Click "Submit"</Text>
                    <Text style={styles.answerText}>-   An email is sent to your provided email address.
                    Click on the link in the email to make a new password</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How do I move my Reamot account to my new device?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Make sure that you have created an account</Text>
                    <Text style={styles.answerText}>Download Reamot on your new device</Text>
                    <Text style={styles.answerText}>Enter your email address and password in Sign in Screen</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I make a reminder for a medicine?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Click on the third icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>Click on a medicine that you want to set the reminder</Text>
                    <Text style={styles.answerText}>Click "Add Reminder"</Text>
                    <Text style={styles.answerText}>Click "Show time picker!"</Text>
                    <Text style={styles.answerText}>Choose a suitable time</Text>
                    <Text style={styles.answerText}>Click "Schedule Alarm", and the alarm will be sounded when it reaches the set time.</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I stop an alarm for a medicine?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>When the alarm is sounded, click on the third icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>Click on a medicine that is sounding the alarm</Text>
                    <Text style={styles.answerText}>Choose "Take Medicine" or "Missed Medicine"</Text>
                    <Text style={styles.answerText}>If you choose "Take Medicine",
                    scan the barcode on the medicine container to stop the alarm,
                    and the database will save that you took your medicine</Text>
                    <Text style={styles.answerText}>If you choose "Missed Medicine",
                    click "Yes" on the confirm dialogs to stop the alarm,
                    and the database will save that you missed your medicine</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I check my history of taking medication?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Click on the second icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>Click "Show Calendar"</Text>
                    <Text style={styles.answerText}>Choose a date that you want to check history of taking medication</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I edit my history of taking medication?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>No, you CANNOT edit your history of taking medication.</Text>
                    <Text style={styles.answerText}>That data is used by your "accessed" doctor to monitor your medication adherence</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I give a doctor/ pharmacist access to my account details?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Click on the fourth icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>Click "Give Access to Another Doctor/ Pharmacist"</Text>
                    <Text style={styles.answerText}>Click on one doctor (or pharmacist) on the list</Text>
                    <Text style={styles.answerText}>Click "Give access of medical details"</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I revoke a doctor/ pharmacist access to my account details?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Click on the fourth icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>Click on one doctor (or pharmacist) on the list</Text>
                    <Text style={styles.answerText}>Click "Revoke access of medical details"</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I make an appointment with a doctor?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Click on the fourth icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>Click on one doctor on the list</Text>
                    <Text style={styles.answerText}>Click "Schedule an appointment"</Text>
                    <Text style={styles.answerText}>Choose suitable appointment details including day, time, reason</Text>
                    <Text style={styles.answerText}>Click "Set Appointment"</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>How can I edit my profile details?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>Click on the last icon on the bottom tab bar</Text>
                    <Text style={styles.answerText}>Click "Edit Account"</Text>
                    <Text style={styles.answerText}>Edit the information you want</Text>
                    <Text style={styles.answerText}>Click "Save Profile"</Text>
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>What is the current problem with the application?</Text>
                </View>

                <View style={styles.answerSection}>
                    <Text style={styles.answerText}>The alarm will still be sounded even when you logout, or login to another details</Text>
                    <Text style={styles.answerText}>Solution: Delete all the alarms if you dont want to use a certain account anymore</Text>
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
        borderRadius: 10,
        marginLeft: 30,
        marginRight: 70,
        marginVertical: 8,
        padding: 10,
    },
    answerSection: {
        backgroundColor: "#1565C0",
        borderRadius: 10,
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
        color: "#FFF",
        marginBottom: 10
    }
})

export default HelpScreen