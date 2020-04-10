import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import { View, StyleSheet, Text, NativeEventEmitter,
  EmitterSubscription, Linking } from 'react-native'
import { BottomBar } from './src/components/BottomBar'
import { Tab } from './src/interfaces/tab'
import SpotifyModule from './src/services/SpotifyModule'
import { ChatScreen } from './src/screens/ChatScreen'
import { backendService } from './src/services/backend'

interface IProps { }

interface IState { activeTab: Tab }

export default class App extends React.Component<IProps, IState> {
  eventListener: EmitterSubscription
  constructor(props: IProps) {
    super(props)
    this.changeTab = this.changeTab.bind(this)
    this.state = {
      activeTab: 'chats',
    }
    // backendService.auth.signInWithEmailAndPassword().then((data: any) => {
    // console.log(data)
    // backendService.user.location.set({ latitude: 25, longitude: 86 })
    // })
  }

  componentDidMount() {
    backendService.user.signInWithEmailAndPassword()
    // this.getUrlAsync().then(console.log)
    // Linking.addEventListener('url', console.log)
    const eventEmitter = new NativeEventEmitter(SpotifyModule)
    this.eventListener = eventEmitter.addListener('playerStateChanged', event => {
      console.log('playerStateChanged', event)
    })
  }

  componentWillUnmount() {
    this.eventListener.remove()
  }

  render() {
    return (
      <View style={styles.container}>
        <MapScreen />
        <Text style={styles.appTitle}>MUSIS</Text>
        {this.state.activeTab == 'chats' ? <ChatScreen /> : null}
        <BottomBar activeTab={this.state.activeTab} changeTabCallback={this.changeTab} />
      </View>
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