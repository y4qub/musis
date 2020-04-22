import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import {
  View, StyleSheet, Text, NativeEventEmitter,
  EmitterSubscription, Linking, TouchableOpacity, TouchableWithoutFeedback
} from 'react-native'
import { BottomBar } from './src/components/BottomBar'
import { Tab } from './src/interfaces/tab'
import SpotifyModule from './src/services/SpotifyModule'
import { ChatScreen } from './src/screens/ChatScreen'
import { backendService } from './src/services/backend'
import { LoginScreen } from './src/screens/LoginScreen'
import { Subscription } from 'rxjs'
import Icon from 'react-native-vector-icons/Ionicons';

interface IProps { }

interface IState {
  activeTab: Tab,
  loggedIn?: boolean,
  spotifyConnected?: boolean,
  keyboardStatus?: boolean
}

export default class App extends React.Component<IProps, IState> {
  spotifySdk: EmitterSubscription
  playbackStateListener: EmitterSubscription
  authStateSub: Subscription
  tabSub: Subscription
  keyboardOpenSub: Subscription
  constructor(props: IProps) {
    super(props)
    this.state = {
      activeTab: 'explore'
    }
  }

  componentDidMount() {
    const spotifyEventEmitter = new NativeEventEmitter(SpotifyModule)
    this.playbackStateListener = spotifyEventEmitter.addListener('playerStateChanged', event => {
      if (!this.state.loggedIn) return
      backendService.user.setSong({ artist: event.artist, name: event.name, coverUrl: event.cover_url })
    })
    this.playbackStateListener = spotifyEventEmitter.addListener('status', event => {
      this.setState({ spotifyConnected: event.status == 'connected' })
    })
    this.authStateSub = backendService.user.authState.subscribe(user => {
      this.setState({ loggedIn: user ? true : false })
    })
    this.tabSub = backendService.getTab$().subscribe(tab => {
      this.setState({ activeTab: tab })
    })
    this.keyboardOpenSub = backendService.getKeyboardStatus$().subscribe(status => {
      this.setState({ keyboardStatus: status })
    })
  }

  componentWillUnmount() {
    if (this.spotifySdk) this.spotifySdk.remove()
    this.tabSub.unsubscribe()
    this.authStateSub.unsubscribe()
    this.playbackStateListener.remove()
    this.keyboardOpenSub.unsubscribe()
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
        <ChatScreen show={this.state.activeTab == 'chats'} />
        <BottomBar activeTab={this.state.activeTab} show={!this.state.keyboardStatus} />
        {this.LogoutButton()}
      </View>
    )
  }

  LogoutButton = () => {
    return (
      <TouchableOpacity
        style={{ ...styles.logoutButton }}
        onPress={_ => backendService.user.signOut()}>
        <Icon name="md-exit" size={28} color={'white'} />
      </TouchableOpacity>
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
    fontSize: 40,
    color: 'white',
    fontFamily: 'MavenProBold',
    marginTop: 45
  },
  logoutButton: {
    borderRadius: 50,
    height: 56, width: 56,
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: '#202030',
    position: "absolute",
    top: 15,
    right: 15
  }
})