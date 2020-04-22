import firebase from '@react-native-firebase/app'
import '@react-native-firebase/firestore';
import '@react-native-firebase/auth';
import { ISong } from '../interfaces/song'
import { Subject, Observable } from 'rxjs'
import { flatMap, switchMap, share } from 'rxjs/operators'
import { IMessage } from '../interfaces/firebase/message'
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { IChatItem } from '../interfaces/chatItem';
import { IChat } from '../interfaces/firebase/chat';
import { Tab } from '../interfaces/tab';
import { IChatDetail } from '../interfaces/chatDetail';
import { IUser } from 'src/interfaces/firebase/user';
import Geolocation from 'react-native-geolocation-service';

class BackendService {
    private authState = new Subject<FirebaseAuthTypes.User>()
    private chatDetail = new Subject<string>()
    private tab = new Subject<Tab>()
    private keyboardStatus = new Subject<boolean>()
    private song = new Subject<ISong>()
    private getUser = (uid: string) => {
        return firebase.firestore().doc(`users/${uid}`)
    }
    private _getChat$ = (chatId: string): Observable<FirebaseFirestoreTypes.QueryDocumentSnapshot> => {
        return Observable.create(observer =>
            this.getChat(chatId)
                .onSnapshot({ next: data => observer.next(data) })
        )
    }
    private _getChats$ = (): Observable<FirebaseFirestoreTypes.QuerySnapshot> => {
        return Observable.create(observer =>
            firebase.firestore().collection(`chats`)
                .where('users', 'array-contains', this.user.getUid())
                .onSnapshot({ next: data => observer.next(data) })
        )
    }
    private _getChatDetail$ = (chatId: string): Observable<IChatDetail> => {
        return Observable.create(observer => {
            this.getChatItem$(chatId).take(1).subscribe(chatItem => {
                this.getChatMessages(chatId).onSnapshot(data => {
                    const chatDetail: IChatDetail = {
                        chatItem: chatItem,
                        messages: data?.data()?.messages ?? []
                    }
                    observer.next(chatDetail)
                })
            })
        })
    }
    private getChatItem$ = (chatId: string) => {
        return this._getChat$(chatId).pipe(
            share(),
            flatMap(async data => {
                const chat = data.data()
                const users: [] = chat.users
                const otherUserUid = users.filter(element => element != this.user.getUid())[0]
                const otherUserRef = await this.getUser(otherUserUid).get()
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
    }
    private getChatMessages = (chatId: string) => {
        return firebase.firestore().doc(`chats/${chatId}/private/messages`)
    }
    private getChat = (chatId: string) => {
        return firebase.firestore().doc(`chats/${chatId}`)
    }
    private findChat = async (uid1: string, uid2: string) => {
        // Firestore Query Workaround (can't query AND as array in a document field)
        const chats = await firebase.firestore().collection(`chats`)
            .where('users', 'array-contains', uid1).get()
        const existingChats = chats.docs.filter(chat => chat.data().users.includes(uid2))
        return existingChats[0]?.data() as IChat
    }
    private generateRandomColor = () => {
        const random = Math.round(Math.random() * 10)
        var color: string
        switch (random) {
            case 0:
                color = '#FFE4B5'; break;
            case 1:
                color = '#AFEEEE'; break;
            case 2:
                color = '#00FF7F'; break;
            case 3:
                color = '#40E0D0'; break;
            case 4:
                color = 'yellow'; break;
            case 5:
                color = '#F08080'; break;
            case 6:
                color = '#7FFFD4'; break;
            case 7:
                color = '#FF7F50'; break;
            case 8:
                color = '#DDA0DD'; break;
            case 9:
                color = 'pink'; break;
            case 10:
                color = '#F4A460'; break;
        }
        return color
    }
    public changeTab = (tab: Tab) => {
        this.tab.next(tab)
    }
    public getTab$ = () => {
        return this.tab.asObservable()
    }
    public getKeyboardStatus$ = () => {
        return this.keyboardStatus.asObservable()
    }
    public setKeyboardStatus$ = (status: boolean) => {
        return this.keyboardStatus.next(status)
    }
    public getSong$ = () => {
        return this.song.asObservable()
    }
    user = {
        getUsers$: (): Observable<FirebaseFirestoreTypes.QuerySnapshot> => {
            return Observable.create(observer =>
                firebase.firestore().collection(`users`).orderBy('song')
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },
        setSong: (song: ISong) => {
            this.song.next(song)
            return this.getUser(this.user.getUid()).set({ song: song }, { merge: true })
        },
        setLocation: (location: Geolocation.GeoPosition) => {
            const geopoint = new firebase.firestore.GeoPoint(location.coords.latitude, location.coords.longitude)
            return this.getUser(this.user.getUid()).set({ location: geopoint }, { merge: true })
        },
        createUser: (email: string, password: string, username: string) => {
            return new Promise((resolve, reject) => {
                if (!email || !password || !username) return
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(loginRef => {
                        const uid = loginRef.user.uid
                        this.getUser(uid).set({ uid: uid, name: username, color: this.generateRandomColor() })
                        resolve(loginRef)
                    })
                    .catch(error => reject(error))
            })
        },
        signInWithEmailAndPassword: (email: string, password: string) => {
            if (!email || !password) return
            return firebase.auth().signInWithEmailAndPassword(email, password)
        },
        signOut: () => { return firebase.auth().signOut() },
        getUid: () => { return firebase.auth().currentUser?.uid },
        authState: this.authState.asObservable(),
    }
    chat = {
        sendMessage: async (text: string, chatId: string) => {
            const message: IMessage = {
                text: text,
                uid: this.user.getUid(),
                createdAt: firebase.firestore.Timestamp.now()
            }
            const ref = firebase.firestore().doc(`chats/${chatId}/private/messages`)
            return ref.update({ messages: firebase.firestore.FieldValue.arrayUnion(message) })
        },
        createChat: async (uid: string) => {
            const newChat: Partial<IChat> = { users: [uid, this.user.getUid()] }
            const chat = await this.findChat(newChat.users[0], newChat.users[1])
            if (chat) return chat.id
            const data = await firebase.firestore().collection(`chats`).add(newChat)
            await data.update({ id: data.id })
            await data.firestore.doc(`chats/${data.id}/private/messages`).set({ messages: [] })
            return data.id
        },
        openChat: (chatId: string) => {
            backendService.changeTab('chats')
            this.chatDetail.next(chatId)
        },
        getChatDetail$: () => {
            return this.chatDetail.pipe(
                share(),
                switchMap(chatId => {
                    return this._getChatDetail$(chatId)
                })
            )
        },
        getChatItems$: () => {
            return this._getChats$().pipe(
                share(),
                flatMap(async data => {
                    var chatItems: IChatItem[] = []
                    for (const chat of data.docs) {
                        const users: string[] = chat.data().users
                        const otherUserUid = users.filter(uid => uid != this.user.getUid())[0]
                        const otherUser = (await this.getUser(otherUserUid).get())?.data() as IUser
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

    }

    constructor() {
        firebase.auth().onAuthStateChanged(user => {
            this.authState.next(user)
        })
    }

}

export const backendService = new BackendService()