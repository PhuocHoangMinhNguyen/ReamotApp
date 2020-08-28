import React from "react"
import { View, StyleSheet, TouchableOpacity, Image, TextInput, Text } from "react-native"

import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import UploadImage from '../../utilities/UploadImage';

import Ionicons from "react-native-vector-icons/Ionicons"
import UserPermissions from "../../utilities/UserPermissions"
import ImagePicker from "react-native-image-picker"
import CheckBox from "@react-native-community/checkbox"
import Toast from "react-native-simple-toast"

export default class AddMedicine extends React.Component {
    state = {
        medicine: {
            name: "",
            image: null,
            number: "",
            times: "",
            note: null
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

    handleAdd = () => {
        const { name, number, times } = this.state.medicine
        const { dailyType, weeklyType } = this.state.reminder
        if (name.trim == "") {
            Toast.show("Please Enter Medicine Name", Toast.LONG)
        } else if (number == "") {
            Toast.show("Please enter number of capsules for each time you take medicine", Toast.LONG)
        } else if (times == "") {
            Toast.show("Please enter number of times you have to take medicine per day/week", Toast.LONG)
        } else if (dailyType == false && weeklyType == false) {
            Toast.show("Please Choose a Reminder Type", Toast.LONG)
        } else {
            this.addMedicine()
        }
    }

    addMedicine = async () => {
        const { name, image, note, number, times } = this.state.medicine
        const { dailyType, weeklyType } = this.state.reminder

        if (dailyType == true) {
            firestore().collection("prescription").add({
                medicine: name,
                patientEmail: auth().currentUser.email,
                note: note,
                number: number,
                times: times,
                type: "Daily",
                image: null,
            })
        }

        if (weeklyType == true) {
            firestore().collection("prescription").add({
                medicine: name,
                patientEmail: auth().currentUser.email,
                note: note,
                number: number,
                times: times,
                type: "Weekly",
                image: null,
            })
        }

        if (image) {
            // Store the avatar in Firebase Storage
            remoteUri = await UploadImage.uploadPhotoAsync(
                image,
                `users/${(auth().currentUser || {}).uid}`
            );
            // Then Store the avatar in Cloud Firestore
            db.set({ image: remoteUri }, { merge: true })
        }
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
                <View style={styles.numberTimes}>
                    <View style={styles.number}>
                        <TextInput
                            placeholder="Number"
                            keyboardType="numeric"
                            onChangeText={number => this.setState({ medicine: { ...this.state.medicine, number: number } })}
                            value={this.state.medicine.number}
                        />
                    </View>
                    <View style={styles.times}>
                        <TextInput
                            placeholder="Times"
                            keyboardType="numeric"
                            onChangeText={times => this.setState({ medicine: { ...this.state.medicine, times: times } })}
                            value={this.state.medicine.times}
                        />
                    </View>
                </View>
                <View style={styles.note}>
                    <TextInput
                        placeholder="Note"
                        autoCapitalize="none"
                        onChangeText={note => this.setState({ medicine: { ...this.state.medicine, note: note } })}
                        value={this.state.medicine.note}
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={this.handleAdd}>
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
    number: {
        backgroundColor: "#FFF",
        borderRadius: 4,
        flex: 1,
        marginRight: 8
    },
    times: {
        backgroundColor: "#FFF",
        borderRadius: 4,
        flex: 1,
        marginLeft: 8
    },
    numberTimes: {
        flexDirection: "row",
        marginHorizontal: 30,
        marginVertical: 12,
    },
    note: {
        backgroundColor: "#FFF",
        borderRadius: 4,
        marginHorizontal: 30
    },
})