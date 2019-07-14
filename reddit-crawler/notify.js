const nodemailer = require("nodemailer")

const { sendBotMsg } = require("./bot.js")

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PW,
  },
})

transporter.verify(error => {
  if (error) {
    console.log(error)
  } else {
    // console.log("Mail server is ready")
  }
})

exports.sendNotification = async function(subreddit, posts) {
  const subject = "New interesting post(s) in subreddit " + subreddit
  const content = `${posts
    .map(p => `${p.data.title}\n${p.data.url}`)
    .join("\n\n")}`
  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: process.env.MAIL_RECEIVER,
    subject,
    text: content,
  }

  await sendBotMsg(`${subject}:\n\n${content}`)

  return await transporter.sendMail(mailOptions)
}
