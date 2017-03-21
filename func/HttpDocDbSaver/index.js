module.exports = function (context, data) {
        
  var input = data;
  var date = new Date();
  var partitionKey = ("0" + date.getDate()).slice(-2) + "" + ("0" + date.getHours()).slice(-2);
  context.log("Partition is " + partitionKey);
  

  if (data.score && data.score > 0.4){
    context.log("Score is " + data.score);
    var socialPoints = data.score * (data.retweetcount +1) * data.followerCount * date.getHours() * date.getMinutes();
    socialPoints = Math.round(socialPoints);
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
        points: socialPoints
    });
  }
                 
  context.done();
                
};