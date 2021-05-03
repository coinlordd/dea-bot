const TelegramBot = require("node-telegram-bot-api")
const fs = require("fs")
const path = require("path")

const TOKEN = process.env.TOKEN
const Bot = new TelegramBot( TOKEN, { polling: true } )
Bot.on("polling_error", console.log);

const { Queue } = require("./queue")

const sendMessage = ({ chat_id, message, options} = {}) => {
  try {
    if (!chat_id || !message || !options) throw new Error("Params are missing")

    Queue.schedule(() => {
      try {
        Bot.sendMessage(chat_id, message, options)
      } catch (err) {
        throw err
      }
    });
  } catch (err) {
    console.error(err);
  }
}

const sendVideo = async ({ chat_id, id, options } = {}) => {
  try {
    if (!chat_id || !id || !options) throw new Error("Params are missing")
    const file = await fs.readFileSync(path.join(__dirname, `assets/${id}`));

    Queue.schedule(() => {
      try {
        Bot.sendVideo(chat_id, file, options)
      } catch (err) {
        throw err
      }
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  Bot,
  sendMessage,
  sendVideo,
}
