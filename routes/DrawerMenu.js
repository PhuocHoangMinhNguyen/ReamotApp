import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import auth from "@react-native-firebase/auth"

export default class DrawerMenu extends React.Component {
    myAccount = () => {
        this.props.navigation.navigate("ProfileScreen")
        this.props.navigation.closeDrawer();
    }

    render() {
        return (
            <View style={{ flex: 1, paddingTop: 40 }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => { this.myAccount }}>
                    <Text>My Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => { }}>
                    <Text>Help</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => { auth().signOut() }}>
                    <Text>Log Out</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        marginVertical: 10,
        paddingHorizontal: 8,
    },
})