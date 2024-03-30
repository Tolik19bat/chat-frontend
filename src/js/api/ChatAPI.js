// Импорт функции createRequest из модуля "./createRequest"
import createRequest from "./createRequest";

// Константа HOST, содержащая базовый URL для API чата
const HOST = "https://chat-backend-fwga.onrender.com";

// Экспорт класса ChatAPI для использования в других модулях
export default class ChatAPI {
  // Метод create, отправляющий запрос на создание нового пользователя
  create(userName, callback) {
    createRequest({
      requestMethod: "POST", // Метод запроса
      url: "new-user", // URL для создания нового пользователя
      host: HOST, // Базовый URL для API
      callback, // Функция обратного вызова для обработки ответа от сервера
      body: { name: userName }, // Тело запроса, содержащее имя нового пользователя
    });
  }

  // Метод start, инициализирующий соединение WebSocket для получения сообщений из чата
  start(callback) {
    // Создание нового WebSocket соединения с сервером чата
    this.ws = new WebSocket("wss://chat-backend-v5ut.onrender.com/ws");

    // Добавление слушателя события "message" для обработки полученных сообщений
    this.ws.addEventListener("message", (e) => {
      // Парсинг полученных данных в формате JSON
      const data = JSON.parse(e.data);
      // Вызов функции обратного вызова для обработки полученных данных
      callback(data);
    });
  }

  // Метод send, отправляющий сообщение в чат
  send(message) {
    // Проверка наличия сообщения
    if (!message) {
      return;
    }

    // Преобразование сообщения в формат JSON
    const jsonMessage = JSON.stringify({
      type: "send", // Тип сообщения (отправка)
      text: message.text, // Текст сообщения
      name: message.name, // Имя отправителя сообщения
      date: message.date, // Дата отправки сообщения
    });

    // Отправка сообщения через WebSocket соединение
    this.ws.send(jsonMessage);
  }

  // Метод close, отправляющий запрос на отключение от чата и закрывающий WebSocket соединение
  close(userName) {
    // Преобразование информации о закрытии в формат JSON
    const jsonMessage = JSON.stringify({
      user: {
        name: userName, // Имя пользователя, который закрывает соединение
      },
      type: "exit", // Тип сообщения (выход из чата)
    });

    // Проверка наличия WebSocket соединения
    if (this.ws) {
      // Отправка сообщения о выходе из чата
      this.ws.send(jsonMessage);
      // Закрытие WebSocket соединения
      this.ws.close();
    }
  }
}
