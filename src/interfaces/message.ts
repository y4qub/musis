export interface IMessage {
    text: string
    uid: string
    createdAt: firebase.firestore.Timestamp
}