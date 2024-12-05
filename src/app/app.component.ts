import { Component, Output , EventEmitter} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HistoryComponent } from "./history/history.component";
import { ChatComponent } from './chat/chat.component';
import { SidebarComponent } from './sidebar/sidebar.component'; 
import { ChatDto } from './chat/chat-dto';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ChatService } from './services/chat-service.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HistoryComponent, ChatComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  constructor(private cdr: ChangeDetectorRef, private chatService: ChatService) {}

  texts: string[] = []; // Массив для хранения полученных данных
  eventSource: EventSource | null = null; // Для хранения ссылки на EventSource

  startStreaming() {

     this.chatService.streamChatResponses('901fcf83-24af-4340-a4cf-759f61b0b88d', 'Test').subscribe({
      next: (chat) => {
        console.log('Streaming:', chat);
        this.texts.push(chat.conetent); // Добавляем текст в массив
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Streaming error:', error);
      },
    });


    // Инициализируем EventSource
    // this.eventSource = new EventSource('http://localhost:5000/AudioProcessing/stream-sse');

    // // Обработка получения сообщений
    // this.eventSource.onmessage = (event) => {
    //   const chat: string = event.data;
    //   console.log('Streaming:', chat);
    //   this.texts.push(chat); // Добавляем полученный текст в массив
    //   this.cdr.detectChanges(); // Уведомляем Angular об изменениях
    // };

    // // Обработка ошибок
    // this.eventSource.onerror = (error) => {
    //   console.error('EventSource error:', error);
    //   this.eventSource?.close(); // Закрываем соединение при ошибке
    // };
  }


  title = 'audio-to-text';

  selectedChatId: string | null = null;

  @Output() chatCreated = new EventEmitter<ChatDto>();

  onChatSelected(chatId: string) {
    this.selectedChatId = chatId;
    console.log('Selected chat:', chatId);
  }

  
  onChatSelectedd(chatDto: ChatDto ) {
    this.chatCreated.emit(chatDto);
  }
}
