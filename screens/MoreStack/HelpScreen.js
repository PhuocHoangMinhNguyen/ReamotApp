import React from "react"
import { View, Text, StyleSheet } from "react-native"

export default class HelpScreen extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.questionSection}>
                    <Text></Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>

                <View style={styles.questionSection}>
                    <Text>Why do I need this app?</Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>

                <View style={styles.questionSection}>
                    <Text></Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>

                <View style={styles.questionSection}>
                    <Text></Text>
                </View>
                <View style={styles.answerSection}>
                    <Text style={styles.answerText}></Text>
                </View>

                <View style={styles.questionSection}>
                    <Text></Text>
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
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderRadius: 4,
        marginLeft: 30,
        marginRight: 70,
        marginVertical: 8,
        padding: 10,
    },
    answerSection: {
        flexDirection: "row",
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginLeft: 70,
        marginRight: 30,
        marginVertical: 8,
        padding: 10,
    },
    answerText: {
        color: "#FFF"
    }
})