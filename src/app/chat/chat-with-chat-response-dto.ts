import { ChatDto } from "./chat-dto"

export interface ChatWithChatResponseDto {
    chatDto: ChatDto
    prompt: string 
    conetent: string
}
