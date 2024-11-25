import { Component, EventEmitter, Output, HostListener  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ChatService } from '../services/chat-service.service';
import { ChatDto } from '../chat/chat-dto';


@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
})
export class ChatListComponent {
  constructor(private chatService: ChatService) {}

  @Output() chatSelected = new EventEmitter<string>();

  
  titel = "";
  selectedChat: ChatDto | null = null;
  hoveredChatId: string | null = null;
  actionMenuChatId: string | null = null;

  chatDtos: ChatDto[] = [];

  ngOnInit(): void {
    this.loadChats();
  }


  editingChatId: string | null = null;

  startEditing(chatId: string): void {
    this.editingChatId = chatId;
  }

  stopEditing(chat: ChatDto): void {
    this.editingChatId = null;

    this.chatService.renameChat(chat.chatId, chat.chatTitel).subscribe({
      next:() =>{
        console.log('Chat renamed:', chat.chatTitel);
      },
      error:(error) => {
        console.error('Error deleting chat:', error);
      },
    });

  }

  deletingChatId: string | null = null; // Храним ID удаляемого чата

  deleteChatV2(chatId: string) {
    this.deletingChatId = chatId;

    // Задержка перед удалением, чтобы анимация успела пройти
    setTimeout(() => {
      this.chatDtos = this.chatDtos.filter(chat => chat.chatId !== chatId);
      this.deletingChatId = null;
    }, 1000); 
  }



  loadChats(): void {
    this.chatService.getAllChats().subscribe({
      next: (data) => {
        this.chatDtos = data;

         // Получение первого элемента массива
      const firstChat = this.chatDtos[0];

      if (firstChat) {
        // Извлекаем ID первого чата, если он существует
        const chatId = firstChat.chatId;

        this.selectedChat = firstChat
        // Эмитим событие с ID первого чата
        this.chatSelected.emit(chatId);
      } else {
        console.warn('No chats found');
      }
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
        this.chatDtos.unshift(response);
        this.chatSelected.emit(response.chatId);
        this.selectedChat = response;
      },
      error: (error) => {
        console.error('Error creating chat:', error);
      },
    });
  }


  handleChatClick(chat: ChatDto ): void {
    this.selectChat(chat.chatId);
    this.onChatSelected(chat.chatTitel);
    this.selectedChat = chat;
    this.hoveredChatId = chat.chatId
  }

  onActionMenuClick(event: MouseEvent, chat: ChatDto): void {
    event.stopPropagation();
       this.actionMenuChatId = chat.chatId;
  }
  
  handleMouseEnter(chatId: string): void {
    this.hoveredChatId = chatId;
  }

  handleMouseLeave(chatId: string): void {
    if (this.actionMenuChatId !== chatId) {
      this.hoveredChatId = null;
    }
  }

  handleMenuMouseEnter(chatId: string): void {
    this.hoveredChatId = chatId;
  }

  handleMenuMouseLeave(chatId: string): void {
    if (this.hoveredChatId === chatId) {
      this.hoveredChatId = null;
    }
  }

  deleteChat(chatId: string): void {
    this.chatService.deleteChat(chatId).subscribe({
      next: () => {
        console.log('Chat deleted successfully');

        this.deletingChatId = chatId;
  
        const index = this.chatDtos.findIndex(chat => chat.chatId === chatId);
        if (index === -1) {
          this.selectedChat = null;
          return;
          
        }

        setTimeout(() => {
          this.chatDtos = this.chatDtos.filter(chat => chat.chatId !== chatId);
          this.deletingChatId = null;
        }, 1000);

          if(this.selectedChat?.chatId !== chatId){
            return;
          }
          

          const previousChat = this.chatDtos[index - 1] || this.chatDtos[0]; 
          if (previousChat && this.selectedChat.chatId === chatId) {
            this.chatSelected.emit(previousChat.chatId);
            this.selectedChat = previousChat;
          } else {
            // this.chatSelected.emit(null);
            const firstChat = this.chatDtos[0];

            if (firstChat) {
              // Извлекаем ID первого чата, если он существует
              const chatId = firstChat.chatId;

              this.selectedChat = firstChat;
      
              // Эмитим событие с ID первого чата
              this.chatSelected.emit(chatId);
            } else {
              console.warn('No chats found');
            }

          }
        
      },
      error: (error) => {
        console.error('Error deleting chat:', error);
      },
    });
  }

  archiveChat(chatId: string): void {
    console.log(`Архивировать чат с ID: ${chatId}`);
    this.actionMenuChatId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.actionMenuChatId = null;
    // this.editingChatId = null;
  }
}
