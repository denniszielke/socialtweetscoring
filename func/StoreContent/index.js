var appInsights = require("applicationinsights");
var client = appInsights.getClient();

module.exports = function (context, data) {
  context.log(data);
  var date = new Date();
  var partitionKey = ("0" + date.getDate()).slice(-2) + "" + ("0" + date.getHours()).slice(-2);
  context.log("Partition is " + partitionKey);
  client.trackEvent("storing-tweet-to-cosmosdb", { userId: data.userid, location: data.location }, { score: data.score, followercount: data.followerCount});
  
  if (data.score){
    context.log("Score is " + data.score);
    var socialPoints = data.score * (data.retweetcount +1) * data.followerCount * date.getHours() * date.getMinutes();
    socialPoints = Math.round(socialPoints);
    var hashtags = new Array();
    if (data.text){
      var words = data.text.split(" ");    
      for(var word in words){
        if (word.startsWith("#")){
          context.log("tag " + word);
          hashtags.push(word);
        }
      }
    }
    context.log(hashtags);
    context.bindings.outputDocument = JSON.stringify({ 
        id: data.tweetid,
        text: data.text,
        score: data.score,
        createdAt: data.createdat,
        followerCount: data.followerCount,
        username: data.name,
        profileUrl: data.profileUrl,
        retweetCount: data.retweetcount,
        userId: data.userid,
        timeslice : partitionKey,
        location: data.location,
        tags: hashtags,
        points: socialPoints
    });
   }
                 
  context.done();                
};