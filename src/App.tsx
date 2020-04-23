import React from 'react'
import { MapScreen } from './screens/MapScreen'
import {
  View, StyleSheet, Text, NativeEventEmitter,
  EmitterSubscription, Linking, TouchableOpacity, StatusBar
} from 'react-native'
import { BottomBar } from './components/BottomBar'
import { Tab } from './interfaces/tab'
import SpotifyModule from './services/SpotifyModule'
import { ChatScreen } from './screens/ChatScreen'
import { backendService } from './services/backend'
import { LoginScreen } from './screens/LoginScreen'
import { Subscription } from 'rxjs'
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from './constants/Colors'

interface IProps { }

interface IState {
  activeTab: Tab,
  loggedIn?: boolean,
  keyboardStatus?: boolean
}

export default class App extends React.Component<IProps, IState> {
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
    // Connect to the Native Module to control the Spotify SDK
    const spotifyEventEmitter = new NativeEventEmitter(SpotifyModule)
    // Update song
    this.playbackStateListener = spotifyEventEmitter.addListener('playerStateChanged', event => {
      if (!this.state.loggedIn) return
      backendService.user.setSong({ artist: event.artist, name: event.name, coverUrl: event.cover_url })
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
    StatusBar.setHidden(true)
  }

  componentWillUnmount() {
    this.tabSub?.unsubscribe()
    this.authStateSub?.unsubscribe()
    this.keyboardOpenSub?.unsubscribe()
    this.playbackStateListener?.remove()
  }

  render() {
    const loaded = this.state.loggedIn != null
    const loggedIn = this.state.loggedIn
    return (
      loggedIn ? <this.InnerScreen /> : <LoginScreen loaded={loaded} />
    )
  }

  InnerScreen = () => {
    return (
      <View style={styles.container}>
        <MapScreen />
        <View style={styles.appTitle}>
          <Text style={styles.appTitleText}>MUSIS</Text>
          {this.LogoutButton()}
        </View>
        <ChatScreen show={this.state.activeTab == 'chats'} />
        <BottomBar activeTab={this.state.activeTab} show={!this.state.keyboardStatus} />
      </View>
    )
  }

  LogoutButton = () => {
    return (
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={_ => backendService.user.signOut()}>
        <Icon name="md-exit" size={28} color={'white'} />
      </TouchableOpacity>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg
  },
  appTitleText: {
    fontSize: 40,
    color: 'white',
    fontFamily: 'MavenProBold'
  },
  appTitle: {
    flexDirection: 'row',
    marginTop: 35
  },
  logoutButton: {
    borderRadius: 50,
    height: 56, width: 56,
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    marginLeft: 25,
    right: 10
  }
})