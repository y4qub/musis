import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import { View, StyleSheet, Text, Dimensions, Image, TouchableOpacity, FlatList, TextInput } from 'react-native'
import { BottomBar } from './src/components/BottomBar'
import { Tab } from './src/interfaces/tab'
import { IChatItem } from './src/interfaces/chatItem'
import Colors from './src/constants/Colors'
import { backendService } from './src/services/backend'
import Icon from 'react-native-vector-icons/Ionicons';

interface IProps { }

interface IState { activeTab: Tab, detail: IChatItem }

export default class App extends React.Component<IProps, IState> {
  data: IChatItem[] = [{ name: 'Pavel Dope', lastMessage: 'hey whaddup?', profilePicture: 'https://www.amsterdam-dance-event.nl/img/images/artists-speakers/25152018_2081958818692755_4224981802948165640_n_206787.jpg' }, { name: 'Martin Bida', lastMessage: 'cc', profilePicture: 'https://www.amsterdam-dance-event.nl/img/images/artists-speakers/25152018_2081958818692755_4224981802948165640_n_206787.jpg' }]

  constructor(props: IProps) {

    super(props)

    this.changeTab = this.changeTab.bind(this)
    this.state = {
      activeTab: 'explore',
      detail: undefined
    }

    // backendService.auth.signInWithEmailAndPassword().then((data: any) => {
    // console.log(data)
    // backendService.user.location.set({ latitude: 25, longitude: 86 })
    // })

  }

  render() {

    return (
      <View style={styles.container}>

        <MapScreen />
        <Text style={styles.appTitle}>MUSIS</Text>
        {this.state.activeTab == 'chats' ? this.Chats(this.data, this.state.detail) : null}
        <BottomBar activeTab={this.state.activeTab} changeTabCallback={this.changeTab}></BottomBar>

      </View>
    )
  }

  changeTab(tab: Tab) {
    this.setState({ activeTab: tab })
  }

  handleBack() {
    this.setState({ detail: undefined })
  }

  changeChat(item: any) {
    this.setState({ detail: item })
  }

  Chats = (data: IChatItem[], detail?: IChatItem) => {
    return (
      <View style={styles.chats}>
        {detail ? this.Detail(detail) : this.ChatList(data)}
      </View>)
  }

  ChatList = (data: IChatItem[]) => {
    return (
      <FlatList data={data} renderItem={({ item }) => this.ChatItem(item)} keyExtractor={(item, index) => index.toString()} />
    )
  }

  ChatItem = (item: any) => {
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => this.changeChat(item)}>
        <Image source={{ uri: item.profilePicture, width: 70, height: 70 }} style={styles.profilePicture} />
        <View>
          <Text style={styles.chatItemTitle}>{item.name}</Text>
          <Text style={styles.chatItemSubtitle}>{item.lastMessage}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  ChatHeader = (detail: IChatItem) => {
    return (
      <View style={styles.chatItem}>
        <TouchableOpacity style={styles.backButton} onPress={() => this.handleBack()}>
          <Icon name="ios-arrow-back" color="white" size={37} />
        </TouchableOpacity>
        <View style={styles.chatHeaderTitle}>
          <Image source={{ uri: detail.profilePicture, width: 70, height: 70 }} style={styles.profilePicture} />
          <Text style={styles.chatItemTitle}>{detail.name}</Text>
        </View>
      </View>
    )
  }

  Detail = (detail: IChatItem) => {
    return (
      <View style={styles.detail}>
        {this.ChatHeader(detail)}
        {this.Chat()}
        {this.ChatBottom()}
      </View>
    )
  }

  Chat = () => {
    return (
      <View style={{ flexGrow: 1 }}>
        <View style={styles.textBubble}>
          <Text style={{ color: 'white' }}>Hello whaddup??</Text>
        </View>
        <View style={styles.textBubble2}>
          <Text style={{ color: 'white' }}>haha xd</Text>
        </View>
      </View>
    )
  }

  ChatBottom = () => {
    return (
      <View style={styles.chatBottom}>
        <TextInput style={styles.chatTextInput} placeholder='Your message...' placeholderTextColor='rgba(255, 255, 255, 0.7)' />
        <TouchableOpacity style={{ backgroundColor:'brown', padding:  }}>
          <Icon name="ios-send" color="white" size={28} style={{backgroundColor: 'green'}} />
        </TouchableOpacity>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  appTitle: {
    fontSize: 45, color: 'white', fontFamily: 'MavenProBold', marginTop: 40
  },
  profilePicture: { borderRadius: 50, marginRight: 20 },
  textBubble: { borderRadius: 22, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'flex-start', marginVertical: 10 },
  textBubble2: { borderRadius: 22, padding: 20, backgroundColor: Colors.primary, alignSelf: 'flex-end', marginVertical: 10, },
  detail: { flex: 1, flexDirection: 'column', justifyContent: 'space-between' },
  backButton: { padding: 10, marginRight: 25 },
  chatItem: { height: 80, flexDirection: 'row', alignItems: 'center' },
  chatItemTitle: { color: 'white', fontSize: 19, fontFamily: 'MavenProBold' },
  chatItemSubtitle: { color: 'white', fontSize: 15, fontFamily: 'MavenProRegular' },
  chats: {
    backgroundColor: '#202030', padding: 25, borderRadius: 40, width: Dimensions.get('window').width, position: 'absolute', height: 450, top: Dimensions.get('window').height / 2 - 240 - 60
  },
  chatTextInput: { color: 'white', flex: 1, backgroundColor: 'red' },
  chatBottom: { height: 53, borderRadius: 22, alignSelf: 'flex-start', backgroundColor: 'rgba(0, 0, 0, 0.4)', flexDirection: 'row', justifyContent: 'space-between', alignItems:'stretch', padding: 0, paddingHorizontal: 15 },
  chatHeaderTitle: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }
})