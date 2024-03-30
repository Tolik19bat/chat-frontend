// Импортируем модуль ChatAPI из файла "./api/ChatAPI"
import ChatAPI from "./api/ChatAPI";

// Экспортируем класс Chat
export default class Chat {
  constructor(container) {
    // Устанавливаем контейнер, в который будет встроен чат
    this.container = container;
    // Создаем экземпляр класса ChatAPI для работы с чатом по API
    this.api = new ChatAPI();
    // Устанавливаем websocket в null, будем использовать его для связи с сервером
    this.websocket = null;
    // Изначально данные не загружены
    this.dataLoaded = false;
  }

  // Метод инициализации чата
  init() {
    // Привязываем элементы к DOM
    this.bindToDOM();
    // Рендерим модальное окно для входа в чат
    this.renderModalForm();
  }

  // Привязываем элементы к DOM
  bindToDOM() {
    // Находим элементы модальной формы и привязываем обработчики событий
    // для входа в чат и фокуса на поле ввода
    this.modalFormEl = this.container.querySelector(".modal__form");
    this.modalFormGroupEl = this.container.querySelector(".modal__form_group");
    this.modalWarningEl = this.container.querySelector(".modal__warning");
    this.onEnterChatHandler = this.onEnterChatHandler.bind(this);
    this.modalFormGroupEl.addEventListener("submit", this.onEnterChatHandler);
    this.modalInputEl = this.container.querySelector(".modal__input");
    this.onFocusModalInputEl = this.onFocusModalInputEl.bind(this);
    this.modalInputEl.addEventListener("focus", this.onFocusModalInputEl);
    // Находим и привязываем обработчик события для кнопки отключения от чата
    this.btnChatDisconnectEl =
      this.container.querySelector(".chat__disconnect");
    this.closeChat = this.closeChat.bind(this);
    this.btnChatDisconnectEl.addEventListener("click", this.closeChat);
    // Находим элементы списка пользователей и контейнер сообщений чата
    this.chatUserListEl = this.container.querySelector(".chat__userlist");
    this.chatMessageContainerEl = this.container.querySelector(
      ".chat__messages-container"
    );
    // Находим форму для отправки сообщений и привязываем обработчик события для отправки сообщения
    this.chatMessageFormEl = this.container.querySelector(
      ".chat__messages-form"
    );
    this.sendMessage = this.sendMessage.bind(this);
    this.chatMessageFormEl.addEventListener("submit", this.sendMessage);
    // Находим поле ввода сообщения
    this.chatMessageInputEl = this.container.querySelector(
      ".chat__messages-input"
    );

    // Получаем ссылку на элемент <span>
    this.infoHintElement = this.container.querySelector("#info-hint");

    // Состояние кнопки отправки сообщения
    this.sendMessageButton = this.container.querySelector(
      ".send-message-button"
    );
  }

  // Рендерит модальное окно для входа в чат
  renderModalForm() {
    this.modalFormEl.classList.add("active");
  }

  // Скрывает модальное окно для входа в чат
  hideModalForm() {
    this.modalFormEl.classList.remove("active");
  }

  // Обработчик события для входа в чат
  onEnterChatHandler(e) {
    e.preventDefault();
    // Скрываем модальное окно для входа в чат
    this.hideModalForm();
    // Получаем имя пользователя из поля ввода
    this.userName = this.modalInputEl.value;
    // Вызываем метод create API для создания пользователя и передаем обратный вызов
    this.api.create(this.userName, (res) => {
      // Если ответ не "ok", рендерим предупреждение
      if (res.status !== "ok") {
        this.renderWarning();
        return;
      }
      // Запускаем чат после успешного создания пользователя
      this.startChat();
    });
  }

  // Запускает чат
  startChat() {
    // Запускаем чат через API и передаем обратный вызов для обработки данных
    this.api.start((data) => {
      // Если данные представляют собой массив, рендерим список пользователей, иначе рендерим сообщение
      if (Array.isArray(data)) {
        this.renderUserList(data);
      } else {
        this.renderMessage(data);
      }
      // Вызываем метод для обработки успешной загрузки данных
      this.onDataLoaded();
      // Обновляем состояние кнопки отправки сообщения после загрузки данных
      this.updateSendMessageButtonState();
    });
  }

  // Рендерит список пользователей
  renderUserList(data) {
    // Очищаем список пользователей
    this.chatUserListEl.innerHTML = "";
    // Для каждого пользователя в данных создаем элемент списка и добавляем его в DOM
    data.forEach((el) => {
      const chatUserEl = document.createElement("div");
      chatUserEl.classList.add("chat__user");
      // Если имя пользователя совпадает с текущим пользователем, пишем "You", иначе имя пользователя
      chatUserEl.textContent = el.name === this.userName ? "You" : el.name;
      chatUserEl.id = el.id;
      this.chatUserListEl.insertAdjacentElement("afterbegin", chatUserEl);
    });
  }

  // Обработчик события фокуса на поле ввода
  onFocusModalInputEl() {
    // Скрываем предупреждение
    this.modalWarningEl.classList.add("hidden");
    // Очищаем поле ввода
    this.modalInputEl.value = "";
  }

  // Рендерит предупреждение
  renderWarning() {
    this.modalWarningEl.classList.remove("hidden");
    this.renderModalForm();
  }

  // Отправляет сообщение
  sendMessage(e) {
    e.preventDefault();
    // Получаем текст сообщения из поля ввода
    const message = this.chatMessageInputEl.value;
    // Отправляем сообщение через API
    this.api.send({
      text: message,
      name: this.userName,
      date: Date.now(),
    });
    // Очищаем поле ввода сообщения
    this.chatMessageInputEl.value = "";
  }

  // Рендерит сообщение
  renderMessage(data) {
    // Создаем контейнер сообщения
    const messageContainerEl = document.createElement("div");
    messageContainerEl.classList.add("message__container");
    // Создаем заголовок сообщения
    const messageHeader = document.createElement("h4");
    messageHeader.classList.add("message__header");
    // Форматируем дату сообщения
    const date =
      new Date(data.date).toLocaleTimeString().slice(0, -3) +
      " " +
      new Date(data.date).toLocaleDateString();
    // Если отправитель сообщения - текущий пользователь, добавляем в заголовок "You", иначе имя отправителя
    if (data.name === this.userName) {
      messageContainerEl.classList.add("message__container-yourself");
      messageHeader.textContent = "You, " + date;
    } else {
      messageContainerEl.classList.add("message__container-interlocutor");
      messageHeader.textContent = data.name + ", " + date;
    }
    // Добавляем заголовок и текст сообщения в контейнер сообщения и вставляем его в DOM
    messageContainerEl.insertAdjacentElement("beforeend", messageHeader);
    const messageText = document.createElement("div");
    messageText.classList.add("message__text");
    messageText.textContent = data.text;
    messageContainerEl.appendChild(messageText);
    // Добавляем контейнер сообщения в конец контейнера сообщений
    this.chatMessageContainerEl.appendChild(messageContainerEl);
  }

  // Закрывает чат
  closeChat() {
    // Вызываем метод close API для закрытия чата пользователя
    this.api.close(this.userName);
    // Удаляем пользователя из списка пользователей
    const userElementToRemove = this.chatUserListEl.querySelector(
      `#user_${this.userName}`
    );
    if (userElementToRemove) {
      userElementToRemove.remove();
    }
    // Рендерим модальное окно для входа в чат
    this.renderModalForm();
  }
  // Включает кнопку отправки сообщения
  enableSendMessageButton() {
    if (this.sendMessageButton) {
      this.sendMessageButton.disabled = false;
    }
  }

  // Отключает кнопку отправки сообщения
  disableSendMessageButton() {
    this.sendMessageButton.disabled = true;
  }

  // Проверяет, загружены ли данные с сервера и соответственно включает или отключает кнопку отправки сообщения
  checkDataLoaded() {
    if (this.dataLoaded) {
      this.enableSendMessageButton();
    } else {
      this.disableSendMessageButton();
    }
  }

  // Метод для обновления состояния кнопки отправки сообщения
  updateSendMessageButtonState() {
    this.checkDataLoaded();
  }

  // Метод для обновления текста в теге <span> после успешной загрузки данных с сервера
  renderDataFromServer() {
    // Меняем текст в элементе
    this.infoHintElement.innerHTML = " ";
  }

  // Метод для успешной загрузки данных
  onDataLoaded() {
    this.dataLoaded = true;
    // Обновляем состояние кнопки отправки сообщения
    this.updateSendMessageButtonState();
    // После загрузки данных вызываем метод для обновления текста в теге <span>
    this.renderDataFromServer();
  }

  // Метод для сброса состояния загрузки данных (например, если данные не удалось загрузить)
  resetDataLoadingState() {
    this.dataLoaded = false;
    // Обновляем состояние кнопки отправки сообщения
    this.updateSendMessageButtonState();
  }

  // Метод для обработки ошибок при загрузке данных
  onDataLoadingError() {
    this.resetDataLoadingState(); // Сбрасываем состояние загрузки данных
    // Можно добавить дополнительную обработку ошибки здесь
  }

  // Метод который загружает данные и обрабатывает возможные ошибки
  fetchData() {
    this.api
      .fetchData()
      .then((data) => {
        this.renderData(data);
        this.onDataLoaded(); // Вызываем метод для обработки успешной загрузки данных
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        this.onDataLoadingError(); // Вызываем метод для обработки ошибки загрузки данных
      });
  }
}
