import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ChatResponse } from '../chat/chat-response.model';
import { ChatDto } from '../chat/chat-dto';

@Injectable({
  providedIn: 'root' 
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/AudioProcessing'; 

  constructor(private http: HttpClient) {}

  sendTextPrompt(chatId: string, prompt: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/text`, { chatId, prompt });
  }

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

  createNewChat(): Observable<ChatDto> {
    return this.http.post<ChatDto>(`${this.apiUrl}/createNewChat`, {})
      .pipe(
        catchError((error) => {
          console.error('Error during creating a new chat:', error);
          return throwError(error);
        })
      );
  }

  getAllChats(): Observable<ChatDto[]> {
    return this.http.get<ChatDto[]>(`${this.apiUrl}/GetAllChats`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching chats:', error);
          return throwError(error);
        })
      );
  }

  getAllChatResponses(): Observable<ChatDto[]> {
    return this.http.get<ChatDto[]>(`${this.apiUrl}/GetAllChats`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching chats:', error);
          return throwError(error);
        })
      );
  }

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







// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { ChatResponse } from '../chat/chat-response.model';
// import { catchError } from 'rxjs/operators';
// import { throwError } from 'rxjs';

// @Injectable({
//   providedIn: 'root' 
// })
// export class ChatService {
//   private apiUrl = 'http://localhost:5000/AudioProcessing'; 

//   constructor(private http: HttpClient) {}

//   sendTextPrompt(chatId: string, prompt: string): Observable<ChatResponse> {
//     return this.http.post<ChatResponse>(`${this.apiUrl}/text`, { chatId, prompt });
//   }

//   sendAudioPrompt(chatId: string, file: File, prompt: string): Observable<ChatResponse> {
//     const formData = new FormData();
//     formData.append('audioFile', file);
//     // formData.append('chatId', chatId);
//     // formData.append('prompt', prompt);

//     return this.http.post<ChatResponse>(`${this.apiUrl}/CreateChatWithTranscription`, formData)
//     .pipe(
//       catchError((error) => {
//         console.error('Error during the HTTP request:', error);
//         return throwError(error);
//       })
//     )
//   }

//   createNewChat(): Observable<any> {
//     return this.http.post(`${this.apiUrl}/CreateChat`, {})
//       .pipe(
//         catchError((error) => {
//           console.error('Error during creating a new chat:', error);
//           return throwError(error);
//         })
//       );
//   }
// }