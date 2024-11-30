import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, Output, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { ChatService } from '../services/chat-service.service';
import { FormsModule } from '@angular/forms'; 
import { ChatResponse } from '../chat/chat-response.model';
import { ChatWithChatResponseDto } from './chat-with-chat-response-dto';
import { ChatDto } from './chat-dto';
import { SharedService } from '../services/shared.service';

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
  test = true;
  responses:  ChatResponse[] = []; 
  selectedFile: File | null = null;

  constructor(
    private chatService: ChatService,
    private sharedService: SharedService) {}

  @Input() currentChatId: string | null = null;

  @Output() chatCreated = new EventEmitter<ChatDto>();
  
  

  // container = document.getElementById('responseContainer');

  @ViewChild('responseContainer') responseContainer!: ElementRef;

  private shouldScroll = false;

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

      if(this.chatId === 'n'){
        this.responses = [];
        this.loading = false;
        return;
      }

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

  createChatWithChatResponse(){
    if (this.selectedFile) 
        this.loading = true;
        this.chatService.createChatWithResponceChat(this.promptText, this.selectedFile).subscribe({
        next: (response: ChatWithChatResponseDto) => {
          console.log('Audio prompt sent successfully', response);
          this.chatId = response.chatDto.chatId;

          let chatResponse: ChatResponse ={
            chatId : response.chatDto.chatId,
            prompt: response.prompt,
            conetent : response.conetent
          }

          this.responses.push(chatResponse); 

          
          //Test
          this.sharedService.sendObject(response.chatDto)

          // this.chatCreated.emit(response.chatDto);
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

    if(this.responses.length === 0){
      this.createChatWithChatResponse();
      return;
    }

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



