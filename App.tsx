import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import {
  View, StyleSheet, Text, NativeEventEmitter,
  EmitterSubscription, Linking, Button
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
    // this.getUrlAsync().then(console.log)
    // Linking.addEventListener('url', console.log)
    const eventEmitter = new NativeEventEmitter(SpotifyModule)
    // this.eventListener = eventEmitter.addListener('playerStateChanged', event => {
    //   console.log('playerStateChanged', event)
    // })
    this.eventListener = eventEmitter.addListener('status', event => {
      console.log('statusEvent', event)
      this.setState({ status: event })
    })
  }

  componentWillUnmount() {
    if (this.eventListener) this.eventListener.remove()
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.status == 'connected' ? <this.InnerScreen /> : null}
        {this.state.status == 'disconnected' ? <LoginScreen /> : null}
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
  }
})