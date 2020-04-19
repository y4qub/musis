import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import {
  View, StyleSheet, Text, NativeEventEmitter,
  EmitterSubscription, Linking
} from 'react-native'
import { BottomBar } from './src/components/BottomBar'
import { Tab } from './src/interfaces/tab'
import SpotifyModule from './src/services/SpotifyModule'
import { ChatScreen } from './src/screens/ChatScreen'
import { backendService } from './src/services/backend'
import { LoginScreen } from './src/screens/LoginScreen'
import { Subscription } from 'rxjs'

interface IProps { }

interface IState { activeTab: Tab, loggedIn?: boolean, spotifyConnected?: boolean }

export default class App extends React.Component<IProps, IState> {
  spotifySdk: EmitterSubscription
  playbackStateListener: EmitterSubscription
  authStateSub: Subscription
  tabSub: Subscription
  constructor(props: IProps) {
    super(props)
    this.state = {
      activeTab: 'explore'
    }
  }

  componentDidMount() {
    const spotifyEventEmitter = new NativeEventEmitter(SpotifyModule)
    this.playbackStateListener = spotifyEventEmitter.addListener('playerStateChanged', event => {
      backendService.user.setSong({ artist: event.artist, name: event.name, coverUrl: event.cover_url })
    })
    this.playbackStateListener = spotifyEventEmitter.addListener('status', event => {
      this.setState({ spotifyConnected: event.status == 'connected' })
    })
    this.authStateSub = backendService.user.authState.subscribe(user => {
      this.setState({ loggedIn: user ? true : false })
    })
    this.tabSub = backendService.tab.subscribe(tab => {
      this.setState({ activeTab: tab })
    })
  }

  componentWillUnmount() {
    if (this.spotifySdk) this.spotifySdk.remove()
    if (this.tabSub) this.tabSub.unsubscribe()
    if (this.authStateSub) this.authStateSub.unsubscribe()
    if (this.playbackStateListener) this.playbackStateListener.remove()
  }

  render() {
    const loaded = this.state.loggedIn != null && this.state.spotifyConnected != null
    // const auth = this.state.loggedIn && this.state.spotifyConnected
    const auth = this.state.loggedIn
    return (
      loaded ? (auth ? <this.InnerScreen /> : <LoginScreen />) : null
    )
  }

  InnerScreen = () => {
    return (
      <View style={styles.container}>
        <MapScreen />
        <Text style={styles.appTitle}>MUSIS</Text>
        {this.state.activeTab == 'chats' ? <ChatScreen /> : null}
        <BottomBar activeTab={this.state.activeTab} />
      </View>
    )
  }

  async getUrlAsync() {
    return Linking.getInitialURL()
  }

}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#202030'
  },
  appTitle: {
    fontSize: 40, color: 'white', fontFamily: 'MavenProBold', marginTop: 45
  },
})