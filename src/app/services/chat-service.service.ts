import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ChatResponse } from '../chat/chat-response.model';
import { ChatDto } from '../chat/chat-dto';
import { ChatWithChatResponseDto } from '../chat/chat-with-chat-response-dto';
import { ChatTitelDto } from '../chat/chat-titel-dto';

@Injectable({
  providedIn: 'root' 
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/AudioProcessing'; 

  constructor(private http: HttpClient) {}



  // Метод для стриминга через SSE
  streamChatResponses(chatId: string, promt: string): Observable<ChatResponse> {
    // const url = `${this.apiUrl}/createStreamingChatResponseOnText?chatId=${encodeURIComponent(chatId)}&promt=${encodeURIComponent(promt)}`;
    return new Observable<ChatResponse>((observer) => {
      const eventSource = new EventSource(`${this.apiUrl}/createStreamingChatResponseOnText?chatId=${encodeURIComponent(chatId)}&promt=${encodeURIComponent(promt)}`);

      eventSource.onmessage = (event) => {
        const chat: ChatResponse = JSON.parse(event.data); 
        observer.next(chat); // Отправляем данные подписчику
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        observer.error(error); // Уведомляем об ошибке
      };

      // Возвращаем функцию для закрытия соединения
      return () => {
        eventSource.close();
        console.log('EventSource connection closed');
      };
    });
  }

   /**
   * Универсальный метод для стриминга данных через SSE.
   * @param endpoint - Относительный путь к SSE-эндпоинту
   * @returns Observable<T> - Поток данных указанного типа
   */
   streamChatResponsesGeneric<T>(endpoint: string): Observable<T> {
    return new Observable<T>((observer) => {
      const eventSource = new EventSource(`${this.apiUrl}/${endpoint}`);

      eventSource.onmessage = (event) => {
        const data: T = JSON.parse(event.data); // Парсим данные как указанный тип
        observer.next(data);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        observer.error(error);
      };

      // Функция для завершения соединения
      return () => {
        eventSource.close();
        console.log('EventSource connection closed');
      };
    });
  }




  sendTextPrompt(chatId: string, promt: string): Observable<ChatResponse> {

    return this.http.post<ChatResponse>(`${this.apiUrl}/createChatResponseOnText`, { chatId: chatId ,promt: promt });
  }

  renameChat(chatId: string, newChatTitel: string){

    return this.http.post<ChatResponse>(`${this.apiUrl}/renameChat`, { chatId: chatId ,newChatTitel: newChatTitel });
  }


  geneareteChatTitel(chatId: string, prompt: string):Observable<ChatTitelDto>{

    return this.http.post<ChatTitelDto>(`${this.apiUrl}/geneareteChatTitel`, { chatId: chatId ,prompt: prompt });
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


  
  deleteChat(chatId: string) {
    return this.http.post(`${this.apiUrl}/deleteChat`, {chatId: chatId})
      .pipe(
        catchError((error) => {
          console.error('Error during creating a new chat:', error);
          return throwError(error);
        })
      );
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







  createNewWithResponceChat(chatId: string, file: File, prompt: string ): Observable<ChatDto> {
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