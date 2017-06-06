var request = require('request');
var appInsights = require("applicationinsights");
var client = appInsights.getClient();

module.exports = function (context, data) {
  context.log(data);
  if (!data || !data.text || !data.id){
        context.log("no input detected!");
        context.res = { status: 400, body: "Please pass a id and text on the request body" };
        context.done(null, context.res);
        return;
  }

  client.trackEvent("calculating-tweet-score", { userId: data.id });
  var startDate = new Date();

  var payload = { "documents" : [{ "language" : "en", "id" : data.id, "text" : data.text }]};
  var userlocation = data.location || "unknown";

  request.post({
        headers: {'Content-Type' : 'application/json', 'Ocp-Apim-Subscription-Key' : process.env.TEXTSCORE_KEY},
        url:     process.env.TEXTSCORE_URL + "/sentiment",
        body:    JSON.stringify(payload)
    }, function(error, response, body){
        context.log("error: " + error);
        context.log("body: " + body);
        context.log("reponse: " + JSON.stringify(response));
        var endDate = new Date();
        var duration = endDate - startDate;
        client.trackMetric("tweet-score-duration", duration);

        if (!body || !response){
            client.trackEvent("failed-calculated-tweet-score", { userId: data.id, code: response.statusCode });
            context.log("Call to cognitive services failed!");
            context.res = { status: 400, body: "Call to cognitive services failed!" };
            context.done(null, context.res);
        }
        else{
            client.trackEvent("successfull-calculated-tweet-score", { userId: data.id });
            var scoreObject = JSON.parse(response.body).documents[0];
            context.log(scoreObject);
            var d = new Date();
            var timeString = d.getFullYear() + "-" + d.getMonth()+ "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + "-" + d.getMilliseconds();
            context.res = {
                "status" : 200,
                "value" : "OK",
                "id" : scoreObject.id,
                "score" : scoreObject.score,
                "timestamp" : timeString
            };
            client.trackMetric("tweet-score", scoreObject.score);
            context.log(context.res);
            context.done(null, context.res);
        }
    });            
};