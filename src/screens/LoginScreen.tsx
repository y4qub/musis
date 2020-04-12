import React from "react"
import { View, StyleSheet, TouchableOpacity, Text } from "react-native"
import SpotifyModule from '../services/SpotifyModule'

interface IProps { }

interface IState { }

export class LoginScreen extends React.Component<IProps, IState> {

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => SpotifyModule.connect(true)}>
                    <Text>CONNECT TO SPOTIFY</Text>
                </TouchableOpacity>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    }
})