import React from "react"
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Button } from "react-native"
import SpotifyModule from '../services/SpotifyModule'
import { backendService } from "../services/backend"

interface IProps { }

interface IState { }

export class LoginScreen extends React.Component<IProps, IState> {
    loginFields = {
        email: 'murcja812@gmail.com',
        password: 'pust11'
    }

    async login() {
        if (!this.loginFields.email || !this.loginFields.password) return
        const loginRef = await backendService.user.
            signInWithEmailAndPassword(this.loginFields.email, this.loginFields.password)
    }

    render() {


        return (
            <View style={{ backgroundColor: '#202030' }}>
                <TextInput
                    style={styles.chatTextInput}
                    placeholder='Email'
                    onChangeText={text => this.loginFields.email = text} />
                <TextInput
                    style={styles.chatTextInput}
                    placeholder='Password'
                    onChangeText={text => this.loginFields.password = text} />
                <Button onPress={() => this.login()} title={'Login'} />
            </View>
        )
    }

}

const styles = StyleSheet.create({
  chatTextInput: {
    width: 210
  }
})