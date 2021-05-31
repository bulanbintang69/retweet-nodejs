require("dotenv").config();
const Twit = require("twit");

const TwitBot = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const reTweet = (searchText) => {
    let params = {
        q: searchText + "",
        result_type: "recent",
        count: 25,
        lang: "en"
    }

    TwitBot.get("search/tweets", params, (er, data, resp) => {
        console.log("searching:)");
        let tweets = data.statuses;
        if(!er) {
            let tweetIDList = [];
            for(let tweet of tweets) {
                tweetIDList.push(tweet.id_str);

                // To Avoid Duplication
                if(tweet.text.startsWith("RT @")) {
                    // if this true the already retweeted by bot
                    if(tweet.retweeted_status) {
                        tweetIDList.push(tweet.retweeted_status.id_str);
                    } else {
                        tweetIDList.push(tweet.id_str);
                    }
                } else {
                    tweetIDList.push(tweet.id_str);
                }
            }

            // unique tweets only
            const uniqueTweets = (val, index, self) => {
                return self.indexOf(val) === index;
            }

            tweetIDList = tweetIDList.filter(uniqueTweets);

            for(let tweetID of tweetIDList) {
                TwitBot.post("statuses/retweet/:id", {id: tweetID}, (err, dataRt, response) => {
                    if(!err) {
                        console.log("Retweeted id: ", tweetID);
                    } else {
                        console.log("Duplication maybe.", tweetID);
                        // console.log("Err: ", err);
                    }
                });

                // like tweet
                TwitBot.post("favorites/create", {id: tweetID}, (err_fav, err_resp) => {
                    if(err_fav) {
                        // console.log("Some Error:", err_fav);
                        console.log("Some Error:");
                    } else {
                        console.log("favorited: ", tweetID);
                    }
                });
            }
        } else {
            console.log("Error while searching::", er);
            process.exit(1);
        }
    })
}

setInterval(() => {
    reTweet("#NodeJs");
    reTweet("#100DaysOfCode");
}, 60000);
