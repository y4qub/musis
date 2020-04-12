import firebase from '@react-native-firebase/app'
import '@react-native-firebase/firestore';
import '@react-native-firebase/auth';
import { ISong } from '../interfaces/song'
import { ISpotifyProviderAuth } from '../interfaces/auth'
import { Subject, Observable } from 'rxjs'
import { switchMap, filter, combineLatest } from 'rxjs/operators'
import { Location } from '../interfaces/location'
import { IMessage } from '../interfaces/message'
import { Chats } from 'src/interfaces/firebase/chats'
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

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
        setSpotifyAuth: async (auth: ISpotifyProviderAuth) => {
            if (!this.uid) return
            return firebase.firestore().doc(`users/${this.uid}}/auth/spotify`).set(auth)
        },
        signInWithEmailAndPassword: (email = 'murcja812@gmail.com', password = 'pust11') => {
            return firebase.auth().signInWithEmailAndPassword(email, password)
        },
        signOut: async () => { return firebase.auth().signOut() },
        getUid: () => { return this.uid },
        authState: this.authState.asObservable(),
    }
    chat = {
        sendMessage: async (text: string, chatId: string) => {
            if (!this.uid) return
            const message: IMessage = {
                text: text,
                uid: this.uid,
                createdAt: firebase.firestore.Timestamp.now()
            }
            const ref = firebase.firestore().doc(`chats/${chatId}}/private/messages`)
            return ref.update({ messages: firebase.firestore.FieldValue.arrayUnion(message) })
        },
        getChats$: () => {
            return this.chat.getQuery().pipe(
                filter(() => {
                    return this.uid ? true : false
                })
            )
        },
        test: () => {
            return combineLatest(this.user.authState, this.chat.getQuery)
        },
        getQuery: (): Observable<FirebaseFirestoreTypes.QuerySnapshot> => {
            return Observable.create(observer =>
                firebase.firestore().collection(`chats`)
                    .where('users', 'array-contains', 'PIS7tcE3N2NNQEnG2eRy7SlIkkt1')
                    .onSnapshot({ next: data => observer.next(data) })
            )
        },

        getChat: async (chatId: string) => {
            if (!this.uid) return
            return firebase.firestore().doc(`chats/${chatId}`).get()
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