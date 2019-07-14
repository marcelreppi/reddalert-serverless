const axios = require("axios")

const db = require("./db")
const { sendNotification } = require("./notify.js")
const { sendBotMsg } = require("./bot.js")

async function fetchJSONFeed(subreddit) {
  // Fetch latest posts
  await sendBotMsg(`Fetching /r/${subreddit}`)
  console.log(`Fetching /r/${subreddit}`)

  const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json?limit=100`)

  const feed = response.data.data.children

  const latestPost = await db.getLatestPost(subreddit)

  if (latestPost) {
    // Find latest post from that subreddit and remove already seen posts
    const i = feed.findIndex(x => x.data.created <= latestPost.created)
    if (i !== -1) {
      feed.splice(i)
    }

    if (feed.length > 0) {
      await db.updateLatestPost(subreddit, { created: feed[0].data.created })
    }
  } else {
    await db.addLatestPost({ subreddit, created: feed[0].data.created })
  }

  return feed
}

async function checkReddit() {
  let newPosts = false
  const subreddits = await db.getSubredditsForUser("test@gmail.com")
  for (const sr of subreddits) {
    const feed = await fetchJSONFeed(sr.name)
    await sendBotMsg(`Found ${feed.length} new posts in /r/${sr.name}:`)
    console.log(`Found ${feed.length} new posts in /r/${sr.name}:`)

    const keywordsRegexString = sr.keywords
      .map(k => {
        if (k.includes("AND")) {
          const words = k.split(" AND ")
          return `(${words.map(w => `(?=.*${w})`).join("")}).*`
        }
        return `(${k})`
      })
      .join("|")

    const keywordsRegex = new RegExp(keywordsRegexString, "gi")
    const matchingPosts = []
    for (const post of feed) {
      if (post.data.title.match(keywordsRegex)) {
        matchingPosts.push(post)
      }
    }

    if (matchingPosts.length > 0) {
      newPosts = true
      const result = await sendNotification(sr.name, matchingPosts)
      console.log(result)
    }
  }

  if (!newPosts) {
    await sendBotMsg(`No matching posts in any of the subreddits`)
    console.log(`No matching posts in any of the subreddits`)
  }
}

module.exports = { checkReddit }
