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

interface IState { activeTab: Tab, loggedIn?: boolean, spotifyConnected?: boolean }

export default class App extends React.Component<IProps, IState> {
  spotifySdk: EmitterSubscription
  eventListener: EmitterSubscription
  constructor(props: IProps) {
    super(props)
    this.changeTab = this.changeTab.bind(this)
    this.InnerScreen = this.InnerScreen.bind(this)
    this.state = {
      activeTab: 'explore'
    }
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(SpotifyModule)
    this.eventListener = eventEmitter.addListener('playerStateChanged', event => {
      console.log('playerStateChanged', event)
      backendService.user.setSong({ artist: event.artist, name: event.name, coverUrl: event.imageUri })

    })
    this.eventListener = eventEmitter.addListener('status', event => {
      this.setState({ spotifyConnected: event == 'connected' })
    })
    backendService.user.authState.subscribe(user => {
      this.setState({ loggedIn: user ? true : false })
    })
  }

  componentWillUnmount() {
    if (this.spotifySdk) this.spotifySdk.remove()
  }

  render() {
    const loaded = this.state.loggedIn != null && this.state.spotifyConnected != null
    const auth = this.state.loggedIn && this.state.spotifyConnected
    return (
      <View style={styles.container}>
        {loaded ? (auth ? <this.InnerScreen /> : <LoginScreen />) : null}
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
})