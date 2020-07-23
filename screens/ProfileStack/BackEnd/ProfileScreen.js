import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";
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
    <View style={styles.container}>
      <View style={{ marginTop: 64, alignItems: "center" }}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              user.avatar
                ? { uri: user.avatar }
                : require("../../../assets/tempAvatar.jpg")
            }
            style={styles.avatar}
          />
        </View>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
        <Text>{user.phoneNumber}</Text>
        <Text>{user.Address}</Text>
      </View>
      <View style={styles.button}>
        <Button
          title="Edit profile"
          onPress={() => navigation.navigate("Edit")} />

        <Button
          onPress={() => navigation.navigate("AppointList")}
          title="Appointment List"
        />
      </View>
      <View style={styles.button}>
        <Button
          onPress={() => {
            auth().signOut();
          }}
          title="Log out"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profile: {
    marginTop: 64,
    alignItems: 'center',
  },
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
  name: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  button: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default ProfileScreen;
