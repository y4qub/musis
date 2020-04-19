import React from "react"
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Dimensions } from "react-native"
import { backendService } from "../services/backend"
import { DissmissKeyboard } from "../components/DismissKeyboard"

interface IProps { }

interface IState {
    register: boolean
    errorMessage?: string
}

interface LoginFields {
    email: string
    password: string
    username: string
}

export class LoginScreen extends React.Component<IProps, IState> {
    loginFields: LoginFields = {
        email: 'murcja812@gmail.com',
        password: 'pust11',
        username: ''
    }

    constructor(props) {
        super(props)
        this.state = { register: false }
    }

    switchToRegisterView() {
        this.setState({ register: true })
    }

    switchToLoginView() {
        this.setState({ register: false })
    }

    async login() {
        if (!this.loginFields.email || !this.loginFields.password) return
        const loginRef = await backendService.user
            .signInWithEmailAndPassword(this.loginFields.email, this.loginFields.password)
    }

    async register() {
        if (!this.loginFields.email || !this.loginFields.password || !this.loginFields.username) return
        const loginRef = await backendService.user
            .createUser(this.loginFields.email, this.loginFields.password, this.loginFields.username)
    }

    render() {
        const bottomText = this.state.register ?
            "Have an account already? Log in instead" : "Don't have an account? Create a new one"
        const bottomAction = () => this.state.register ? this.switchToLoginView() : this.switchToRegisterView()
        return (
            <DissmissKeyboard>
                <View style={styles.container}>
                    <Text style={styles.appTitle}>MUSIS</Text>
                    <TextInput
                        style={styles.chatTextInput}
                        placeholder='Email'
                        autoCapitalize='none'
                        placeholderTextColor='rgba(255,255,255, 0.15)'
                        onChangeText={text => this.loginFields.email = text} />
                    {this.state.register ? <TextInput
                        style={styles.chatTextInput}
                        placeholder='Username'
                        placeholderTextColor='rgba(255,255,255, 0.15)'
                        onChangeText={text => this.loginFields.username = text} /> : null}
                    <TextInput
                        style={styles.chatTextInput}
                        placeholder='Password'
                        autoCapitalize='none'
                        secureTextEntry={true}
                        placeholderTextColor='rgba(255,255,255, 0.15)'
                        onChangeText={text => this.loginFields.password = text} />
                    {this.state.errorMessage ? <Text style={{ padding: 10, color: 'red' }}>{this.state.errorMessage}</Text> : null}
                    <TouchableOpacity
                        onPress={() => { this.state.register ? this.register() : this.login() }}
                        style={styles.loginButton} activeOpacity={0.5}>
                        <Text style={{ color: 'white' }}>{this.state.register ? 'SIGN UP' : 'LOGIN'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => bottomAction()}
                        activeOpacity={0.5}
                        style={{ padding: 30 }}
                    >
                        <Text style={{ color: 'white' }}>{bottomText}</Text>
                    </TouchableOpacity>
                </View>
            </DissmissKeyboard>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#202030'
    },
    chatTextInput: {
        width: Dimensions.get('screen').width * 0.7,
        backgroundColor: 'rgba(0,0,0,0.25)',
        color: 'white',
        paddingTop: 12,
        paddingHorizontal: 25,
        marginBottom: 20,
        fontSize: 15,
        borderRadius: 15
    },
    appTitle: {
        fontSize: 40, color: 'white', fontFamily: 'MavenProBold', marginBottom: 30
    },
    loginButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        backgroundColor: '#FF7674',
        borderRadius: 15,
        marginTop: 20
    }
})