import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HistoryComponent } from "./history/history.component";
import { ChatComponent } from './chat/chat.component';
import { SidebarComponent } from './sidebar/sidebar.component'; 

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

  onChatSelected(chatId: string) {
    this.selectedChatId = chatId;
    console.log('Selected chat:', chatId);
  }
}
