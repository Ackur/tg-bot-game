const { Telegraf, Scenes, session } = require("telegraf");
const { GenAgeScene, GenNameScene } = require("./Scenes");
require("dotenv").config();

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

const gameAgainQuestion = {
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

/**
 * Функция для отправки сообщения ботом
 * @param {String} actionName Идентификатор кнопки для обработки
 * @param {String} imgSrc Путь к изображению, или false чтобы отправить только текст
 * @param {String} text Текстовое сообщение для отправки
 * @param {Boolean} preview Блокировать превью у ссылок или нет, true - блокировать, false - нет
 */
function addBotAction({ actionName, imgSrc, text, preview = false, callback }) {
  bot.action(actionName, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      imgSrc &&
        (await ctx.replyWithPhoto({
          source: imgSrc,
        }));
      text &&
        (await ctx.replyWithHTML(text, {
          disable_web_page_preview: preview,
        }));
      callback && callback();
    } catch (e) {
      console.error(e);
    }
  });
}

const start = () => {
  bot.telegram.setMyCommands([
    { command: "/start", description: "Welcome" },
    { command: "/info", description: "Read info!" },
    { command: "/game", description: "Game, guess the number" },
    { command: "/scenes", description: "test scenes" },
  ]);

  const stage = new Scenes.Stage([GenAgeScene(), GenNameScene()]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start((ctx) =>
    ctx.reply(`Welcome ${ctx.from.username}, nice to meet you!`)
  );

  bot.command("scenes", async (ctx) => {
    ctx.scene.enter("age");
  });

  bot.command("info", async (ctx) => {
    ctx.reply(
      `Your name is ${ctx.from.first_name} and your username is ${ctx.from.username}`
    );
  });

  bot.command("game", async (ctx) => {
    const chatId = ctx.message.chat.id;
    startGame(ctx, chatId);
  });

  bot.on("message", async (ctx) => {
    ctx.reply("I`m dont understand you, please try again!");
  });

  bot.action("/again", async (ctx) => {
    const chatId = ctx.chat.id;
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
  });

  bot.on("callback_query", async (ctx) => {
    const data = ctx.update.callback_query.data;
    const chatId = ctx.chat.id;

    console.log(
      "==========================callback_query=============================",
      ctx
    );

    if (+data === +chats[chatId]) {
      await ctx.reply(
        `Вітаю ти відгадав цифру ${chats[chatId]}`,
        gameAgainQuestion
      );
    } else {
      await ctx.reply(`Ти обрав цифру ${data}`);

      await ctx.reply(
        `БОТ загадав цифру: "${chats[chatId]}"`,
        gameAgainQuestion
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
