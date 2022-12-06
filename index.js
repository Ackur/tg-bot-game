const TelegramBot = require("node-telegram-bot-api");

const token = "5916747010:AAH5GA5HQ4wnvjVvUcI9kM4wAjH4bUGdb3Y";

const bot = new TelegramBot(token, { polling: true });

const chats = {};

const gameOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        { text: "0", callback_data: "0" },
        { text: "1", callback_data: "1" },
        { text: "2", callback_data: "2" },
      ],
      [
        { text: "3", callback_data: "3" },
        { text: "4", callback_data: "4" },
        { text: "5", callback_data: "5" },
      ],
      [
        { text: "6", callback_data: "6" },
        { text: "7", callback_data: "7" },
        { text: "8", callback_data: "8" },
      ],
      [{ text: "9", callback_data: "9" }],
    ],
  }),
};

const gameAgeinQuestion = {
  reply_markup: JSON.stringify({
    inline_keyboard: [[{ text: "play again", callback_data: "/again" }]],
  }),
};

const startGame = async (chatId) => {
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(
    chatId,
    "Зараз я загадаю цифру від 0 до 9, а ти спробуеш її відгатади"
  );

  await bot.sendMessage(chatId, "Відгадуй:", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Welcome" },
    { command: "/info", description: "Read info!" },
    { command: "/game", description: "Game, guess the number" },
  ]);

  bot.on("message", async (msg) => {
    console.log(msg);
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      return bot.sendMessage(
        chatId,
        `Welcome ${msg.from.username}, nice to meet you!`
      );
    }

    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Your name is ${msg.from.first_name} and your username is ${msg.from.username}`
      );
    }

    if (text === "/game") {
      return startGame(chatId);
    }

    bot.sendMessage(chatId, "I`m dont understand you, please try again!");
  });

  bot.on("callback_query", (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    console.log(msg);

    if (data === "/again") {
      return startGame(chatId);
    }

    if (+data === +chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Вітаю ти відгадав цифру ${chats[chatId]}`,
        gameAgeinQuestion
      );
    } else {
      bot.sendMessage(
        chatId,
        `Ти не відгадав цифру яку загадав БОТ "${chats[chatId]}"`,
        gameAgeinQuestion
      );
    }

    bot.sendMessage(chatId, `Ти обрав цифру ${data}`);
  });
};

start();
