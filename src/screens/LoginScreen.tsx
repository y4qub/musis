import React from "react"
import { View, StyleSheet, TouchableOpacity, Text, TextInput, Dimensions, ProgressViewIOS, ActivityIndicator, Keyboard } from "react-native"
import { backendService } from "../services/backend"
import { DissmissKeyboard } from "../components/DismissKeyboard"
import { LoginFields } from "src/interfaces/loginFields"
import Colors from "../constants/Colors"

interface IProps {
    loaded?: boolean
}

interface IState {
    register: boolean
    errorMessage?: string
    loginFields: LoginFields
}

export class LoginScreen extends React.Component<IProps, IState> {
    usernameInput: TextInput
    passwordInput: TextInput
    confirmPasswordInput: TextInput
    timeout

    constructor(props) {
        super(props)
        this.state = {
            register: false,
            loginFields: {
                email: '',
                password: '',
                username: '',
                confirmPassword: ''
            }
        }
    }

    switchToRegisterView() {
        this.setState({ register: true, errorMessage: null })
    }

    switchToLoginView() {
        this.setState({ register: false, errorMessage: null })
    }

    async login() {
        Keyboard.dismiss()
        if (!this.state.loginFields.email || !this.state.loginFields.password) {
            this.showError('Empty fields!')
            return
        }
        return backendService.user
            .signInWithEmailAndPassword(this.state.loginFields.email, this.state.loginFields.password)
            .catch(error => {
                this.showError(error.toString())
            })
    }

    async register() {
        Keyboard.dismiss()
        if (!this.state.loginFields.email
            || !this.state.loginFields.password
            || !this.state.loginFields.username) {
            this.showError('Empty fields!')
            return
        }
        if (this.state.loginFields.password != this.state.loginFields.confirmPassword) {
            this.showError('Passwords do not match!')
            return
        }
        return backendService.user
            .createUser(this.state.loginFields.email,
                this.state.loginFields.password,
                this.state.loginFields.username)
            .catch(error => {
                this.showError(error.toString())
            })
    }

    showError(message: string) {
        if (this.timeout) clearTimeout(this.timeout)
        this.setState({ errorMessage: message })
        this.timeout = setTimeout(() => this.setState({ errorMessage: null }), 2000)
    }

    render() {
        const bottomText = this.state.register ?
            "Have an account already? Log in instead" : "Don't have an account? Create a new one"
        const bottomAction = () => this.state.register ? this.switchToLoginView() : this.switchToRegisterView()
        return (
            <DissmissKeyboard>
                <View style={styles.container}>
                    <Text style={styles.appTitle}>MUSIS</Text>
                    {this.props.loaded ?
                        <><TextInput
                            style={styles.chatTextInput}
                            placeholder='Email'
                            textContentType={'emailAddress'}
                            keyboardType={'email-address'}
                            blurOnSubmit={false}
                            autoCapitalize='none'
                            placeholderTextColor='rgba(255,255,255, 0.25)'
                            returnKeyType={'next'}
                            onSubmitEditing={() => this.state.register ? this.usernameInput.focus() : this.passwordInput.focus()}
                            value={this.state.loginFields.email}
                            onChangeText={text => this.setState({ loginFields: { ...this.state.loginFields, email: text } })} />
                            {this.state.register ?
                                <TextInput
                                    style={styles.chatTextInput}
                                    placeholder='Username'
                                    textContentType={'username'}
                                    placeholderTextColor='rgba(255,255,255, 0.25)'
                                    returnKeyType={'next'}
                                    ref={input => this.usernameInput = input}
                                    onSubmitEditing={() => this.passwordInput.focus()}
                                    blurOnSubmit={false}
                                    value={this.state.loginFields.username}
                                    onChangeText={text => this.setState({ loginFields: { ...this.state.loginFields, username: text } })} />
                                : null}
                            <TextInput
                                style={styles.chatTextInput}
                                placeholder='Password'
                                autoCapitalize='none'
                                textContentType={'password'}
                                secureTextEntry={true}
                                placeholderTextColor='rgba(255,255,255, 0.25)'
                                returnKeyType={this.state.register ? 'next' : 'done'}
                                ref={input => this.passwordInput = input}
                                onSubmitEditing={() => this.state.register ? this.confirmPasswordInput.focus() : null}
                                blurOnSubmit={!this.state.register}
                                value={this.state.loginFields.password}
                                onChangeText={text => this.setState({ loginFields: { ...this.state.loginFields, password: text } })} />
                            {this.state.register ?
                                <TextInput
                                    style={styles.chatTextInput}
                                    placeholder='Confirm password'
                                    autoCapitalize='none'
                                    secureTextEntry={true}
                                    placeholderTextColor='rgba(255,255,255, 0.25)'
                                    returnKeyType={'done'}
                                    ref={input => this.confirmPasswordInput = input}
                                    blurOnSubmit={true}
                                    value={this.state.loginFields.confirmPassword}
                                    onChangeText={text => this.setState({ loginFields: { ...this.state.loginFields, confirmPassword: text } })} />
                                : null}
                            {this.state.errorMessage ?
                                <Text
                                    style={{ padding: 10, color: 'red', textAlign: 'center' }}>
                                    {this.state.errorMessage}
                                </Text>
                                : null}
                            <TouchableOpacity
                                onPress={() => { this.state.register ? this.register() : this.login() }}
                                style={styles.loginButton} activeOpacity={0.5}>
                                <Text style={{ color: 'white' }}>{this.state.register ? 'SIGN UP' : 'LOGIN'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => bottomAction()}
                                activeOpacity={0.5}
                                style={{ padding: 27 }}
                            >
                                <Text style={{ color: 'white' }}>{bottomText}</Text>
                            </TouchableOpacity>
                        </>
                        : <ActivityIndicator size="large" color="white" style={{ marginTop: 20 }} />}

                </View>
            </DissmissKeyboard >
        )
    }

}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primaryBg
    },
    chatTextInput: {
        width: Dimensions.get('screen').width * 0.7,
        backgroundColor: 'rgba(0,0,0,0.4)',
        color: 'white',
        paddingTop: 12,
        paddingHorizontal: 25,
        marginBottom: 10,
        fontSize: 15,
        borderRadius: 15
    },
    appTitle: {
        fontSize: 40, color: 'white', fontFamily: 'MavenProBold', marginBottom: 22
    },
    loginButton: {
        paddingVertical: 13,
        paddingHorizontal: 35,
        backgroundColor: Colors.primary,
        borderRadius: 15,
        marginTop: 22
    }
})