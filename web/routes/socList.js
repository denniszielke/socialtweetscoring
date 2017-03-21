var DocumentDBClient = require('documentdb').DocumentClient;
var async = require('async');

function SocList(socDao, insightsClient) {
  this.socDao = socDao;
  this.insightsClient = insightsClient;
}

SocList.prototype = {
  showTweets: function(req, res) {
    var self = this;
    var date = new Date();
    var lowerpartitionKey = ("0" + date.getDate()).slice(-2) + "" + ("0" + (date.getHours()-1)).slice(-2);
    var partitionKey = ("0" + date.getDate()).slice(-2) + "" + ("0" + date.getHours()).slice(-2);
    var upperpartitionKey = ("0" + date.getDate()).slice(-2) + "" + ("0" + (date.getHours()+1)).slice(-2);
    console.log("Using partition " + partitionKey + " lower partion key " + lowerpartitionKey + " upper key " + upperpartitionKey);
    var querySpec = {
      query: 'SELECT top 20 * FROM c where c.timeslice = @lowerSlice or c.timeslice = @exactSlice or c.timeslice = @upperSlice order by c.points desc',
      parameters: [{
        name: '@lowerSlice',
        value: lowerpartitionKey
      },{
        name: '@upperSlice',
        value: upperpartitionKey
      },{
        name: '@exactSlice',
        value: partitionKey
      }
      ]
    };

    self.insightsClient.trackEvent('Showing all the good #azure tweets');
    var startDate = new Date();

    self.socDao.find(querySpec, function(err, items) {
      if (err) {
        throw (err);
      }

      var endDate = new Date();
      var duration = endDate - startDate;
      self.insightsClient.trackMetric("Loaded Tweets", duration);

      res.render('index', {
        title: 'All the cool Tweets List ',
        tweets: items,
        refreshDate: endDate.toString()
      });
    });
  }
};

module.exports = SocList;
