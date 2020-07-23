import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Image } from 'react-native';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

function EditProfile({ navigation }) {
  const [user, setUser] = useState([]);
  const [updateName, setName] = useState('');
  const [updatePhoneNumber, setPhoneNumber] = useState();
  const [updateAddress, setAddress] = useState('');
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

  const updateInformation = () => {
    firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .update({
        name: updateName,
        Address: updateAddress,
        phoneNumber: updatePhoneNumber,
      })
      .then(() => {
        console.log('User updated!');
      }), navigation.navigate('Profile')
  };

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
      }), navigation.navigate('Profile')
    }
    if(updateAddress != null) {
      firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .update({
        Address: updateAddress,
      })
      .then(() => {
        console.log('User updated!');
      }), navigation.navigate('Profile')
    }
    if(updatePhoneNumber != null) {
      firestore()
      .collection('users')
      .doc(auth().currentUser.uid)
      .update({
        phoneNumber: updatePhoneNumber,
      })
      .then(() => {
        console.log('User updated!');
      }), navigation.navigate('Profile')
    }
  };


  return (
    <View style={styles.container}>
      <View style={{ marginTop: 64, alignItems: 'center' }}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              user.avatar
                ? { uri: user.avatar }
                : require('../../../assets/tempAvatar.jpg')
            }
            style={styles.avatar}
          />
        </View>
        <View>
          <TextInput
            placeholder= 'name'
            style={styles.input}
            onChangeText={(val) => setName(val)}
          />
          <TextInput
            placeholder= 'phone Number'
            style={styles.input}
            onChangeText={(val) =>
              setPhoneNumber(val)
            }
          />
          <TextInput
            placeholder= "Address (Optional)"
            style={styles.input}
            onChangeText={(val) =>
              setAddress(val)
            }            
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Save profile"
            onPress={
              (() => update())
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    shadowColor: '#151734',
    shadowRadius: 30,
    shadowOpacity: 0.4,
  },
  avatar: {
    width: 136,
    height: 136,
    borderRadius: 68,
  },
  button: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    width: 200,
  },
});

export default EditProfile;
