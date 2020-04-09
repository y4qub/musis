import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import {
  View, StyleSheet, Text, Dimensions, NativeEventEmitter, EmitterSubscription, Linking
} from 'react-native'
import { BottomBar } from './src/components/BottomBar'
import { Tab } from './src/interfaces/tab'
import Colors from './src/constants/Colors'
import SpotifyModule from './src/services/SpotifyModule'
import { ChatScreen } from './src/screens/ChatScreen'

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
    this.getUrlAsync()
    Linking.addEventListener('url', console.log)
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
    const initialUrl = await Linking.getInitialURL()
    console.log(initialUrl)
  }

  changeTab(tab: Tab) {
    this.setState({ activeTab: tab })
    SpotifyModule.show('Awesome!', SpotifyModule.SHORT)
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
  profilePicture: {
    borderRadius: 50, marginRight: 20, backgroundColor: 'rgba(0,0,0,0.3)'
  },
  textBubbleOwn: {
    borderRadius: 17, paddingVertical: 12, paddingHorizontal: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'flex-start', marginVertical: 10
  },
  textBubble: {
    borderRadius: 17, paddingVertical: 12, paddingHorizontal: 17,
    backgroundColor: Colors.primary, alignSelf: 'flex-end', marginVertical: 10,
  },
  detail: {
    flex: 1, flexDirection: 'column', justifyContent: 'space-between'
  },
  backButton: { padding: 15, marginRight: 25 },
  chatItem: {
    height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25
  },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25
  },
  chatItemTitle: {
    color: 'white', fontSize: 19, fontFamily: 'MavenProBold'
  },
  chatItemSubtitle: {
    color: 'white', fontSize: 15, fontFamily: 'MavenProRegular'
  },
  chats: {
    position: 'absolute',
    backgroundColor: '#202030', paddingVertical: 25, borderRadius: 40,
    width: Dimensions.get('window').width,
    height: 430, top: Dimensions.get('window').height / 2 - 240 - 60
  },
  chatTextInput: {
    color: 'white', flex: 1, paddingTop: 10, paddingLeft: 20
  },
  chatBottom: {
    borderRadius: 22, alignSelf: 'flex-start', backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', padding: 0,
    marginHorizontal: 25, marginTop: 10,
  },
  chatHeaderTitle: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
  }
})