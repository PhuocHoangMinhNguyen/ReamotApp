import React from "react";
import {
    Text,
    View,
    Item,
    Icon,
    Input,
    Button
} from 'native-base';
import { KeyboardAvoidingView } from "react-native";
import { RNCamera } from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';

const styles = {
    root: {
        flex: 1,
    },
    upperSection: {
        flex: 1
    },
    lowerSection: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: 'white',
    },
    camera: {
        height: '100%',
    },
};

class BarcodeScan extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            barcode: ''
        }
    }

    onBarCodeRead = (scanResult) => {
        // scanResult.data will contain your scanned data
    }

    onGetItemPress = () => {
        // do something with button press
    }

    handleChange = () => {
        // handle user input
    }

    render() {
        return (
            <KeyboardAvoidingView style={styles.root}>  {/* OR Use a simple <View> instead of <KeyboardAvoidingView> */}
                <View style={styles.upperSection}>
                    <RNCamera
                        onBarCodeRead={this.onBarCodeRead}
                    // ... other related props of RNCamera
                    >
                        <BarcodeMask
                            width={100} height={300} showAnimatedLine={false} outerMaskOpacity={0.8}
                        />
                    </RNCamera>
                </View>
                <View style={styles.lowerSection}>
                    <Item>
                        <Icon type={"Ionicons"} active name='md-barcode' />
                        <Input
                            placeholder='Barcode of the item'
                            value={this.state.barcode}
                            onChangeText={this.handleChange}
                        />
                    </Item>
                    <Button
                        primary
                        onPress={this.onGetItemPress}
                    >
                        <Text>Get Item</Text>
                    </Button>
                </View>
            </KeyboardAvoidingView>
        )
    }

}

export default BarcodeScan;