import React from 'react'
import { MapScreen } from './src/screens/MapScreen'
import { View, StyleSheet, Text, Dimensions, Image, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView } from 'react-native'
import { BottomBar } from './src/components/BottomBar'
import { Tab } from './src/interfaces/tab'
import { IChatItem } from './src/interfaces/chatItem'
import Colors from './src/constants/Colors'
import { backendService } from './src/services/backend'
import Icon from 'react-native-vector-icons/Ionicons';
import { IMessage } from 'src/interfaces/message'
import SpotifyModule from './src/services/SpotifyModule'

interface IProps { }

interface IState { activeTab: Tab, detail: IChatItem }

export default class App extends React.Component<IProps, IState> {
  data: IChatItem[] = [
    {
      name: 'Pavel Dope',
      lastMessage: 'hey whaddup?',
      profilePicture: 'https://www.amsterdam-dance-event.nl/img/images/artists-speakers/25152018_2081958818692755_4224981802948165640_n_206787.jpg'
    }
    ,
    {
      name: 'Martin Bida',
      lastMessage: 'cc',
      profilePicture: 'https://www.amsterdam-dance-event.nl/img/images/artists-speakers/25152018_2081958818692755_4224981802948165640_n_206787.jpg'
    }
  ]

  constructor(props: IProps) {
    super(props)
    this.changeTab = this.changeTab.bind(this)
    this.state = {
      activeTab: 'chats',
      detail: this.data[0]
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
        {!this.state.detail ?
          <BottomBar activeTab={this.state.activeTab} changeTabCallback={this.changeTab} />
          : null
        }
      </View>
    )
  }

  changeTab(tab: Tab) {
    this.setState({ activeTab: tab })
    SpotifyModule.show('Awesome!', SpotifyModule.SHORT)
  }

  handleBack() {
    this.setState({ detail: undefined })
  }

  changeChat(item: any) {
    this.setState({ detail: item })
  }

  Chats = (data: IChatItem[], detail?: IChatItem) => {
    return (
      <View
        style={{ ...styles.chats, height: this.state.detail ? styles.chats.height + 90 : 430 }}>
        {detail ? this.Detail(detail) : this.ChatList(data)}
      </View>
    )
  }

  chatListRenderItem = ({ item }) => this.ChatItem(item)

  ChatList = (data: IChatItem[]) => {
    return (
      <FlatList
        removeClippedSubviews={true}
        data={data}
        renderItem={this.chatListRenderItem}
        keyExtractor={(item, index) => index.toString()} />
    )
  }

  ChatItem = (item: any) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => this.changeChat(item)}>
        <Image
          source={{ uri: item.profilePicture, width: 50, height: 50 }}
          style={styles.profilePicture} />
        <View>
          <Text style={styles.chatItemTitle}>{item.name}</Text>
          <Text style={styles.chatItemSubtitle}>{item.lastMessage}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  ChatHeader = (detail: IChatItem) => {
    return (
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={{ ...styles.backButton }}
          onPress={() => this.handleBack()}>
          <Icon name="ios-arrow-back" color="white" size={37} />
        </TouchableOpacity>
        <View style={styles.chatHeaderTitle}>
          <Image
            source={{ uri: detail.profilePicture, width: 50, height: 50 }}
            style={{ ...styles.profilePicture }} />
          <Text style={styles.chatItemTitle}>{detail.name}</Text>
        </View>
      </View>
    )
  }

  Detail = (detail: IChatItem) => {
    return (
      <View style={styles.detail}>
        {this.ChatHeader(detail)}
        {this.Chat(mockMessages)}
        {this.ChatBottom()}
      </View>
    )
  }

  chatRenderItem = ({ item }) => this.Message(item)

  Chat = (messages: IMessage[]) => {
    return (
      <FlatList
        removeClippedSubviews={true}
        style={{ flexGrow: 1, paddingHorizontal: 25 }}
        data={messages}
        renderItem={this.chatRenderItem}
        keyExtractor={(item, index) => index.toString()} />
    )
  }

  Message = (message: IMessage) => {
    return (
      <View
        style={message.userUid == 'ownUID' ? styles.textBubble : styles.textBubble2}>
        <Text style={{ color: 'white' }}>{message.text}</Text>
      </View>
    )
  }

  ChatBottom = () => {
    return (
      <View style={styles.chatBottom}>
        <TextInput
          style={styles.chatTextInput}
          placeholder='Your message...'
          placeholderTextColor='rgba(255, 255, 255, 0.7)' />
        <TouchableOpacity
          style={{ paddingVertical: 14, paddingHorizontal: 20 }}>
          <Icon name="ios-send" color="white" size={28} />
        </TouchableOpacity>
      </View>
    )
  }

}

const mockMessages = [
  { createdAt: 876, text: 'yuit', userUid: 'ownUID' },
  { createdAt: 876, text: 'yuit', userUid: 'ownUID' },
  { createdAt: 876, text: 'yuit', userUid: '8y79' },
  { createdAt: 876, text: 'yuit', userUid: '8y79' },
  { createdAt: 876, text: 'yuit', userUid: '8y79' },
  { createdAt: 876, text: 'yuit', userUid: 'ownUID' }]

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
  textBubble: {
    borderRadius: 17, paddingVertical: 12, paddingHorizontal: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'flex-start', marginVertical: 10
  },
  textBubble2: {
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