import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface User {
    location: FirebaseFirestoreTypes.GeoPoint
    song: {
        artist: string
        name: string
        cover_url: string
    }
}