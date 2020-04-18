import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface IMessage {
    text: string
    uid: string
    createdAt: FirebaseFirestoreTypes.Timestamp
}