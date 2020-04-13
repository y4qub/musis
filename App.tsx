import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import {
  View, StyleSheet, Text, NativeEventEmitter,
  EmitterSubscription, Linking, Button, TextInput
} from 'react-native'
import { BottomBar } from './src/components/BottomBar'
import { Tab } from './src/interfaces/tab'
import SpotifyModule from './src/services/SpotifyModule'
import { ChatScreen } from './src/screens/ChatScreen'
import { backendService } from './src/services/backend'
import { LoginScreen } from './src/screens/LoginScreen'

interface IProps { }

interface IState { activeTab: Tab, status?: string }

export default class App extends React.Component<IProps, IState> {
  spotifySdk: EmitterSubscription
  loginFields = {
    email: '',
    password: ''
  }
  btnRef: any
  constructor(props: IProps) {
    super(props)
    this.changeTab = this.changeTab.bind(this)
    this.InnerScreen = this.InnerScreen.bind(this)
    this.FirebaseLogin = this.FirebaseLogin.bind(this)
    this.state = {
      activeTab: 'explore'
    }
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(SpotifyModule)
    // this.eventListener = eventEmitter.addListener('playerStateChanged', event => {
    //   console.log('playerStateChanged', event)
    // })
    this.spotifySdk = eventEmitter.addListener('status', async event => {
      this.setState({ status: 'disconnected' })
    })
  }

  componentWillUnmount() {
    if (this.spotifySdk) this.spotifySdk.remove()
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.status == 'connected' ? <this.InnerScreen /> : null}
        {this.state.status == 'disconnected' ? <LoginScreen /> : null}
        {this.state.status == 'logging' ? <this.FirebaseLogin /> : null}
      </View>
    )
  }

  async login() {
    const loginRef = await backendService.user.
      signInWithEmailAndPassword(this.loginFields.email, this.loginFields.password)
    this.setState({ status: 'connected' })
  }

  FirebaseLogin() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.chatTextInput}
          placeholder='Email'
          onChangeText={text => this.loginFields.email = text} />
        <TextInput
          style={styles.chatTextInput}
          placeholder='Password'
          onChangeText={text => this.loginFields.password = text} />
        <Button onPress={() => this.login()} title={'Login'} ref={this.btnRef} />
      </View>
    )
  }

  InnerScreen() {
    return (
      <>
        <MapScreen />
        <Text style={styles.appTitle}>MUSIS</Text>
        {this.state.activeTab == 'chats' ? <ChatScreen /> : null}
        <BottomBar activeTab={this.state.activeTab} changeTabCallback={this.changeTab} />
      </>
    )
  }

  async getUrlAsync() {
    return Linking.getInitialURL()
  }

  changeTab(tab: Tab) {
    this.setState({ activeTab: tab })
    // SpotifyModule.show('Awesome!', SpotifyModule.SHORT)
  }

}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  appTitle: {
    fontSize: 40, color: 'white', fontFamily: 'MavenProBold', marginTop: 45
  },
  chatTextInput: {
    width: 210
  }
})