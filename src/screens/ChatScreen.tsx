import React from "react";
import { IChatItem } from "../interfaces/chatItem";
import { View, FlatList, TouchableOpacity, Image, Text, TextInput, StyleSheet, Dimensions, Keyboard, EmitterSubscription } from "react-native";
import { IMessage } from "../interfaces/firebase/message";
import { backendService } from "../../src/services/backend";
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from "../constants/Colors";
import { Subscription } from 'rxjs'

interface IProps { show: boolean }

interface IState {
    chatItems: IChatItem[]
    detail?: {
        chatItem: IChatItem
        messages: IMessage[]
    }
    keyboardOpen?: boolean
    keyboardHeight: number
}

export class ChatScreen extends React.Component<IProps, IState> {
    textInput: TextInput
    text: string
    scrollView: FlatList<any>
    keyboardDidShowSub: EmitterSubscription
    keyboardDidHideSub: EmitterSubscription
    getChatItemsSub: Subscription
    getDetailSub: Subscription

    constructor(props) {
        super(props)
        this.state = { chatItems: [], keyboardHeight: 0 }
    }

    componentDidMount() {
        this.getChatItemsSub = backendService.chat.getChatItems$()
            .subscribe(chatItems => this.setState({ chatItems }))
        this.getDetailSub = backendService.chat.getChatDetail$()
            .subscribe(item => this.setState({ detail: item }))
        this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow',
            event => {
                this.setKeyboardStatus(true)
                this.setState({ keyboardHeight: event.endCoordinates.height })
            })
        this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide',
            event => {
                this.setKeyboardStatus(false)
                this.setState({ keyboardHeight: 0 })
            })
    }

    setKeyboardStatus(status: boolean) {
        backendService.setKeyboardStatus$(status)
        this.setState({ keyboardOpen: status })
    }

    componentWillUnmount() {
        if (this.getChatItemsSub) this.getChatItemsSub.unsubscribe()
        if (this.getDetailSub) this.getDetailSub.unsubscribe()
        this.keyboardDidHideSub.remove()
        this.keyboardDidShowSub.remove()
    }

    handleBack() {
        this.setState({ detail: null })
    }

    sendMessage = () => {
        if (!this.text) return
        const formattedText = this.text.replace(/\s/g, '')
        if (formattedText) {
            Keyboard.dismiss()
            backendService.chat.sendMessage(formattedText, this.state.detail.chatItem.id)
            this.text = null
            this.textInput.clear()
        }
    }

    openChat(chatId: string) {
        backendService.chat.openChat(chatId)
    }

    render() {
        return this.Chats()
    }

    Chats = () => {
        const content = this.state.detail ? this.Detail() : this.ChatList()
        return (
            <View
                style={{
                    ...styles.chats,
                    height: this.state.keyboardOpen ? Dimensions.get('window').height - this.state.keyboardHeight : styles.chats.height,
                    zIndex: this.props.show ? 1 : -1
                }}>
                {content}
            </View>
        )
    }

    chatListRenderItem = ({ item }) => this.ChatItem(item)

    ChatList = () => {
        const noChats = this.state.chatItems?.length == 0
        return (
            noChats ? <Text style={styles.noChatsLabel}>No chats</Text> :
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
                onPress={() => this.openChat(item.id)}>
                {item.profilePicture ? <Image
                    source={{ uri: item.profilePicture, width: 50, height: 50 }}
                    style={styles.profilePicture} /> :
                    <View style={{
                        ...styles.profilePicture,
                        width: 50,
                        height: 50
                    }}></View>
                }
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
                        source={{ uri: this.state.detail.chatItem.profilePicture, width: 50, height: 50 }}
                        style={{ ...styles.profilePicture }} />
                    <Text style={styles.chatItemTitle}>{this.state.detail.chatItem.name}</Text>
                </View>
            </View>
        )
    }

    Detail = () => {
        return (
            <View style={styles.detail}>
                {this.ChatHeader()}
                {this.Chat()}
                {this.ChatBottom()}
            </View>
        )
    }

    chatRenderItem = ({ item }) => this.Message(item)

    Chat = () => {
        return (
            <FlatList
                removeClippedSubviews={true}
                style={{ flexGrow: 1, paddingHorizontal: 25 }}
                data={this.state.detail.messages}
                renderItem={this.chatRenderItem}
                keyExtractor={(item, index) => index.toString()}
                ref={flatList => { this.scrollView = flatList }}
                onContentSizeChange={() => this.scrollView.scrollToEnd()} />
        )
    }

    Message = (message: IMessage) => {
        const messageStyle = message.uid == backendService.user.getUid() ? styles.textBubbleOwn : styles.textBubble
        return (
            <View style={messageStyle}>
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
                    placeholderTextColor='rgba(255, 255, 255, 0.7)'
                    onChangeText={value => this.text = value}
                    onSubmitEditing={() => this.sendMessage()}
                    ref={input => { this.textInput = input }} />
                <TouchableOpacity
                    style={{ paddingVertical: 14, paddingHorizontal: 20 }}
                    onPress={() => this.sendMessage()}>
                    <Icon name="ios-send" color="white" size={28} />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    profilePicture: {
        borderRadius: 50, marginRight: 20, backgroundColor: 'rgba(0,0,0,0.3)'
    },
    textBubble: {
        borderRadius: 17, paddingVertical: 12, paddingHorizontal: 17,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', alignSelf: 'flex-start', marginVertical: 10
    },
    textBubbleOwn: {
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
        backgroundColor: Colors.primaryBg, paddingVertical: 25, borderRadius: 40,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.7,
        top: 0
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
    },
    noChatsLabel: { textAlign: 'center', color: 'white', marginTop: 20, fontSize: 17 }
})