import React from 'react'
import { MapScreen } from './screens/MapScreen'
import {
  View, StyleSheet, Text, NativeEventEmitter,
  EmitterSubscription, TouchableOpacity, StatusBar, BackHandler, NativeEventSubscription, Alert
} from 'react-native'
import { BottomBar } from './components/BottomBar'
import { Tab } from './interfaces/tab'
import SpotifyModule from './services/SpotifyModule'
import { ChatScreen } from './screens/ChatScreen'
import { backendService } from './services/backend'
import { LoginScreen } from './screens/LoginScreen'
import { Subscription } from 'rxjs'
import Icon from 'react-native-vector-icons/Ionicons';
import RNExitApp from 'react-native-exit-app';
import Colors from './constants/colors'

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
  backHandlerSub: NativeEventSubscription
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
    this.handleBack()
  }

  // Prevent Android back button from closing the app
  handleBack() {
    this.backHandlerSub = BackHandler.addEventListener('hardwareBackPress', () => {
      backendService.chat.getChatDetail$().first().subscribe(detail => {
        if (detail) {
          backendService.chat.closeChat()
        } else {
          backendService.getTab$().first().subscribe(tab => {
            if (tab == 'chats') {
              backendService.changeTab('explore')
            } else {
              Alert.alert(
                'Confirm exit',
                'Do you want to quit the app?',
                [{ text: 'CANCEL', style: 'cancel' },
                { text: 'OK', onPress: () => RNExitApp.exitApp() }]
              )
            }
          })
        }
      })
      return true
    })
  }

  componentWillUnmount() {
    this.tabSub?.unsubscribe()
    this.authStateSub?.unsubscribe()
    this.keyboardOpenSub?.unsubscribe()
    this.backHandlerSub?.remove()
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
    backgroundColor: Colors.background
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
    backgroundColor: Colors.background,
    marginLeft: 25,
    right: 10
  }
})