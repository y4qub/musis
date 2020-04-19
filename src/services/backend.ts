import firebase from '@react-native-firebase/app'
import '@react-native-firebase/firestore';
import '@react-native-firebase/auth';
import { ISong } from '../interfaces/song'
import { Subject, Observable } from 'rxjs'
import { flatMap, map, switchMap } from 'rxjs/operators'
import { Location } from '../interfaces/location'
import { IMessage } from '../interfaces/firebase/message'
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { IChatItem } from '../interfaces/chatItem';
import { IMarker } from '../interfaces/marker';
import { IUser } from '../interfaces/firebase/user';
import { IChat } from '../interfaces/firebase/chat';
import { Tab } from '../interfaces/tab';
import { IChatDetail } from '../interfaces/chatDetail';

class BackendService {
    private uid: string
    private authState = new Subject<FirebaseAuthTypes.User>()
    private chatDetail = new Subject<string>()
    public tab = new Subject<Tab>()
    user = {
        getUser: (uid: string) => {
            return firebase.firestore().doc(`users/${uid}`)
        },
        getUser$: (uid: string): Observable<FirebaseFirestoreTypes.QueryDocumentSnapshot> => {
            return Observable.create(observer =>
                this.user.getUser(uid)
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },
        getUsers$: (): Observable<FirebaseFirestoreTypes.QuerySnapshot> => {
            return Observable.create(observer =>
                firebase.firestore().collection(`users`).orderBy('song')
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },
        setSong: (song: ISong) => {
            console.log(song)
            return this.user.getUser(this.uid).set({ song: song }, { merge: true })
        },
        setLocation: (location: Location) => {
            const geopoint = new firebase.firestore.GeoPoint(location.latitude, location.longitude)
            return this.user.getUser(this.uid).set({ location: geopoint }, { merge: true })
        },
        getMarkers$: () => {
            return backendService.user.getUsers$().pipe(
                map(data => {
                    var markers: IMarker[] = []
                    for (const element of data.docs) {
                        const user = element.data() as IUser
                        if (user.uid == this.uid) continue
                        const location = user.location
                        const maerkerColor = this.generateRandomColor()
                        const marker: IMarker = {
                            color: maerkerColor,
                            imageUrl: user.song?.coverUrl,
                            latlng: { latitude: location?.latitude, longitude: location?.longitude },
                            user: { name: user.name, uid: user.uid }
                        }
                        markers.push(marker)
                    }
                    return markers
                })
            )
        },
        changeTab: (tab: Tab) => {
            this.tab.next(tab)
        },
        createUser: async (email: string, password: string, username: string) => {
            if (!email || !password || !username) return
            const loginRef = await firebase.auth().createUserWithEmailAndPassword(email, password)
            const uid = loginRef.user.uid
            await firebase.firestore().doc(`users/${uid}`).set({ uid: uid, name: username })
            return loginRef
        },
        signInWithEmailAndPassword: (email: string, password: string) => {
            if (!email || !password) return
            return firebase.auth().signInWithEmailAndPassword(email, password)
        },
        signOut: () => { return firebase.auth().signOut() },
        getUid: () => { return this.uid },
        authState: this.authState.asObservable(),
    }
    chat = {
        sendMessage: async (text: string, chatId: string) => {
            const message: IMessage = {
                text: text,
                uid: this.uid,
                createdAt: firebase.firestore.Timestamp.now()
            }
            const ref = firebase.firestore().doc(`chats/${chatId}/private/messages`)
            return ref.update({ messages: firebase.firestore.FieldValue.arrayUnion(message) })
        },
        createChat: async (uid1: string, uid2: string): Promise<string> => {
            const newChat: Partial<IChat> = { users: [uid1, uid2] }
            const chat = await this.chat.findChat(uid1, uid2)
            if (chat) return chat.id
            const data = await firebase.firestore().collection(`chats`).add(newChat)
            await data.update({ id: data.id })
            await data.firestore.doc(`chats/${data.id}/private/messages`).set({ messages: [] })
            return data.id
        },
        openChat: (chatId: string) => {
            this.chatDetail.next(chatId)
        },
        findChat: async (uid1: string, uid2: string) => {
            // Firestore Query Workaround (can't query AND as array in a document field)
            const chats = await firebase.firestore().collection(`chats`)
                .where('users', 'array-contains', uid1).get()
            const existingChats = chats.docs.filter(chat => chat.data().users.includes(uid2))
            return existingChats[0]?.data() as IChat
        },
        getChatDetail$: () => {
            return this.chatDetail.pipe(
                switchMap(chatId => {
                    return this.chat._getChatDetail$(chatId)
                })
            )
        },
        getChatItem$: (chatId: string) => {
            return this.chat._getChat$(chatId).pipe(
                flatMap(async data => {
                    const chat = data.data()
                    const users: [] = chat.users
                    const otherUserUid = users.filter(element => element != this.user.getUid())[0]
                    const otherUserRef = await this.user.getUser(otherUserUid).get()
                    const otherUser = otherUserRef.data()
                    const chatItem: IChatItem = {
                        lastMessage: chat.lastMessage,
                        name: otherUser.name,
                        profilePicture: otherUser.song?.coverUrl,
                        id: chat.id
                    }
                    return chatItem
                })
            )
        },
        getChatItems$: () => {
            return this.chat._getChats$().pipe(
                flatMap(async data => {
                    var chatItems: IChatItem[] = []
                    for (const chat of data.docs) {
                        const users: [] = chat.data().users
                        const otherUserUid = users.filter(element => element != this.user.getUid())[0]
                        const otherUserRef = await this.user.getUser(otherUserUid).get()
                        const otherUser = otherUserRef.data()
                        if (!otherUser) continue
                        const chatItem: IChatItem = {
                            lastMessage: chat.data().lastMessage,
                            name: otherUser.name,
                            profilePicture: otherUser.song?.coverUrl,
                            id: chat.data().id
                        }
                        chatItems.push(chatItem)
                    }
                    return chatItems
                })
            )
        },
        getChatMessages: (chatId: string) => {
            return firebase.firestore().doc(`chats/${chatId}/private/messages`)
        },
        getChat: (chatId: string) => {
            return firebase.firestore().doc(`chats/${chatId}`)
        },
        _getChatDetail$: (chatId: string): Observable<IChatDetail> => {
            return Observable.create(observer => {
                this.chat.getChatItem$(chatId).take(1).subscribe(chatItem => {
                    this.chat.getChatMessages(chatId).onSnapshot(data => {
                        const chatDetail: IChatDetail = {
                            chatItem: chatItem,
                            messages: data.data()?.messages ?? []
                        }
                        observer.next(chatDetail)
                    })
                })
            })
        },
        _getChats$: (): Observable<FirebaseFirestoreTypes.QuerySnapshot> => {
            return Observable.create(observer =>
                firebase.firestore().collection(`chats`)
                    .where('users', 'array-contains', this.user.getUid())
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },
        _getChat$: (chatId: string): Observable<FirebaseFirestoreTypes.QueryDocumentSnapshot> => {
            return Observable.create(observer =>
                this.chat.getChat(chatId)
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },
    }

    constructor() {
        firebase.auth().onAuthStateChanged(user => {
            if (user)
                this.uid = user.uid
            this.authState.next(user)
        })
    }

    private generateRandomColor() {
        const random = Math.round(Math.random() * 10)
        var color: string
        switch (random) {
            case 0:
                color = 'blue'; break;
            case 1:
                color = 'red'; break;
            case 2:
                color = 'green'; break;
            case 3:
                color = 'purple'; break;
            case 4:
                color = 'pink'; break;
            case 5:
                color = 'aqua'; break;
            case 6:
                color = 'cyan'; break;
            case 7:
                color = 'orange'; break;
            case 8:
                color = 'teal'; break;
            case 9:
                color = 'yellow'; break;
            case 10:
                color = 'indigo'; break;
        }
        return color
    }

}

export const backendService = new BackendService()