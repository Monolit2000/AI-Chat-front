import { Component, Output , EventEmitter} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HistoryComponent } from "./history/history.component";
import { ChatComponent } from './chat/chat.component';
import { SidebarComponent } from './sidebar/sidebar.component'; 
import { ChatDto } from './chat/chat-dto';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HistoryComponent, ChatComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
