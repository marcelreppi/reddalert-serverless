const MongoClient = require("mongodb").MongoClient

const MONGODB_URL =
  process.env.NODE_ENV === "production" ? process.env.MONGODB_PROD_URL : process.env.MONGODB_DEV_URL
const DB_NAME = process.env.NODE_ENV === "production" ? "reddalert" : "reddalert-dev"

const SUBREDDIT_COLLECTION = "subreddits"
const LATEST_POSTS_COLLECTION = "latest-posts"

let db = null
exports.connectToDB = async () => {
  await MongoClient.connect(MONGODB_URL, { useNewUrlParser: true, poolSize: 10 })
    .then(client => {
      db = client.db(DB_NAME)
      console.log("Connected to MongoDB")
    })
    .catch(error => console.error(error))
}

exports.getSubredditsForUser = async email => {
  const result = await db
    .collection(SUBREDDIT_COLLECTION)
    .find({
      email,
    })
    .toArray()
  return result[0].subreddits
}

exports.getLatestPost = async subreddit => {
  const result = await db
    .collection(LATEST_POSTS_COLLECTION)
    .find({ subreddit })
    .toArray()
  return result[0]
}

exports.updateLatestPost = async (subreddit, updatedLatestPost) => {
  return await db.collection(LATEST_POSTS_COLLECTION).update(
    {
      subreddit,
    },
    updatedLatestPost,
    { upsert: true }
  )
}

exports.addLatestPost = async latestPost => {
  return await db.collection(LATEST_POSTS_COLLECTION).insertOne(latestPost)
}
