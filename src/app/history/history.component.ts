import { Component } from '@angular/core';
import { ChatComponent } from "../chat/chat.component";
import { ChatListComponent } from '../chat-list/chat-list.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {

}
