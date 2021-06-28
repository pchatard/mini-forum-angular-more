import { Message } from "./Message";
import { Topic } from "./Topic";

export interface User {
    id?: number;
    username: string;
    password?: string;
    passwordConfirm?: string;
    oldPassword?: string;
    topics: Topic[];
    messages: Message[];
    admin?: boolean;
}
