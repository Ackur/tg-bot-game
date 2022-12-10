const { Telegraf } = require("telegraf");
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN);

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

const startGame = async (ctx, chatId) => {
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await ctx.reply(
    "Зараз я загадаю цифру від 0 до 9, а ти спробуеш її відгатади"
  );

  await ctx.reply("Відгадуй:", gameOptions);
};

const start = () => {
  bot.telegram.setMyCommands([
    { command: "/start", description: "Welcome" },
    { command: "/info", description: "Read info!" },
    { command: "/game", description: "Game, guess the number" },
  ]);

  // bot.start((ctx) => ctx.reply("Welcome"));

  bot.on("message", async (ctx) => {
    console.log('=======================================================', ctx);
    const text = ctx.message.text;
    const chatId = ctx.message.chat.id;

    if (text === "/start") {
      return ctx.reply(`Welcome ${ctx.from.username}, nice to meet you!`);
    }

    if (text === "/info") {
      return ctx.reply(
        `Your name is ${ctx.from.first_name} and your username is ${ctx.from.username}`
      );
    }

    if (text === "/game") {
      return startGame(ctx, chatId);
    }

    ctx.reply("I`m dont understand you, please try again!");
  });

  bot.on("callback_query", async (ctx) => {
    const data = ctx.update.callback_query.data;
    const chatId = ctx.chat.id;

    console.log('=======================================================', ctx);

    if (data === "/again") {
      await ctx.editMessageReplyMarkup(
        {
          inline_keyboard: [],
        },
        {
          chat_id: chatId,
          message_id: ctx.message_id,
        }
      );
      return startGame(ctx, chatId);
    }

    if (+data === +chats[chatId]) {
      await ctx.reply(
        `Вітаю ти відгадав цифру ${chats[chatId]}`,
        gameAgeinQuestion
      );
    } else {
      await ctx.reply(`Ти обрав цифру ${data}`);

      await ctx.reply(
        `БОТ загадав цифру: "${chats[chatId]}"`,
        gameAgeinQuestion
      );
    }
    await ctx.deleteMessage(ctx.message_id);
  });

  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
};

start();
