import firebase from '@react-native-firebase/app'
import '@react-native-firebase/firestore';
import '@react-native-firebase/auth';
import { ISong } from '../interfaces/song'
import { Subject, Observable } from 'rxjs'
import { flatMap, map } from 'rxjs/operators'
import { Location } from '../interfaces/location'
import { IMessage } from '../interfaces/message'
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { IChatItem } from '../interfaces/chatItem';
import { IMarker } from '../interfaces/marker';
import { User } from '../interfaces/firebase/user';

class BackendService {
    private uid: string
    private authState = new Subject<FirebaseAuthTypes.User>()
    user = {
        setSong: async (song: ISong) => {
            if (!this.uid) return
            await firebase.firestore().doc(`users/${this.uid}}`).set(song)
        },
        setLocation: async (location: Location) => {
            if (!this.uid) return
            const geopoint = new firebase.firestore.GeoPoint(location.latitude, location.longitude)
            const locationObj = { location: geopoint }
            return firebase.firestore().doc(`users/${this.uid}}`).set(locationObj)
        },
        getUser: (uid: string) => {
            return firebase.firestore().doc(`users/${uid}`)
        },
        getUsers: () => {
            return firebase.firestore().collection(`users`)
        },
        getUsers$: (): Observable<FirebaseFirestoreTypes.QuerySnapshot> => {
            return Observable.create(observer =>
                firebase.firestore().collection(`users`)
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },
        getMarkers$: () => {
            return backendService.user.getUsers$().pipe(
                map(data => {
                    var markers: IMarker[] = []
                    for (const element of data.docs) {
                        const user = element.data() as User
                        const location = user.location
                        const marker: IMarker = {
                            color: 'red',
                            imageUrl: user.song.cover_url,
                            latlng: { latitude: location.latitude, longitude: location.longitude }
                        }
                        markers.push(marker)
                    }
                    return markers
                })
            )
        },
        signInWithEmailAndPassword: (email, password) => {
            return firebase.auth().signInWithEmailAndPassword(email, password)
        },
        signOut: () => { return firebase.auth().signOut() },
        getUid: () => { return this.uid },
        authState: this.authState.asObservable(),
    }
    chat = {
        sendMessage: (text: string, chatId: string) => {
            if (!this.uid) return
            const message: IMessage = {
                text: text,
                uid: this.uid,
                createdAt: firebase.firestore.Timestamp.now()
            }
            const ref = firebase.firestore().doc(`chats/${chatId}/private/messages`)
            return ref.update({ messages: firebase.firestore.FieldValue.arrayUnion(message) })
        },
        getQuery: (): Observable<FirebaseFirestoreTypes.QuerySnapshot> => {
            return Observable.create(observer =>
                firebase.firestore().collection(`chats`)
                    .where('users', 'array-contains', this.user.getUid())
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },
        getChats: () => {
            return this.chat.getQuery().pipe(
                flatMap(async data => {
                    var chatItems: IChatItem[] = []
                    for (const chat of data.docs) {
                        const users: [] = chat.data().users
                        const otherUserUid = users.filter(element => element != this.user.getUid())[0]
                        const otherUserRef = await this.user.getUser(otherUserUid).get()
                        const otherUser = otherUserRef.data()
                        const chatItem: IChatItem = {
                            lastMessage: chat.data().lastMessage,
                            name: otherUser.name,
                            profilePicture: otherUser.song.cover_url,
                            id: chat.data().id
                        }
                        chatItems.push(chatItem)
                    }
                    return chatItems
                })
            )
        },
        getDetailChat: (id: string) => {
            return firebase.firestore().doc(`chats/${id}/private/messages`)
        },
        getChat: (chatId: string) => {
            if (!this.uid) return
            return firebase.firestore().doc(`chats/${chatId}`)
        },
    }

    constructor() {
        firebase.auth().onAuthStateChanged(user => {
            if (user)
                this.uid = user.uid
            this.authState.next(user)
        })
    }

}

export const backendService = new BackendService()