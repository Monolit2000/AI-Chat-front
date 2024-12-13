import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatWithChatResponseDto } from '../chat/chat-with-chat-response-dto';
import { ChatDto } from '../chat/chat-dto';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private subjects = new Map<string, Subject<any>>(); // Storage for streams

  private objectSource = new Subject<ChatDto>(); // Data stream
  object$ = this.objectSource.asObservable(); // Observable that components subscribe to

  // Method for sending an object
  sendObject(object: ChatDto) {
    this.objectSource.next(object);
  }

  // Method for sending data
  sendData<T>(key: string, data: T): void {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<T>());
    }
    this.subjects.get(key)?.next(data);
  }

  // Method for subscribing to data
  getData<T>(key: string) {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<T>());
    }
    return this.subjects.get(key)!.asObservable();
  }
}
