import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface IFirebaseUser {
    location?: FirebaseFirestoreTypes.GeoPoint
    song?: {
        artist: string
        name: string
        coverUrl: string
    }
    name: string
    uid: string
    color: string
}