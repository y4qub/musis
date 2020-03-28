export interface IMessage {
    text: string
    userUid: string
    createdAt: firebase.firestore.FieldValue
}