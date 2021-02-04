import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface IFirebaseMessage {
    text: string
    uid: string
    createdAt: FirebaseFirestoreTypes.Timestamp
}