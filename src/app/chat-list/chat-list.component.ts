import { ChatDto } from '../chat/chat-dto';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { ChatTitelDto } from '../chat/chat-titel-dto';
import { SharedService } from '../services/shared.service';
import { ChatService } from '../services/chat-service.service';
import { Component, EventEmitter, Output, HostListener, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
})
export class ChatListComponent {
  constructor(
    private chatService: ChatService, // Injecting the ChatService to interact with chats
    private sharedService: SharedService) {} // Injecting SharedService for data sharing between components

  @Output() chatSelected = new EventEmitter<string>(); // Event emitter to notify when a chat is selected

  @ViewChild('inputField', { static: false }) inputField: ElementRef | undefined; // ViewChild to access input field element

  titel = ""; // Chat title (for UI binding)
  selectedChat: ChatDto | null = null; // Stores the currently selected chat
  hoveredChatId: string | null = null; // ID of the chat being hovered over
  actionMenuChatId: string | null = null; // ID of the chat where action menu is open
  editingChatId: string | null = null; // ID of the chat being edited
  oldChatTitle: string | null = null; // Stores the old title of the chat before editing
  chatDtos: ChatDto[] = []; // List of chat DTOs

  ngOnInit(): void {
    this.loadChats(); // Loads all chats when the component is initialized

    this.sharedService.object$.subscribe((object) => {
      this.handleReceivedObject(object); // Handles new object data when received
    });

    this.sharedService.getData<ChatTitelDto>('ChatTitelDto').subscribe((data)  => {
      this.handleReceivedChatTitelDto(data); // Handles new title data when received
    });
  }

  handleReceivedChatTitelDto(chatTitelDto: ChatTitelDto) {
    // Handles the received chat title change (animating the change)
    console.log('Object received:', chatTitelDto);
    const chat = this.chatDtos.find(i => i.chatId === chatTitelDto.chatId);
    if (chat) {
      const newTitle = chatTitelDto.newTitel;
      chat.animatedTitle = ''; // Clear before starting the animation
  
      let index = 0;
      const interval = setInterval(() => {
        if (index < newTitle.length) {
          chat.animatedTitle += newTitle[index];
          index++;
        } else {
          clearInterval(interval);
          chat.chatTitel = newTitle; // Set the final title
          chat.animatedTitle = undefined; // Remove the temporary field
        }
      }, 75); // Interval between adding characters (75 ms)
    } else {
      console.warn(`Chat with chatId=${chatTitelDto.chatId} not found.`);
    }
  }

  handleReceivedObject(object: ChatDto) {
    // Handles the received chat object, adding it to the list
    console.log('Object received:', object);
    this.chatDtos.unshift(object); // Add the new chat at the beginning
    this.selectedChat = object; // Set it as the selected chat
  }

  startEditing(chatId: string): void {
    // Starts the editing mode for the chat with the specified ID
    if (this.editingChatId === chatId) {
      this.editingChatId = null; // If already editing, stop editing
    } else {
      this.editingChatId = chatId;

      const chat = this.chatDtos.find(c => c.chatId === chatId);
      if (chat) {
        this.oldChatTitle = chat.chatTitel; // Save the old title
      }

      setTimeout(() => {
        if (this.inputField && this.inputField.nativeElement) {
          this.inputField.nativeElement.focus(); // Focus the input field for editing
        }
      }, 0);
    }
  }

  stopEditing(chat: ChatDto): void {
    // Stops editing the chat and saves the title change if any
    this.editingChatId = null;

    if (chat.chatTitel === null || chat.chatTitel === '') {
      return; // Do nothing if the title is empty
    }

    if (this.oldChatTitle === chat.chatTitel) {
      return; // If title didn't change, do nothing
    }

    this.chatService.renameChat(chat.chatId, chat.chatTitel).subscribe({
      next: () => {
        console.log('Chat renamed:', chat.chatTitel);
      },
      error: (error) => {
        console.error('Error renaming chat:', error);
      },
    });
  }

  deletingChatId: string | null = null; // Store the ID of the chat being deleted

  deleteChatV2(chatId: string) {
    // Handles chat deletion with animation delay
    this.deletingChatId = chatId;
    setTimeout(() => {
      this.chatDtos = this.chatDtos.filter(chat => chat.chatId !== chatId);
      this.deletingChatId = null;
    }, 1000); // Delay before deletion
  }

  selectNewChat(chatDto: ChatDto) {
    // Selects a new chat
    this.selectedChat = chatDto;
  }

  loadChats(): void {
    // Loads all chats from the server
    this.chatService.getAllChats().subscribe({
      next: (data) => {
        this.chatDtos = data;

        // Get the first element of the array
        const firstChat = this.chatDtos[0];

        if (firstChat) {
          const chatId = firstChat.chatId;
          this.selectedChat = firstChat;
          this.chatSelected.emit(chatId); // Emit the ID of the first chat
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
    // Emits the selected chat's ID
    this.chatSelected.emit(chatId);
  }

  onChatSelected(name: string) {
    // Updates the title when a chat is selected
    this.titel = name;
  }

  createChat(): void {
    // Creates a new chat
    this.chatSelected.emit('n');
    this.selectedChat = null;
    this.sharedService.sendData<string>('createChat', 'createChat');
  }

  handleChatClick(chat: ChatDto): void {
    // Handles the click on a chat (selecting and displaying it)
    this.selectChat(chat.chatId);
    this.onChatSelected(chat.chatTitel);
    this.selectedChat = chat;
    this.hoveredChatId = chat.chatId;
  }

  onActionMenuClick(event: MouseEvent, chat: ChatDto): void {
    // Opens the action menu for a chat
    event.stopPropagation();
    this.actionMenuChatId = chat.chatId;
  }

  handleMouseEnter(chatId: string): void {
    // Sets the hovered chat ID when mouse enters a chat
    this.hoveredChatId = chatId;
  }

  handleMouseLeave(chatId: string): void {
    // Removes the hovered chat ID when mouse leaves the chat (if not in action menu)
    if (this.actionMenuChatId !== chatId) {
      this.hoveredChatId = null;
    }
  }

  handleMenuMouseEnter(chatId: string): void {
    // Sets the hovered chat ID when mouse enters the menu
    this.hoveredChatId = chatId;
  }

  handleMenuMouseLeave(chatId: string): void {
    // Removes the hovered chat ID when mouse leaves the menu
    if (this.hoveredChatId === chatId) {
      this.hoveredChatId = null;
    }
  }

  deleteChat(chatId: string): void {
    // Deletes the selected chat
    this.chatService.deleteChat(chatId).subscribe({
      next: () => {
        this.actionMenuChatId = null;
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

        if (this.selectedChat?.chatId !== chatId) {
          return;
        }
        const chat = this.chatDtos.find(chat => chat.chatId === chatId);
        if (chat === this.chatDtos[0]) {
          this.createChat(); // Create a new chat if the deleted chat was the first
          return;
        }
        if (this.selectedChat?.chatId === chatId) {
          this.chatSelected.emit('n');
          this.selectedChat = null;
          return;
        }
      },
      error: (error) => {
        console.error('Error deleting chat:', error);
      },
    });
  }

  archiveChat(chatId: string): void {
    // Archives the selected chat (log action)
    console.log(`Archive chat with ID: ${chatId}`);
    this.actionMenuChatId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Closes the action menu if clicked outside
    this.actionMenuChatId = null;
  }
}
