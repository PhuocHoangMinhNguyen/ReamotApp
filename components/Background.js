import React from "react"
import { Image } from 'react-native'

var background = require('../assets/background.png')

class Background extends React.Component {
    render() {
        return (
            <Image source={background} />
        )
    }
}

export default Background