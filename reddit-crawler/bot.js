const Telegraf = require("telegraf")

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

// bot.command("test-serverless", async (ctx) => {
//   try {
//     await checkReddit()
//     ctx.reply("Everything good!〈( ^.^)ノ")
//   } catch (error) {
//     ctx.reply(`Oh no! There was an error ~( ´•︵•\` )~\n\n${error}`)
//   }
// })

bot.launch()

async function sendBotMsg(msg) {
  await bot.telegram.sendMessage(process.env.MY_CHAT_ID, msg)
}

module.exports = { bot, sendBotMsg }
