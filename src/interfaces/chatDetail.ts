import { IChatItem } from "./chatItem";
import { IMessage } from "./firebase/message";

export interface IChatDetail {
    chatItem: IChatItem
    messages: IMessage[]
}