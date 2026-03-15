// Бот для игры в крестики-нолики
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// ✅ НОВЫЙ токен (который вы только что получили)
const token = '8642836990:AAG5PpgqKqBHfCyEYwbVVMXTwj-OOMonndI';
const bot = new TelegramBot(token, { polling: true });

// ✅ ВАШ РАБОЧИЙ URL (проверьте, работает ли он в браузере)
const appUrl = 'https://cream44lluv.github.io/tictactoe-telegram/';

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🎮 Добро пожаловать в игру "Крестики-нолики"!', {
        reply_markup: {
            inline_keyboard: [[
                { text: '🎮 Открыть игру', web_app: { url: appUrl } }
            ]]
        }
    });
});

// Обработка данных из Mini App
bot.on('web_app_data', (msg) => {
    try {
        const data = JSON.parse(msg.web_app_data.data);
        console.log('Получены данные:', data);
        
        if (data.action === 'invite') {
            // Отправляем приглашение сопернику
            bot.sendMessage(data.opponent_id, 
                `🎮 ${data.inviter_name} приглашает вас сыграть в крестики-нолики!`, {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '✅ Принять', callback_data: `accept_${data.inviter_id}` },
                        { text: '❌ Отклонить', callback_data: 'decline' }
                    ]]
                }
            });
            
            // Подтверждение отправителю
            bot.sendMessage(msg.chat.id, `✅ Приглашение отправлено пользователю @${data.opponent_username}`);
        }
    } catch (error) {
        console.error('Ошибка обработки web_app_data:', error);
    }
});

// Обработка нажатий на кнопки
bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    
    if (data.startsWith('accept_')) {
        const inviterId = data.split('_')[1];
        
        bot.sendMessage(chatId, '✅ Вы приняли приглашение! Игра начинается...', {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎮 Перейти в игру', web_app: { url: appUrl } }
                ]]
            }
        });
        
        // Уведомляем пригласившего
        bot.sendMessage(inviterId, '🎮 Соперник принял ваше приглашение! Начинайте игру!', {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎮 Перейти в игру', web_app: { url: appUrl } }
                ]]
            }
        });
        
    } else if (data === 'decline') {
        bot.sendMessage(chatId, '❌ Вы отклонили приглашение');
    }
    
    bot.answerCallbackQuery(query.id);
});

// Простой веб-сервер для Render
app.get('/', (req, res) => {
    res.send('Бот работает!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

console.log('🤖 Бот запущен и готов к работе!');
