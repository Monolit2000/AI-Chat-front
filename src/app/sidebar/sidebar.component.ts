import { Component, EventEmitter, Output, HostListener  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ChatService } from '../services/chat-service.service';
import { ChatDto } from '../chat/chat-dto';
import { ChatActionDto } from './chat-action-dto';
import { ChatListComponent } from '../chat-list/chat-list.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatListComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent {
  @Output() chatSelected = new EventEmitter<string>();

  onChatSelectedd(chatId: string){
    this.chatSelected.emit(chatId);
  }
}