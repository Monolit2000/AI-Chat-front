import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ChatResponse } from '../chat/chat-response.model';
import { ChatDto } from '../chat/chat-dto';
import { ChatWithChatResponseDto } from '../chat/chat-with-chat-response-dto';
import { ChatTitelDto } from '../chat/chat-titel-dto';
import { EventSourcePolyfill } from 'event-source-polyfill';

@Injectable({
  providedIn: 'root' 
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/AudioProcessing'; 

  constructor(private http: HttpClient) {}

  // Method for streaming chat responses using Server-Sent Events (SSE)
  streamChatResponses(chatId: string, promt: string): Observable<ChatResponse> {
    return new Observable<ChatResponse>((observer) => {
      const eventSource = new EventSource(`${this.apiUrl}/createStreamingChatResponseOnText?chatId=${encodeURIComponent(chatId)}&promt=${encodeURIComponent(promt)}`);

      eventSource.onmessage = (event) => {
        const chat: ChatResponse = JSON.parse(event.data); 
        observer.next(chat); // Send data to the subscriber
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        observer.error(error); // Notify about the error
      };

      // Return a function to close the connection
      return () => {
        eventSource.close();
        console.log('EventSource connection closed');
      };
    });
  }

  // Method for streaming chat responses via POST request and SSE
  streamChatResponsesPost<T>(url: string, formData: FormData): Observable<T> {
    return new Observable<T>((observer) => {
      const controller = new AbortController(); // For managing the request (e.g., cancellation)
      const signal = controller.signal;
  
      // Send POST request
      fetch(url, {
        method: 'POST',
        body: formData,
        signal,
        headers: {
          'Accept': 'text/event-stream',
        },
      })
        .then((response) => {
          if (!response.body) {
            throw new Error('ReadableStream not supported!');
          }
  
          // Read the data stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
  
          // Function to process the data from the stream
          const read = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                observer.complete(); // Complete the Observable when the stream finishes
                return;
              }
  
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n\n'); // Split events by SSE protocol
  
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const json = line.replace('data:', '').trim();
                  const data: T = JSON.parse(json); // Parse the data
                  observer.next(data); // Send data to the subscriber
                }
              }
  
              read(); // Continue reading the next chunk
            }).catch((error) => observer.error(error));
          };
  
          read(); // Start reading
        })
        .catch((error) => observer.error(error));
  
      // Return a function to abort the request
      return () => {
        controller.abort();
        console.log('SSE POST connection aborted');
      };
    });
  }

  // Creates a streaming chat response with additional chat response data
  createStreamingChatWithChatResponse(prompt: string, audioFile: File | null = null): Observable<ChatWithChatResponseDto> {
    const formData = new FormData();
    formData.append('promt', prompt);
    if (audioFile) {
      formData.append('audioFile', audioFile);
    }
  
    const url = `${this.apiUrl}/createStreamingChatWithChatResponse`;
  
    return this.streamChatResponsesPost<ChatWithChatResponseDto>(url, formData);
  }

   /**
   * Generic method for streaming data through SSE with different endpoints.
   * @param endpoint - Relative path to the SSE endpoint
   * @returns Observable<T> - Data stream of the specified type
   */
   streamChatResponsesGeneric<T>(endpoint: string): Observable<T> {
    return new Observable<T>((observer) => {
      const eventSource = new EventSource(`${this.apiUrl}/${endpoint}`);

      eventSource.onmessage = (event) => {
        const data: T = JSON.parse(event.data); // Parse the data as the specified type
        observer.next(data);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        observer.error(error);
      };

      // Function to close the connection
      return () => {
        eventSource.close();
        console.log('EventSource connection closed');
      };
    });
  }

  // Method to send a text prompt and receive a chat response
  sendTextPrompt(chatId: string, promt: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/createChatResponseOnText`, { chatId: chatId ,promt: promt });
  }

  // Method to rename a chat
  renameChat(chatId: string, newChatTitel: string){
    return this.http.post<ChatResponse>(`${this.apiUrl}/renameChat`, { chatId: chatId ,newChatTitel: newChatTitel });
  }

  // Method to generate a chat title
  geneareteChatTitel(chatId: string, prompt: string):Observable<ChatTitelDto> {
    return this.http.post<ChatTitelDto>(`${this.apiUrl}/geneareteChatTitel`, { chatId: chatId ,prompt: prompt });
  }

  // Method to send an audio prompt and receive a chat response
  sendAudioPrompt(chatId: string, file: File, prompt: string): Observable<ChatResponse> {
    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('chatId', chatId);
    formData.append('promt', prompt );

    return this.http.post<ChatResponse>(`${this.apiUrl}/createTrancription`, formData)
    .pipe(
      catchError((error) => {
        console.error('Error during the HTTP request:', error);
        return throwError(error);
      })
    )
  }

  // Method to create a chat and get a response chat
  createChatWithResponceChat(prompt: string, file: File | null = null): Observable<ChatWithChatResponseDto> {
    const formData = new FormData();
    if(file !== null){
      formData.append('audioFile', file);
    }
    formData.append('promt', prompt );

    return this.http.post<ChatWithChatResponseDto>(`${this.apiUrl}/createChatWithChatResponse`, formData)
    .pipe(
      catchError((error) => {
        console.error('Error during the HTTP request:', error);
        return throwError(error);
      })
    )
  }

  // Method to delete a chat by chat ID
  deleteChat(chatId: string) {
    return this.http.post(`${this.apiUrl}/deleteChat`, {chatId: chatId})
      .pipe(
        catchError((error) => {
          console.error('Error during creating a new chat:', error);
          return throwError(error);
        })
      );
  }

  // Method to create a new chat
  createNewChat(): Observable<ChatDto> {
    return this.http.post<ChatDto>(`${this.apiUrl}/createNewChat`, {})
      .pipe(
        catchError((error) => {
          console.error('Error during creating a new chat:', error);
          return throwError(error);
        })
      );
  }

  // Method to create a new chat with a response
  createNewWithResponceChat(chatId: string, file: File, prompt: string ): Observable<ChatDto> {
    return this.http.post<ChatDto>(`${this.apiUrl}/createNewChat`, {})
      .pipe(
        catchError((error) => {
          console.error('Error during creating a new chat:', error);
          return throwError(error);
        })
      );
  }

  // Method to get all chats
  getAllChats(): Observable<ChatDto[]> {
    return this.http.get<ChatDto[]>(`${this.apiUrl}/GetAllChats`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching chats:', error);
          return throwError(error);
        })
      );
  }

  // Method to get all chat responses
  getAllChatResponses(): Observable<ChatDto[]> {
    return this.http.get<ChatDto[]>(`${this.apiUrl}/GetAllChats`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching chats:', error);
          return throwError(error);
        })
      );
  }

  // Method to get chat responses by chat ID
  getAllChatResponsesByChatId(chatId: string): Observable<ChatResponse[]> {
    return this.http.get<ChatResponse[]>(`${this.apiUrl}/getAllChatResponsesByChatId/${chatId}`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching chat responses:', error);
          return throwError(error);
        })
      );
  }
}
