# AI Chat front

## Overview

This project is a chat application that allows users to create, view, and interact with multiple chat conversations. It includes features such as chat creation, text and audio responses, real-time chat streaming, chat title editing, and deletion. The application also supports viewing all chats in a list with options to select, edit, or delete a chat. The system integrates with various services for managing and processing chat data.

## Features

### 1. **Chat Component**
* **Real-time Chat Responses**: The `ChatComponent` allows users to interact with AI chat or generate text responses. It supports both text and file-based prompts (e.g., audio).
* **Streaming Responses**: The chat responses can be streamed live and displayed as they are received.
* **Generation Mode**: Supports different modes for generating chat responses, such as 'Test Mode' and 'AI Chat'.
* **File Upload**: Users can upload files (such as audio) along with their prompt, which is sent to the backend for processing.

### 2. **Chat List Component**
* **Chat Management**: View a list of all chats and interact with individual chat conversations.
* **Chat Selection**: Users can select a chat to view its responses and details.
* **Chat Editing**: Chats can be renamed, and users can edit the chat title directly in the interface.
* **Chat Deletion**: Chats can be deleted with an animation delay to indicate deletion progress.
* **Chat Creation**: New chats can be created, either empty or populated with predefined chat data.

### 3. **Shared Service**
* **Data Sharing**: Shared service is used to pass data between components, such as chat creation and title updates.
* **Real-time Updates**: It subscribes to data streams for real-time updates like new chat creation or changes in the chat title.

## Project Setup

### Prerequisites

* Node.js
* Angular
* TypeScript
* RxJS

### How to Run

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Install dependencies:

    ```bash
    cd <project-folder>
    npm install
    ```

3. Start the Angular development server:

    ```bash
    ng serve
    ```

4. Navigate to `http://localhost:4200` in your browser to access the application.

## Component Breakdown

### `ChatComponent`

* **Purpose**: Handles individual chat sessions, including generating responses and uploading files.
* **Key Methods**:
    * `ngOnInit()`: Initializes the component and listens for data from the `SharedService`.
    * `setMode(mode: string)`: Switches between different response modes (e.g., AI chat or test mode).
    * `createChatWithChatResponse()`: Initiates chat creation and response generation, handling file uploads if necessary.
    * `cancelChatResponse()`: Cancels ongoing chat response streaming.
    * `onTextSubmit()`: Handles text input submission and streams responses.
    * `onFileSelected()`: Handles file selection for prompts.
    * `onAudioSubmit()`: Sends an audio prompt along with text input.

### `ChatListComponent`

* **Purpose**: Displays a list of available chats and allows the user to manage them (select, delete, edit).
* **Key Methods**:
    * `loadChats()`: Loads and displays all chats from the backend.
    * `selectChat(chatId: string)`: Selects a chat and displays its responses.
    * `startEditing(chatId: string)`: Initiates the edit mode for a chat title.
    * `deleteChat(chatId: string)`: Deletes a selected chat.
    * `createChat()`: Creates a new empty chat.
    * `handleChatClick(chat: ChatDto)`: Handles clicks on individual chats and updates the UI.

## Services

### `ChatService`
* **Purpose**: Provides methods for interacting with chat-related data on the backend (e.g., creating, retrieving, and deleting chats).
* **Key Methods**:
    * `getAllChats()`: Fetches all available chats.
    * `getAllChatResponsesByChatId(chatId: string)`: Fetches all responses for a specific chat.
    * `streamChatResponses(chatId: string, prompt: string)`: Streams chat responses based on the provided prompt.
    * `createStreamingChatWithChatResponse()`: Creates a new chat and starts streaming chat responses with a prompt.
    * `sendAudioPrompt()`: Sends an audio prompt to the backend.
    * `renameChat()`: Renames an existing chat.
    * `deleteChat()`: Deletes a specific chat.

### `SharedService`
* **Purpose**: Facilitates the communication of data between components, such as notifying about new chats or updates to chat titles.
* **Key Methods**:
    * `getData<T>()`: Retrieves data of type `T` from the shared service.
    * `sendData<T>()`: Sends data of type `T` to other components.

## Styles

The application uses SCSS and Tailwind CSS for styling. 


