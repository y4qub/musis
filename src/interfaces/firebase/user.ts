import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface IUser {
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