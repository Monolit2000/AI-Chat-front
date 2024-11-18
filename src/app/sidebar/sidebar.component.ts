import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ChatService } from '../services/chat-service.service';
import { ChatDto } from '../chat/chat-dto';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent {
  constructor(private chatService: ChatService) {}

  @Output() chatSelected = new EventEmitter<string>();

  titel = "";

  chats = [
    { id: 'chat1', name: 'General Chat' },
    { id: 'chat2', name: 'Support Chat' },
    { id: 'chat3', name: 'Development Chat' },
  ];

  chatDtos: ChatDto[] = [];

  // ngOnInit(): void {
  //   this.loadChats();
  // }

  loadChats(): void {
    this.chatService.getAllChats().subscribe({
      next: (data) => {
        this.chatDtos = data;
        console.log('Chats loaded:', this.chats);
      },
      error: (error) => {
        console.error('Error loading chats:', error);
      },
    });
  }


  selectChat(chatId: string) {
    this.chatSelected.emit(chatId);
  }

  onChatSelected(name: string){
    this.titel = name;
  }


  createChat(): void {
    this.chatService.createNewChat().subscribe({
      next: (response) => {
        console.log('Chat created successfully:', response);
      },
      error: (error) => {
        console.error('Error creating chat:', error);
      },
    });
  }


  handleChatClick(chat: { id: string; name: string }): void {
    this.selectChat(chat.id);
    this.onChatSelected(chat.name);
  }
}