import { Subscription } from 'rxjs';
import { ChatDto } from './chat-dto';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { ChatTitelDto } from './chat-titel-dto';
import { SharedService } from '../services/shared.service';
import { ChatResponse } from '../chat/chat-response.model';
import { ChatService } from '../services/chat-service.service';
import { ChatWithChatResponseDto } from './chat-with-chat-response-dto';
import { Component, Input, SimpleChanges, Output, ElementRef, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
 
  loading = false; // Indicates if data is being loaded
  chatId = ''; // Default chat ID
  promptText = ''; // Text prompt input from the user
  test = true; // Test mode flag
  responses: ChatResponse[] = []; // Store chat responses
  selectedFile: File | null = null; // Selected file (if any) for upload
  currentSubscription: Subscription | null = null; // Current active subscription for chat streaming
  testMoode = 'Generate text'; // Mode for generating text
  aIMoode = 'AI chat'; // Mode for AI chat interaction
  currentResponseHandle = false; // Flag to handle current response state
  index: number = -1; // Index of the current response

  currentMode: string = this.testMoode; // Default mode on initial load
 
  generationLoading = false; // Indicates if generation is in progress

  constructor(
    private chatService: ChatService,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef) {}

  @Input() currentChatId: string | null = null; // Current chat ID from parent component

  @Output() chatCreated = new EventEmitter<ChatDto>(); // Event emitter for chat creation

  @ViewChild('responseContainer') responseContainer!: ElementRef; // Reference to the response container element

  // Method to set the mode (AI or test)
  setMode(mode: string): void {
    this.currentMode = mode;
  }

  // Initialization logic
  ngOnInit(): void {
    this.sharedService.getData<string>('createChat').subscribe((data)  => {
      this.responses = []; // Clear previous responses
      this.loading = false; // Reset loading state
      return;
    })
  }

  // Scroll the chat to the bottom to show the latest response
  private scrollToBottom(delay: number = 0) {
    try {
      setTimeout(() => {
        this.responseContainer.nativeElement.scrollTo({
          top: this.responseContainer.nativeElement.scrollHeight,
          behavior: 'smooth',
        });
      }, delay);
    } catch (err) {
      console.error('Error while scrolling:', err); // Handle potential scroll errors
    }
  }

  // Handle changes in input (e.g., change in chat ID)
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChatId'] && changes['currentChatId'].currentValue) {
      console.log('Chat ID changed to:', changes['currentChatId'].currentValue);
      this.loading = true;
      this.chatId = changes['currentChatId'].currentValue;

      // Reset responses if chat ID is 'n'
      if (this.chatId === 'n') {
        this.responses = [];
        this.loading = false;
        return;
      }

      // Fetch chat responses for the new chat ID
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

  // Cancel ongoing chat response streaming
  cancelChatResponse() {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
      console.log('Streaming canceled');
      this.generationLoading = false;
    } else {
      console.log('Streaming canceled');
      this.generationLoading = false;
    }
  }

  // Create a chat and handle the response with or without a file
  createChatWithChatResponse() {
    if (this.selectedFile) 
        this.loading = true;
        let prompt = this.currentMode !== this.testMoode ? '@' + this.promptText.trim() : this.promptText;
        this.promptText = '';
        this.generationLoading = true;
        this.currentSubscription = this.chatService.createStreamingChatWithChatResponse(prompt, this.selectedFile).subscribe({
          next: (response: ChatWithChatResponseDto) => {
            console.log('Audio prompt sent successfully', response);
            this.chatId = response.chatDto.chatId;

            let chatResponse: ChatResponse = {
              chatId: response.chatDto.chatId,
              prompt: response.prompt,
              conetent: response.conetent
            }

            // Handle new response based on whether it's the first or a continued stream
            if (this.currentResponseHandle === false) {
              this.responses.push(chatResponse);
              this.index = this.responses.findIndex(r => r === chatResponse);
              this.currentResponseHandle = true;
              this.scrollToBottom();

              this.sharedService.sendObject(response.chatDto);
              this.geneareteChatTitel(response.chatDto.chatId, response.prompt);
            } else {
              if (this.index !== -1) {
                this.responses[this.index].conetent += response.conetent;
              }
            }
            this.cdr.detectChanges(); // Detect change after response update
            this.selectedFile = null; // Reset selected file
            this.loading = false;
            this.scrollToBottom();
          },
          error: (error) => {
            console.error('Error during the HTTP request:', error);
            this.loading = false;
            this.generationLoading = false;
            this.cdr.detectChanges();
          },
          complete: () => {
            console.log('Streaming complete');
            this.generationLoading = false; // End loading indication
            this.cdr.detectChanges();
          }
      });
      this.currentResponseHandle = false;
  }

  // Handle text input submission
  onTextSubmit() {
    if (this.promptText.trim()) {
      let prompt = this.currentMode !== this.testMoode ? '@' + this.promptText.trim() : this.promptText;
      this.promptText = '';
      this.generationLoading = true;

      // Start streaming chat responses
      this.currentSubscription = this.chatService.streamChatResponses(this.chatId, prompt).subscribe({
        next: (response: ChatResponse) => {
          this.hendleStreameResponce(response); // Handle incoming response
        },
        error: (error) => {
          this.generationLoading = false;
          this.cdr.detectChanges();
          console.error('Error:', error);
        },

        complete: () => { 
          console.log('Streaming complete');
          this.generationLoading = false; // End loading indication
          this.cdr.detectChanges();
        }
     });
    }
    this.currentResponseHandle = false;
  }

  // Handle streamed responses and update chat content
  hendleStreameResponce(response: ChatResponse) {
    if (this.currentResponseHandle === false) {
      this.responses.push(response);
      this.index = this.responses.findIndex(r => r === response);
      this.currentResponseHandle = true;
      this.scrollToBottom();
    } else {
      if (this.index !== -1) {
        this.responses[this.index].conetent += response.conetent;
        this.generationLoading = true;
      }
    }
    this.cdr.detectChanges();
  }

  // Generate the title for the chat and send it
  geneareteChatTitel(chatId: string, prompt: string) {
    this.chatService.geneareteChatTitel(chatId, prompt).subscribe(
      (chatTitelDto: ChatTitelDto) => {
        this.sharedService.sendData<ChatTitelDto>('ChatTitelDto', chatTitelDto);
      },
      (error) => {
        console.error('GeneareteChatTitel:', error);
      }
    );
  }

  // Handle file selection for audio or other purposes
  onFileSelected(event: any) {
    if (this.selectedFile !== null) {
      this.selectedFile = null;
    } else {
      this.selectedFile = event.target.files[0];
    }
  }

  // Handle audio submission (either new or continued response)
  onAudioSubmit() {
    if (this.responses.length === 0) {
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
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error during the HTTP request:', error);
          this.loading = false;
        }
      });
    } else if (this.selectedFile === null && this.promptText !== '') {
      this.onTextSubmit(); // Submit text if no file is selected
    }
  }
}
