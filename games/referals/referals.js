// --- START OF FILE games/referals/referals.js ---

document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылки на элементы
    const getReferalLinkButton = document.getElementById('get-referal-link');
    const resultMessageElement = document.getElementById('referal-result-message');

    // Текст сообщения (например, если при нажатии кнопки появляется ссылка или информация)
    const INFO_MESSAGE = "Ваша реферальная ссылка скопирована в буфер обмена!"; // Пример

    // Добавляем обработчик события на кнопку
    if (getReferalLinkButton && resultMessageElement) {
        getReferalLinkButton.addEventListener('click', async () => {
            console.log("Нажата кнопка 'Пригласить друга'");

            // Здесь должна быть логика получения реферальной ссылки
            // Например, запрос к API или генерация на клиенте

            // Для примера просто показываем сообщение
            resultMessageElement.textContent = "Получение ссылки...";
            // Имитируем задержку
            await new Promise(resolve => setTimeout(resolve, 500));

            resultMessageElement.textContent = INFO_MESSAGE; // Показываем информационное сообщение
            resultMessageElement.style.color = 'var(--text-primary)'; // Устанавливаем цвет текста

            // В реальном приложении здесь может быть вызов navigator.clipboard.writeText(link);
        });

        // Опциональная функция для сброса состояния, если нужно
        // Например, если родительское окно отправит postMessage
        function resetReferalPage() {
             resultMessageElement.textContent = '';
             resultMessageElement.style.color = ''; // Сбросить цвет
             // Возможно, сбросить другие элементы UI, если они менялись
        }

        // Пример слушателя postMessage из родительского окна (если нужно)
        // window.addEventListener('message', (event) => {
        //     if (event.data && event.data.type === 'resetReferal') {
        //         resetReferalPage();
        //     }
        //     // Добавьте другие типы сообщений, если нужно
        // });


    } else {
        console.error("Не найдены критические элементы интерфейса для раздела 'Бонусы'.");
    }

    console.log("Раздел 'Бонусы' инициализирован.");
});