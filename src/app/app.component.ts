import { Component, Output, EventEmitter } from '@angular/core';
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

  texts: string[] = []; // Array for storing received data
  eventSource: EventSource | null = null; // For storing the reference to EventSource

  startStreaming() {

     this.chatService.streamChatResponses('901fcf83-24af-4340-a4cf-759f61b0b88d', 'Test').subscribe({
      next: (chat) => {
        console.log('Streaming:', chat);
        this.texts.push(chat.conetent); // Add text to the array
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Streaming error:', error);
      },
    });
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
