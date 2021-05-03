const app = require("express")()
const dotenv = require("dotenv").config()

const PRICE_CHAT_ID = process.env.PRICE_CHAT_ID
const TEST_CHAT_ID = process.env.TEST_CHAT_ID
const PORT = process.env.PORT || 3000

const { Bot, sendMessage, sendVideo } = require("./bot")
const MESSAGES = require("./commands/messages")
const VIDEOS = require("./commands/videos")

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

const reg = (str) => {
  return new RegExp("/"+str);
}

const randomIntFromInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getCommands = () => {
  let messageCommands = MESSAGES.map(command => command.command)
  let videoCommands = VIDEOS.map(command => command.command)
  return messageCommands.concat(videoCommands).join("\n")
}

const parseMsg = (msg) => {
  return {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  }
}

Bot.onText(/\/help/, (msg) => {
  const { chat_id, message_id } = parseMsg(msg)
  if (chat_id != PRICE_CHAT_ID && chat_id != TEST_CHAT_ID) return

  sendMessage({
    chat_id: chat_id,
    message: getCommands(),
    options: { parse_mode: "HTML",  reply_to_message_id: message_id }
  });
})

VIDEOS.forEach(command => {
  const text = reg(command.command)
  Bot.onText(text, (msg) => {
    const { chat_id, message_id } = parseMsg(msg)
    if (chat_id != PRICE_CHAT_ID && chat_id != TEST_CHAT_ID) return

    sendVideo({
      chat_id: chat_id,
      id: command.id,
      options: {
        parse_mode: "HTML",
        caption: command.caption,
        reply_to_message_id: message_id
      }
    });
  })
});

MESSAGES.forEach(command => {
  const text = reg(command.command)
  Bot.onText(text, (msg) => {
    const { chat_id, message_id } = parseMsg(msg)
    if (chat_id != PRICE_CHAT_ID && chat_id != TEST_CHAT_ID) return

    // Pick a random message
    const max = command.messages.length - 1
    const index = randomIntFromInterval(0, max)
    const message = command.messages[index]

    sendMessage({
      chat_id: chat_id,
      message: message,
      options: { parse_mode: "HTML",  reply_to_message_id: message_id }
    });
  })
});
