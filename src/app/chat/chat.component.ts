import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { FormsModule } from '@angular/forms'; 
import { ChatResponse } from '../chat/chat-response.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {


 

  loading = false;
  chatId = 'your-chat-id'; 
  promptText = '';
  responses:  ChatResponse[] = []; 
  selectedFile: File | null = null;

  constructor(private chatService: ChatService) {}

  @Input() currentChatId: string | null = null;

  // container = document.getElementById('responseContainer');

  @ViewChild('responseContainer') responseContainer!: ElementRef;

  private shouldScroll = false;

  onChatSelected(chatId: string) {
    this.currentChatId = chatId;
  }


  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['currentChatId'] && changes['currentChatId'].currentValue) {
  //     console.log('Chat ID changed to:', changes['currentChatId'].currentValue);
     
  //   }
  // }


  // private scrollToBottom() {
  //   try {
  //     this.responseContainer.nativeElement.scrollTo({
  //       top: this.responseContainer.nativeElement.scrollHeight,
  //       behavior: 'smooth',
  //     });
  //   } catch (err) {
  //     console.error('Error while scrolling:', err);
  //   }
  // }

  private scrollToBottom(delay: number = 0) {
    try {
      // Устанавливаем таймер (если delay > 0)
      setTimeout(() => {
        this.responseContainer.nativeElement.scrollTo({
          top: this.responseContainer.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }, delay);
    } catch (err) {
      console.error('Error while scrolling:', err);
    }
  }
  


  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChatId'] && changes['currentChatId'].currentValue) {
      console.log('Chat ID changed to:', changes['currentChatId'].currentValue);
      this.loading = true;
      this.chatId = changes['currentChatId'].currentValue;
      this.chatService.getAllChatResponsesByChatId(this.currentChatId!).subscribe({
        next: (responses: ChatResponse[]) => {
          this.responses = responses; 
          this.loading = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error fetching chat responses:', error);
          this.loading = false;
        }
      });
    }
  }


  onTextSubmit() {
    if (this.promptText.trim()) {
      this.chatService.sendTextPrompt(this.chatId, this.promptText).subscribe(
        (response: ChatResponse) => {
          this.responses.push(response);
          this.promptText = '';
        },
        (error) => console.error('Error:', error)
      );
    }
  }

  onFileSelected(event: any) {
    if(this.selectedFile !== null){
      this.selectedFile = null
    }
    else{
      this.selectedFile = event.target.files[0];
    }
  }

  onAudioSubmit() {
    if (this.selectedFile) {
        this.loading = true;
        this.chatService.sendAudioPrompt(this.chatId, this.selectedFile, this.promptText).subscribe({

        next: (response: ChatResponse) => {
          console.log('Audio prompt sent successfully', response);
          this.responses.push(response); 
          this.selectedFile = null;
          this.loading = false;
          this.promptText = '';
          this.scrollToBottom()
        },
        error: (error) => {
          console.error('Error during the HTTP request:', error);
          this.loading = false;
        }
      });
    }
    else if(this.selectedFile === null && this.promptText !== ''){
      this.onTextSubmit();
      this.scrollToBottom();
      this.scrollToBottom(300);
    }
  }

}



