import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-simple-toast";
import { ConfirmDialog } from "react-native-simple-dialogs";

export default class AppointmentMaker extends React.Component {
    static navigationOptions = {
        headerShown: false,
    };

    state = {
        dialogVisible: false
    }

    handlePress = () => { this.setState({ dialogVisible: true }) }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="ios-arrow-round-back" size={32} color="#FFF" />
                </TouchableOpacity>
                <Button
                    title="Set Appointment"
                    onPress={this.handlePress} />
                <ConfirmDialog
                    visible={this.state.dialogVisible}
                    title="Alert"
                    message="Are you sure?"
                    onTouchOutside={() => this.setState({ dialogVisible: false })}
                    positiveButton={{
                        title: "YES",
                        onPress: () => {
                            this.setState({ dialogVisible: false })
                            Toast.show("Your request is confirmed !")
                        }
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => {
                            this.setState({ dialogVisible: false })
                            Toast.show("Your request is canceled !")
                        }
                    }}
                />
            </View>
        );
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
});