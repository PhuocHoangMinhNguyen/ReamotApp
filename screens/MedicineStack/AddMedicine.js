import React from "react"
import { View, StyleSheet, TouchableOpacity, Image, TextInput, Text } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import UserPermissions from "../../utilities/UserPermissions"
import ImagePicker from "react-native-image-picker"
import firestore from "@react-native-firebase/firestore"
import CheckBox from "@react-native-community/checkbox"
import Toast from "react-native-simple-toast"

export default class AddMedicine extends React.Component {
    state = {
        medicine: {
            name: "",
            image: null
        },
        reminder: {
            dailyType: false,
            weeklyType: false,
        }
    }

    handlePickImage = async () => {
        UserPermissions.getPhotoPermission()

        var options = {
            title: "Select Image",
            storageOptions: {
                skipBackup: true,
                path: "images"
            }
        };

        let result = await ImagePicker.showImagePicker(options, (response) => {
            console.log("Response = ", response)

            if (response.didCancel) {
                console.log("User cancelled image picker")
            } else if (response.error) {
                console.log("ImagePicker Error: ", response.error)
            } else {
                const source = response.uri
                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };
                this.setState({
                    medicine: { ...this.state.medicine, image: source }
                })
            }
        })
    }

    addMedicine = () => {
        const { name, image } = this.state.medicine
        const { dailyType, weeklyType } = this.state.reminder
        /*
        firestore().collection("history").add({
            medicine: name,
            patientEmail: auth().currentUser.email,
            time: moment().format('h:mm a'),
            date: moment().format('MMMM Do YYYY'),
            status: "taken"
        })
        */
        this.props.navigation.goBack()
        Toast.show("A new medicine is added !")
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={30} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.titleView}>
                    <Text style={styles.title}>Add Medication</Text>
                </View>
                <View style={styles.cover}>
                    <TouchableOpacity
                        style={styles.imagePlaceholder}
                        onPress={this.handlePickImage}
                    >
                        <Image
                            source={{ uri: this.state.medicine.image }}
                            style={styles.image}
                        />
                        <Ionicons
                            name="ios-add"
                            size={40}
                            color="#FFF"
                            style={{ marginTop: 6, marginLeft: 2 }}
                        />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                placeholder="Medicine Name"
                                autoCapitalize="none"
                                onChangeText={name => this.setState({ medicine: { ...this.state.medicine, name: name } })}
                                value={this.state.medicine.name}
                            />
                        </View>
                        <Text>Reminder Type: </Text>
                        <View style={styles.reminderType}>
                            <CheckBox value={this.state.reminder.dailyType}
                                onValueChange={(newValue) => {
                                    if (this.state.reminder.weeklyType != this.state.reminder.dailyType && newValue == true) {
                                        this.setState({
                                            reminder: {
                                                ...this.state.reminder,
                                                dailyType: newValue,
                                                weeklyType: !this.state.reminder.weeklyType
                                            }
                                        })
                                    } else {
                                        this.setState({
                                            reminder: {
                                                ...this.state.reminder,
                                                dailyType: newValue,
                                            }
                                        })
                                    }

                                }} />
                            <Text>Daily</Text>
                            <CheckBox value={this.state.reminder.weeklyType}
                                onValueChange={(newValue) => {
                                    if (this.state.reminder.weeklyType != this.state.reminder.dailyType && newValue == true) {
                                        this.setState({
                                            reminder: {
                                                ...this.state.reminder,
                                                dailyType: !this.state.reminder.dailyType,
                                                weeklyType: newValue
                                            }
                                        })
                                    } else {
                                        this.setState({
                                            reminder: {
                                                ...this.state.reminder,
                                                weeklyType: newValue
                                            }
                                        })
                                    }
                                }} />
                            <Text>Weekly</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.button} onPress={this.addMedicine}>
                    <Text style={styles.buttonText}>Add Medicine</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DEE8F1',
    },
    back: {
        position: "absolute",
        top: 24,
        left: 24,
        width: 30,
        height: 30,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center"
    },
    titleView: {
        marginTop: 30,
        alignItems: "center"
    },
    title: {
        fontWeight: "bold",
        fontSize: 20
    },
    cover: {
        marginHorizontal: 30,
        marginTop: 20,
        flexDirection: "row"
    },
    imagePlaceholder: {
        width: 110,
        height: 110,
        backgroundColor: "#A9A9A9",
        borderRadius: 55,
        justifyContent: "center",
        alignItems: "center"
    },
    image: {
        position: "absolute",
        width: 110,
        height: 110,
        borderRadius: 55
    },
    textInputContainer: {
        backgroundColor: "#FFF",
        borderRadius: 4,
        marginBottom: 12
    },
    reminderType: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    button: {
        alignSelf: "flex-end",
        justifyContent: "center",
        alignItems: "center",
        width: 110,
        height: 40,
        backgroundColor: "#1565C0",
        borderRadius: 4,
        marginVertical: 12,
        marginEnd: 30
    },
    buttonText: {
        color: "#FFF"
    },
})