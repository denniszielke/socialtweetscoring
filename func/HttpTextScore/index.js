var request = require('request');
module.exports = function(context, req) {
    
    var cogEndpoint = process.env.CogServiceEndpoint + "/sentiment";
    var accessKey = process.env.CogServiceKey;

    if (!req.body || !req.body.id || !req.body.text){
        context.log("no input detected!");
        context.res = {
            status: 400,
            body: "Please pass a id and text on the request body"
        };
        context.done(null, context.res);
    }

    var idValue = req.body.id;
    var textValue = req.body.text;

    var payload = { 
        "documents" : [
            { 
                "language" : "en", 
                "id" : idValue, 
                "text" : textValue 
            }
        ]
    };

    context.log("posting " + JSON.stringify(payload) + " to " + cogEndpoint + " with " +accessKey);

    request.post({
        headers: {'Content-Type' : 'application/json', 'Ocp-Apim-Subscription-Key' : accessKey},
        url:     cogEndpoint,
        body:    JSON.stringify(payload)
    }, function(error, response, body){
        context.log("error: " + error);
        context.log("body: " + body);
        context.log("reponse: " + JSON.stringify(response));
        context.log("inside callback completed");

        if (!body || !response){
            context.log("Call to cognitive services failed!");
            context.res = {
                status: 400,
                body: "Call to cognitive services failed!"
            };
            context.done(null, context.res);
        }
        else{
            var scoreObject = JSON.parse(response.body).documents[0];
            context.log(scoreObject);
            context.log(typeof(scoreObject));
            var d = new Date();
            var timeString = d.getFullYear() + "-" + d.getMonth()+ "-" + d.getDate() + "-" + d.getHours() + "-" + d.getMinutes() + "-" + d.getSeconds() + "-" + d.getMilliseconds();
            context.res = {
                "status" : 200,
                "value" : "OK",
                "id" : scoreObject.id,
                "score" : scoreObject.score,
                "timestamp" : timeString
            };
            context.log(context.res);
            context.done(null, context.res);
        }
    });

};
