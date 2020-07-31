import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

function ProfileScreen({ navigation }) {
  const [user, setUser] = useState([]);
  useEffect(() => {
    const user = [];
    const subscriber = firestore()
      .collection("users")
      .doc(auth().currentUser.uid)
      .onSnapshot((documentSnapshot) => {
        setUser(documentSnapshot.data());
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [auth().currentUser.uid]);

  return (
    <SafeAreaView style={styles.container}>
      <View style = {{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10}}>
        <Image
          source={
            user.avatar
              ? { uri: user.avatar }
              : require('../../../assets/tempAvatar.jpg')
          }
          style={{ height: 140, width: 140, borderRadius: 80 }}
        />
        <Text style={styles.text}>
          Username: {user.name} 
          {'\n'}Email: {user.email} 
          {'\n'}Phone Number: {user.phoneNumber} 
          {'\n'}Address: {user.Address}
        </Text>
      </View>
      <TouchableOpacity onPress = {() => navigation.navigate('Edit')} >
        <View style={styles.button}>
          <Text style = {styles.buttonText}> Edit profile </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('AppointList')} >
        <View style={styles.button}>
          <Text style = {styles.buttonText}> Appointment List </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity  onPress={() => {auth().signOut();}} >
        <View style={styles.button}>
          <Text style = {styles.buttonText}> Sign Out </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEE8F1',
  },
  button: {
    borderRadius: 24,
    paddingVertical: 10,
    backgroundColor: '#018ABE',
    margin: 4
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
  text: {
    color: 'black',
    fontSize: 15,
    marginLeft: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textDecorationStyle: "solid",
    textDecorationColor: "#000"
  },
});

export default ProfileScreen;
