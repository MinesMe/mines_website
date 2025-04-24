// --- START OF FILE word_of_the_day/word_of_the_day.js ---

document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылки на элементы интерфейса
    const inputElement = document.getElementById('word-of-the-day-input');
    const submitButton = document.getElementById('word-of-the-day-submit');
    const resultElement = document.getElementById('word-of-the-day-result');

    // Определяем правильное слово и сообщения
    const CORRECT_WORD = "ХАЛВА";
    const SUCCESS_MESSAGE = "Шоколадка уже в пути, напиши в чат Хакатона кодовое слово которое угадал)";
    const ERROR_MESSAGE = "К сожалению, это не слово дня.\nПопробуй еще раз!";

    // Добавляем обработчик события на кнопку "Проверить"
    if (submitButton && inputElement && resultElement) {
        submitButton.addEventListener('click', () => {
            // Получаем введенный текст, удаляем пробелы по краям и переводим в верхний регистр
            const inputWord = inputElement.value.trim().toUpperCase();

            // Очищаем предыдущий результат и классы стилей
            resultElement.textContent = '';
            resultElement.classList.remove('result-success', 'result-error');

            // Проверяем, совпадает ли введенное слово с правильным
            if (inputWord === CORRECT_WORD) {
                // Если слово правильное
                resultElement.textContent = SUCCESS_MESSAGE;
                resultElement.classList.add('result-success');
                // Отключаем поле ввода и кнопку после успешного угадывания (опционально)
                inputElement.disabled = true;
                submitButton.disabled = true;

            } else {
                // Если слово неправильное
                resultElement.textContent = ERROR_MESSAGE;
                resultElement.classList.add('result-error');
                // Очищаем поле ввода после неправильной попытки (опционально)
                inputElement.value = '';
            }
        });

        // Опционально: добавляем возможность проверить слово по нажатию Enter в поле ввода
        inputElement.addEventListener('keypress', (event) => {
             // Проверяем, была ли нажата клавиша Enter (код 13)
             if (event.key === 'Enter' || event.keyCode === 13) {
                  event.preventDefault(); // Предотвращаем стандартное действие (например, отправку формы)
                  submitButton.click(); // Имитируем нажатие кнопки "Проверить"
             }
        });

         // Функция для сброса состояния (поле ввода, результат) при необходимости
         // Может вызываться из родительского окна через postMessage, если потребуется
         function resetGame() {
              inputElement.value = '';
              resultElement.textContent = '';
              resultElement.classList.remove('result-success', 'result-error');
              inputElement.disabled = false;
              submitButton.disabled = false;
         }

         // Пример получения сообщений из родительского окна (если нужно)
         // window.addEventListener('message', (event) => {
         //     if (event.data && event.data.type === 'resetWordOfDay') {
         //         resetGame();
         //     }
         //     // Добавьте другие типы сообщений, если нужно
         // });


    } else {
        console.error("Не найдены критические элементы интерфейса для игры 'Слово дня'.");
    }

    console.log("Игра 'Слово дня' инициализирована.");
});