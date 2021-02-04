import { IChatItem } from "./chat-item";
import { IFirebaseMessage } from "./firebase/message";

export interface IChatDetail {
    chatItem: IChatItem
    messages: IFirebaseMessage[]
}