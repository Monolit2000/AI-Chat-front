export interface ChatDto {
    chatId: string;
    chatTitel: string;
    createdDate: string; // Используем строку для даты, так как JSON передаёт её в формате ISO.
  }