import React from "react";
import { IChatItem } from "../interfaces/chatItem";
import { View, FlatList, TouchableOpacity, Image, Text, TextInput, StyleSheet, Dimensions } from "react-native";
import { IMessage } from "../interfaces/message";
import { backendService } from "../../src/services/backend";
import { firestore } from "firebase";
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from "../constants/Colors";
import { Chats } from "src/interfaces/firebase/chats";

interface IProps { }

interface IState {
    chatItems?: IChatItem[]
    detail?: IChatItem
}

export class ChatScreen extends React.Component<IProps, IState> {

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        backendService.chat.getChats$.subscribe(data => data.onSnapshot({ next: data => console.log(data) }))
    }

    render() {
        return this.Chats()
    }

    handleBack() {
        this.setState({ detail: null })
    }

    changeChat(item: IChatItem) {
        this.setState({ detail: item })
    }

    Chats = () => {
        return (
            <View
                style={{ ...styles.chats, height: this.state.detail ? styles.chats.height + 90 : 430 }}>
                {this.state.detail ? this.Detail() : this.ChatList()}
            </View>
        )
    }

    chatListRenderItem = ({ item }) => this.ChatItem(item)

    ChatList = () => {
        return (
            <FlatList
                removeClippedSubviews={true}
                data={this.state.chatItems}
                renderItem={this.chatListRenderItem}
                keyExtractor={(item, index) => index.toString()} />
        )
    }

    ChatItem = (item: IChatItem) => {
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

    ChatHeader = () => {
        return (
            <View style={styles.chatHeader}>
                <TouchableOpacity
                    style={{ ...styles.backButton }}
                    onPress={() => this.handleBack()}>
                    <Icon name="ios-arrow-back" color="white" size={37} />
                </TouchableOpacity>
                <View style={styles.chatHeaderTitle}>
                    <Image
                        source={{ uri: this.state.detail.profilePicture, width: 50, height: 50 }}
                        style={{ ...styles.profilePicture }} />
                    <Text style={styles.chatItemTitle}>{this.state.detail.name}</Text>
                </View>
            </View>
        )
    }

    Detail = () => {
        return (
            <View style={styles.detail}>
                {this.ChatHeader()}
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
                style={message.uid == 'uid' ? styles.textBubbleOwn : styles.textBubble}>
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

const mockChatItems: IChatItem[] = [
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

const mockMessages: IMessage[] = [
    { createdAt: firestore.Timestamp.now(), text: 'yuit', uid: 'uid' },
    { createdAt: firestore.Timestamp.now(), text: 'yuit', uid: '8y79' },
    { createdAt: firestore.Timestamp.now(), text: 'yuit', uid: '8y79' },
    { createdAt: firestore.Timestamp.now(), text: 'yuit', uid: 'uid' },
]

const styles = StyleSheet.create({
    profilePicture: {
        borderRadius: 50, marginRight: 20, backgroundColor: 'rgba(0,0,0,0.3)'
    },
    textBubble: {
        borderRadius: 17, paddingVertical: 12, paddingHorizontal: 17,
        backgroundColor: Colors.primary, alignSelf: 'flex-start', marginVertical: 10
    },
    textBubbleOwn: {
        borderRadius: 17, paddingVertical: 12, paddingHorizontal: 17,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'flex-end', marginVertical: 10,
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