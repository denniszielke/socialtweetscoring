var request = require('request');
var appInsights = require("applicationinsights");
var client = appInsights.getClient();

module.exports = function (context, data) {
        
  context.log(data);
  if (!data || !data.text || !data.user){
        context.log("no input detected!");
        context.res = { status: 400, body: "Please pass a id and text on the request body" };
        context.done(null, context.res);
        return;
  }
    var startDate = new Date();
    var endDate = new Date();
    var duration = endDate - startDate;
    client.trackMetric("filter-tweet-duration", duration);
        
  // Response of the function to be used later.
  context.res = {
            
    body: {
                
      greeting: 'Hello ' + data.user + '!'
                
    }
                
  };
                
  context.done();
                
};