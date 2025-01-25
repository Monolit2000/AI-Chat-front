import { Component, EventEmitter, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
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

  @Output() chatCreated = new EventEmitter<string>();

  @Output() colapsed = new EventEmitter();

  colapseSidebar(){
    this.colapsed.emit();
  }

  onNewChatCreated(chatId: string){
    this.chatCreated.emit(chatId);
  }

  onChatSelectedd(chatId: string){
    this.chatSelected.emit(chatId);
  }
}