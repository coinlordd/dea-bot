const TelegramBot = require("node-telegram-bot-api")
const app = require("express")()
const dotenv = require("dotenv").config()

const TOKEN = process.env.TOKEN
const PRICE_CHAT_ID = process.env.PRICE_CHAT_ID
const TEST_CHAT_ID = process.env.TEST_CHAT_ID
const PORT = process.env.PORT || 3000

const Bot = new TelegramBot( TOKEN, { polling: true } )
const { Queue } = require("./queue")
const COMMANDS = require("./commands")

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

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

const reg = (str) => {
  return new RegExp("/"+str);
}

const randomIntFromInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Bot.on("polling_error", console.log);

Bot.onText(/\/help/, (msg) => {
    const chat_id = msg.chat.id;
    if (chat_id != PRICE_CHAT_ID && chat_id != TEST_CHAT_ID) return

    const message = COMMANDS.map(command => command.text).join("\n")
    sendMessage({
        chat_id: chat_id,
        message: message,
        options: { parse_mode: "HTML"}
    });
})

COMMANDS.forEach(command => {
    const text = reg(command.text)
    Bot.onText(text, (msg) => {
        const chat_id = msg.chat.id;
        if (chat_id != PRICE_CHAT_ID && chat_id != TEST_CHAT_ID) return

        // pick a random message
        const min = 0
        const max = command.messages.length - 1
        const index = randomIntFromInterval(min, max)
        const message = command.messages[index]

        sendMessage({
            chat_id: chat_id,
            message: message,
            options: { parse_mode: "HTML",  reply_to_message_id: msg.message_id }
        });
    })
});
