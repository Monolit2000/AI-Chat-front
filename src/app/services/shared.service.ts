import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatWithChatResponseDto } from '../chat/chat-with-chat-response-dto';
import { ChatDto } from '../chat/chat-dto';


@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private objectSource = new Subject<ChatDto>(); // Поток данных
  object$ = this.objectSource.asObservable(); // Observable, на который подписываются компоненты

  // Метод для передачи объекта
  sendObject(object: ChatDto) {
    this.objectSource.next(object);
  }
}
