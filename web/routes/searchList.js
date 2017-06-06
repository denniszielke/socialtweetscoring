var AzureSearch = require('azure-search');
var async = require('async');

function SearchList(searchapp, searchkey, searchindex, insightsClient) {
  this.client = AzureSearch({
    url: "https://"+ searchapp +".search.windows.net",
    key: searchkey
  });
  this.searchIndex = searchindex;
  this.searchApp = searchapp;
  this.insightsClient = insightsClient;
}

SearchList.prototype = {
  searchTweets: function(req, res) {
    var self = this;
    var startDate = new Date();

    console.log(req.query);
    
    var queryterm = "azure";
    if (req.query.text)
    {
      queryterm = req.query.text;
    }

    self.client.search(self.searchIndex, {search: queryterm, top: 10, facets: ["location"]}, function(err, results,raw){
      // optional error, or an array of matching results
        console.log("results for " + queryterm);
        console.log(raw);
        // randomly select a result to track search events
        if (results && results.length > 0){
            var randomindex = Math.floor((Math.random() * results.length));
            var resultId = results[randomindex].id;

            self.insightsClient.trackEvent("Search", {
              SearchServiceName: self.searchApp,
              SearchId: resultId,
              IndexName: self.searchIndex,
              QueryTerms: queryterm,
              ResultCount: results.length
            });
        }

        var endDate = new Date();
        console.log(err);
        var facetList = new Array();
        for(var facetIndex in raw['@search.facets'].location)
        {
          var facetResult = raw['@search.facets'].location[facetIndex];
          if (facetResult.value && facetResult.value.length > 0){
            facetList.push(facetResult);
          }
        }
        console.log(facetList);
        var duration = endDate - startDate;
        self.insightsClient.trackMetric("dashboard-search-tweets", duration);
        res.render('search', {
          title: 'Search for cool tweets ',
          tweets: results,
          terms: queryterm,
          facets: facetList,
          refreshDate: endDate.toString()
        });
    });
    
  }
};

module.exports = SearchList;