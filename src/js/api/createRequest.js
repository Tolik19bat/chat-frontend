// Функция createRequest принимает объект options в качестве параметра. Этот объект содержит параметры запроса.
// Если не хватает каких-либо обязательных параметров (requestMethod, url, host, callback), функция завершается без выполнения запроса.

const createRequest = (options = {}) => {
  if (
    !options.requestMethod || // Проверка наличия метода запроса
    !options.url || // Проверка наличия URL
    !options.host || // Проверка наличия хоста
    !options.callback // Проверка наличия функции обратного вызова
  ) {
    return; // Возврат из функции, если какой-либо обязательный параметр отсутствует
  }

  try {
    // Формирование полного URL из host и url
    const url = `${options.host}${options.url}`;

    // Создание нового объекта XMLHttpRequest
    const xhr = new XMLHttpRequest();

    // Добавление слушателя события "load" для обработки успешного завершения запроса
    xhr.addEventListener("load", () => {
      // Парсинг полученных данных в формате JSON
      const data = JSON.parse(xhr.response);

      // Проверка успешного выполнения запроса (статус 200 или 409)
      if (xhr.status === 200 || xhr.status === 409) {
        // Вызов функции обратного вызова с полученными данными в случае успешного выполнения запроса
        options.callback(data);
      }
    });

    // Настройка параметров запроса (метод запроса и URL)
    xhr.open(options.requestMethod, url);

    // Отправка запроса с телом в формате JSON
    xhr.send(JSON.stringify(options.body));
  } catch (error) {
    // Обработка ошибок, если они возникают при выполнении запроса
    console.log("error");
  }
};

export default createRequest; // Экспорт функции createRequest для использования в других модулях
