const db = require("./db")
const { sendBotMsg } = require("./bot.js")
const { checkReddit } = require("./crawler.js")

exports.handler = async event => {
  await db.connectToDB()

  await sendBotMsg("Executing lambda reddalert")
  try {
    await checkReddit()
    // await sendNotification("Test", ["Serverless reddit-notifier is working"]) // For testing
    await sendBotMsg("Successfully executed lambda reddalert")
  } catch (error) {
    await sendBotMsg("Serverless reddit-notifier: There was an error!\n\n" + String(error))
    const response = {
      statusCode: 500,
      body: error,
    }
    return response
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify("Reddalert executed"),
  }
  return response
}
