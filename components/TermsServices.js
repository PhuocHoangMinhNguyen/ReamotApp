// Author: Phuoc Hoang Minh Nguyen
// Description: Allow patient to view application terms of services
// Status: Optimized

import React from "react";
import { Text, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

class TermsServices extends React.Component {
    render() {
        return (
            <ScrollView style={styles.container}>
                <Text style={styles.marginHeader}>Terms of Services</Text>
                <Text style={styles.margin}>Last updated: August 3rd, 2020</Text>
                <Text style={styles.margin}>
                    Please read these Terms of Service carefully before using the http://www.reamot.com website and
                    the Reamot App mobile application (the "Service") operated by us.</Text>
                <Text style={styles.margin}>
                    Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                    These Terms apply to all visitors, users and others who access or use the Service.</Text>
                <Text style={styles.marginBold}>
                    By accessing or using the Service you agree to be bound by these Terms.
                    If you disagree with any part of the terms then you may not access the Service</Text>
                <Text style={styles.marginBold}>Termination</Text>
                <Text style={styles.margin}>
                    We may terminate or suspend access to our Service immediately, without prior notice or liability,
                    for any reason whatsoever, including without limitation if you breach the Terms.</Text>
                <Text style={styles.margin}>All provisions of the Terms which by their nature should survive termination
                shall survive termination, including, without limitation, ownership provisions, warranty disclaimers,
                indemnity and limitations of liability.</Text>
                <Text style={styles.marginBold}>Changes</Text>
                <Text style={styles.margin}>We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.
                What constitutes a material change will be determined at our sole discretion.</Text>
                <Text style={styles.marginBold}>Contact Us</Text>
                <Text style={styles.marginBottom}>If you have any questions about these Terms, please contact us</Text>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DEE8F1',
    },
    margin: {
        marginHorizontal: 30,
        marginVertical: 10
    },
    marginBold: {
        marginHorizontal: 30,
        marginVertical: 10,
        fontWeight: "bold"
    },
    marginHeader: {
        marginHorizontal: 30,
        marginTop: 50,
        marginBottom: 10,
        fontWeight: "bold",
        fontSize: 22
    },
    marginBottom: {
        marginHorizontal: 30,
        marginTop: 10,
        marginBottom: 300,
    }
})

export default TermsServices