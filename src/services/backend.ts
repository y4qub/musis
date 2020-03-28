import * as firebase from 'firebase'
import 'firebase/firestore'
import { ISong } from '../interfaces/song'
import { IProviderAuth } from '../interfaces/auth'
import { Subject } from 'rxjs'
import { Location } from '../interfaces/location'
import { IMessage } from '../interfaces/message'

const firebaseConfig = {
    apiKey: "AIzaSyA3vxII6wOeazF9nr47AackE24PIOhGcjc",
    authDomain: "musis-app.firebaseapp.com",
    databaseURL: "https://musis-app.firebaseio.com",
    projectId: "musis-app",
    storageBucket: "musis-app.appspot.com",
    messagingSenderId: "1060875362349",
    appId: "1:1060875362349:web:027b1e0b89de170f39d8a4",
    measurementId: "G-BWZRYS1XNT"
}

class BackendService {
    private uid: string
    private authState: Subject<firebase.User> = new Subject
    user = {
        setSpotifyAuth: async (auth: IProviderAuth) => {
            if (!this.uid) return
            await firebase.firestore().doc(`users/${this.uid}}`).set(auth)
        },
        getChats: () => {
            if (!this.uid) return
            return firebase.firestore().collection(`users/${this.uid}}`).where('users', 'array-contains', this.uid).get()
        },
        song: {
            get: () => {
                return firebase.firestore().doc(`users/${this.uid}}`).get()
            },
            set: async (song: ISong) => {
                if (!this.uid) return
                await firebase.firestore().doc(`users/${this.uid}}`).set(song)
            },
        },
        location: {
            set: async (location: Location) => {
                if (!this.uid) return
                const geopoint = new firebase.firestore.GeoPoint(location.latitude, location.longitude)
                const locationObj = { location: geopoint }
                return firebase.firestore().doc(`users/${this.uid}}`).set(locationObj)
            },
            get: () => {
                return firebase.firestore().doc(`users/${this.uid}}`).get()
            }
        }
    }
    auth = {
        signInWithEmailAndPassword: (email = 'murcja812@gmail.com', password = 'pust11') => {
            return firebase.auth().signInWithEmailAndPassword(email, password)
        },
        signOut: async () => { return firebase.auth().signOut() },
        authState: this.authState.asObservable()
    }
    chat = {
        sendMessage: async (text: string, chatId: string) => {
            if (!this.uid) return
            const message: IMessage = {
                text: text,
                userUid: this.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }

            const ref = firebase.firestore().doc(`chats/${chatId}}/private/messages`)
            return await ref.update({ messages: firebase.firestore.FieldValue.arrayUnion(message) })
        },
        getChat: async () => {

        }
    }

    constructor() {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig)
        firebase.auth().onAuthStateChanged(user => {
            if (user)
                this.uid = user.uid
            this.authState.next(user)
        })
    }

}

export const backendService = new BackendService()