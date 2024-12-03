import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatWithChatResponseDto } from '../chat/chat-with-chat-response-dto';
import { ChatDto } from '../chat/chat-dto';


@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private subjects = new Map<string, Subject<any>>(); // Хранилище потоков


  private objectSource = new Subject<ChatDto>(); // Поток данных
  object$ = this.objectSource.asObservable(); // Observable, на который подписываются компоненты

  // Метод для передачи объекта
  sendObject(object: ChatDto) {
    this.objectSource.next(object);
  }

  // Метод для передачи данных
  sendData<T>(key: string, data: T): void {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<T>());
    }
    this.subjects.get(key)?.next(data);
  }

  // Метод для подписки на данные
  getData<T>(key: string) {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<T>());
    }
    return this.subjects.get(key)!.asObservable();
  }
}
