// Author: Phuoc Hoang Minh Nguyen
// Description: Terms of Service Screen so users can read before register account.
// Status: Optimized

import React from "react"
import { View, StyleSheet, TouchableOpacity } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import TermsServices from '../../components/TermsServices'

class Terms extends React.Component {
    render() {
        return (
            <View style={{ flex: 1 }}>
                <TermsServices />
                <TouchableOpacity
                    style={styles.back}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={32} color="#FFF" />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    back: {
        position: "absolute",
        top: 15,
        left: 30,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(21, 22, 48, 0.1)",
        alignItems: "center",
        justifyContent: "center"
    },
})

export default Terms