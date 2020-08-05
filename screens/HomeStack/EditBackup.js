import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import ImagePicker from 'react-native-image-picker';
import Ionicons from "react-native-vector-icons/Ionicons";
import UserPermissions from "../../utilities/UserPermissions";
import storage from "@react-native-firebase/storage";

function EditScreen({ navigation }) {
    const [user, setUser] = useState([]);
    const [updateName, setName] = useState();
    const [updatePhoneNumber, setPhoneNumber] = useState();
    const [updateAddress, setAddress] = useState();
    const [avatar, setAvatar] = useState();

    useEffect(() => {
        const user = [];
        const subscriber = firestore()
            .collection('users')
            .doc(auth().currentUser.uid)
            .onSnapshot((documentSnapshot) => {
                setUser(documentSnapshot.data());
            });

        // Stop listening for updates when no longer required
        return () => subscriber();
    }, [auth().currentUser.uid]);

    const update = () => {
        if (updateName != null) {
            firestore()
                .collection('users')
                .doc(auth().currentUser.uid)
                .update({
                    name: updateName,
                })
                .then(() => {
                    console.log('User updated!');
                }),
                navigation.navigate('HomeScreen');
        }
        if (updateAddress != null) {
            firestore()
                .collection('users')
                .doc(auth().currentUser.uid)
                .update({
                    Address: updateAddress,
                })
                .then(() => {
                    console.log('User updated!');
                }),
                navigation.navigate('HomeScreen');
        }
        if (updatePhoneNumber != null) {
            firestore()
                .collection('users')
                .doc(auth().currentUser.uid)
                .update({
                    phoneNumber: updatePhoneNumber,
                })
                .then(() => {
                    console.log('User updated!');
                }),
                navigation.navigate('HomeScreen');
        }
        firestore()
            .collection('users')
            .doc(auth().currentUser.uid)
            .update({
                avatar: user.avatar,
            })
            .then(() => {
                console.log('User updated!');
            }),
            navigation.navigate('HomeScreen');
    };

    handlePickAvatar = async () => {
        UserPermissions.getPhotoPermission();

        var options = {
            title: "Select Image",
            storageOptions: {
                skipBackup: true,
                path: "images",
            },
        };

        let result = await ImagePicker.showImagePicker(options, (response) => {
            console.log("Response = ", response);

            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.error) {
                console.log("ImagePicker Error: ", response.error);
            } else {
                const source = response.uri;
                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };
                setUser({ ...this.user, avatar: source });
            }
        });
    };

    return (
        <ScrollView style={{ backgroundColor: '#DEE8F1' }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.back}>
                    <Text style={{ fontSize: 24, color: "#0033cc" }}> Edit Profile</Text>
                </View>
                <View>
                    <TouchableOpacity onPress={() => handlePickAvatar()}>
                        <Image
                            source={
                                user.avatar
                                    ? { uri: user.avatar }
                                    : require('../../assets/tempAvatar.jpg')
                            }
                            style={styles.avatar}
                        />
                        <Ionicons
                            name="camera-reverse-outline"
                            size={40}
                            color="black"
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                    <View style={styles.edit}>
                        <TextInput
                            placeholder="name"
                            style={styles.input}
                            onChangeText={(updateName) => setName(updateName)}
                        />
                        <Ionicons name="pencil-outline" size={20} style={styles.iconInput} />
                    </View>
                    <View style={styles.edit}>
                        <TextInput
                            placeholder="phone Number"
                            style={styles.input}
                            onChangeText={(updatePhoneNumber) =>
                                setPhoneNumber(updatePhoneNumber)
                            }
                        />
                        <Ionicons name="pencil-outline" size={20} style={styles.iconInput} />
                    </View>
                    <View style={styles.edit}>
                        <TextInput
                            placeholder="Address (Optional)"
                            style={styles.input}
                            onChangeText={(updateAddress) => setAddress(updateAddress)}
                        />
                        <Ionicons name="pencil-outline" size={20} style={styles.iconInput} />
                    </View>
                    <TouchableOpacity onPress={() => update()}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}> Save profile </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    avatar: {
        width: 200,
        height: 200,
        borderRadius: 100,
        margin: 5,
    },
    button: {
        marginVertical: 8,
        marginHorizontal: 16,
    },
    input: {
        alignSelf: 'stretch',
        padding: 10,
        borderBottomColor: '#000',
        margin: 4,
        borderBottomColor: '#000',
        borderBottomWidth: 2,
        fontSize: 18,
        flex: 1,
    },
    name: {
        flex: 1,
        fontSize: 15,
        fontWeight: "500",
        color: "white",
    },
    container: {
        marginTop: 64,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    icon: {
        position: "absolute",
        top: 150,
        left: 160,
        width: 40,
        height: 40,
        backgroundColor: "white",
        borderRadius: 15,
    },
    button: {
        borderRadius: 24,
        paddingVertical: 10,
        backgroundColor: '#018ABE',
        margin: 4,
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
    edit: {
        flexDirection: 'row',
    },
    iconInput: {
        position: "absolute",
        top: 20,
        left: 180
    },
    back: {
        marginTop: 32,
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
        color: "#FFF",
        top: -30,
    },
});

export default EditScreen;

<ScrollView style={{ backgroundColor: '#DEE8F1' }}>
    <SafeAreaView style={styles.container}>
        <View style={styles.back}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0000" }}> Edit Profile</Text>
        </View>
        <View>
            <TouchableOpacity onPress={() => handlePickAvatar()}>
                <Image
                    source={
                        user.avatar
                            ? { uri: user.avatar }
                            : require('../../assets/tempAvatar.jpg')
                    }
                    style={styles.avatar}
                />
                <MaterialIcons
                    name="photo-camera"
                    size={40}
                    color="black"
                    style={styles.icon}
                />
            </TouchableOpacity>
            <View style={styles.edit}>
                <TextInput
                    placeholder="Full Name"
                    style={styles.input}
                    onChangeText={(updateName) => setName(updateName)}
                />
                <MaterialIcons name="edit" size={20} style={styles.iconInput} />
            </View>
            <View style={styles.edit}>
                <TextInput
                    placeholder="Phone Number"
                    style={styles.input}
                    onChangeText={(updatePhoneNumber) =>
                        setPhoneNumber(updatePhoneNumber)
                    }
                />
                <MaterialIcons name="edit" size={20} style={styles.iconInput} />
            </View>
            <View style={styles.edit}>
                <TextInput
                    placeholder="Address (Optional)"
                    style={styles.input}
                    onChangeText={(updateAddress) => setAddress(updateAddress)}
                />
                <MaterialIcons name="edit" size={20} style={styles.iconInput} />
            </View>
            <TouchableOpacity onPress={() => update()}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>Save profile</Text>
                </View>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
</ScrollView>