const { Scenes } = require("telegraf");

const GenAgeScene = () => {
  const age = new Scenes.BaseScene("age");

  age.enter(async (cts) => {
    await cts.reply(
      "Привіт! Ти увійшов у сцену віку. Вкажіть свільки вам років:"
    );
  });

  age.on("text", async (ctx) => {
    const currAge = Number(ctx.message.text);
    if (currAge && currAge > 0) {
      await ctx.reply("Дякую");
      ctx.scene.enter("name");
    } else {
      await ctx.reply(
        "так не годиться, напиши будьласка свій вік цифрою більше нулю"
      );
      ctx.scene.reenter();
    }
  });
  age.on("message", (ctx) => ctx.reply("а тепер вкажіть свій вік коректно"));

  return age;
};

const GenNameScene = () => {
  const name = new Scenes.BaseScene("name");
  name.enter((ctx) => ctx.reply("Теперь ты в сцене имени. Представься"));
  name.on("text", async (ctx) => {
    const name = ctx.message.text;
    if (name) {
      await ctx.reply(`Привет, ${name}`);
      await ctx.scene.leave();
    } else {
      await ctx.reply("Я так и не понял, как тебя зовут");
      await ctx.scene.reenter();
    }
  });
  name.on("message", (ctx) => ctx.reply("Это явно не твое имя"));
  return name;
};

module.exports = { GenAgeScene, GenNameScene };
