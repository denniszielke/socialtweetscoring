var AzureSearch = require('azure-search');
var async = require('async');

function SearchList(searchapp, searchkey, searchindex, docDBHost, docDBKey, docDBDatabaseId, docDBCollectionId, insightsClient) {
  this.client = AzureSearch({
    url: "https://"+ searchapp +".search.windows.net",
    key: searchkey
  });
  this.searchIndex = searchindex;
  this.searchApp = searchapp;
  this.insightsClient = insightsClient;
  this.dbHost = docDBHost;
  this.dbKey = docDBKey;
  this.dbId = docDBDatabaseId;
  this.dbCollectionId = docDBCollectionId;
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
    
  },
  searchInit: function(req, res) {
    var self = this;
    var startDate = new Date();
//mongodb://dz5socialdb:oCivAbEFjVnqdrnzIL0wA7HpKAEXPlX6h90r1WpMGGMIU6axQeMnO0BI5vABCBfuynvwrX2OuNmH7tjBLzT2pg==@dz5socialdb.documents.azure.com:10255/?ssl=true&replicaSet=globaldb
//credentials : { connectionString : "AccountEndpoint="+ self.dbHost +";AccountKey=" + self.dbKey + ";Database=" + self.dbId },
    var options = {
      name : "tweet-datasource",
      type : "documentdb",
      credentials : { connectionString : "DefaultEndpointsProtocol=https;AccountEndpoint="+ self.dbHost +";AccountKey=" + self.dbKey + ";Database=" + self.dbId },
      container : { name : self.dbCollectionId, query : "" },
      dataChangeDetectionPolicy: {
        "@odata.type": "#Microsoft.Azure.Search.HighWaterMarkChangeDetectionPolicy",
        "highWaterMarkColumnName": "_ts"
      }
    }
    console.log("creating data source");
    console.log(options);

    self.client.createDataSource(options, function (err, data) {
      console.log("created data source");
      console.log(data);
      console.log("errors while creation");
      console.log(err);

      var schema = {
      name: self.searchIndex,
      fields:
      [ { name: 'id',
          type: 'Edm.String',
          searchable: false,
          filterable: true,
          retrievable: true,
          sortable: true,
          facetable: true,
          key: true },
        { name: 'text',
          type: 'Edm.String',
          searchable: true,
          filterable: false,
          retrievable: true,
          sortable: false,
          facetable: false,
          key: false },
        { name: 'score',
          type: 'Edm.String',
          searchable: true,
          filterable: true,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false },
        { name: 'createdAt',
          type: 'Edm.String',
          searchable: true,
          filterable: true,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false },
        { name: 'followerCount',
          type: 'Edm.String',
          searchable: true,
          filterable: true,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false },
        { name: 'username',
          type: 'Edm.String',
          searchable: true,
          filterable: false,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false },
        { name: 'profileUrl',
          type: 'Edm.String',
          searchable: true,
          filterable: false,
          retrievable: true,
          sortable: false,
          facetable: false,
          key: false },
        { name: 'retweetCount',
          type: 'Edm.String',
          searchable: true,
          filterable: false,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false },
        { name: 'userId',
          type: 'Edm.String',
          searchable: true,
          filterable: false,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false },
        { name: 'timeslice',
          type: 'Edm.String',
          searchable: true,
          filterable: false,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false },
        { name: 'location',
          type: 'Edm.String',
          searchable: true,
          filterable: true,
          retrievable: true,
          sortable: true,
          facetable: true,
          key: false },
        { name: 'points',
          type: 'Edm.String',
          searchable: true,
          filterable: false,
          retrievable: true,
          sortable: true,
          facetable: false,
          key: false } ],
      scoringProfiles: [],
      defaultScoringProfile: null,
      corsOptions: null };
      console.log("creating index");
      self.client.createIndex(schema, function(err, schema){
          console.log("created index");
          console.log(schema);
          console.log("error during index creation");
          console.log(err);

          // var startIndexTime = new Date().toISOString().replace(".",":").substr(;

          var indexer = {
            name: 'tweetindexer',
            description: 'Anything', // Optional. Anything you want, or null
            dataSourceName: 'tweet-datasource', // Required. The name of an existing data source
            targetIndexName: self.searchIndex, // Required. The name of an existing index,
            schedule: { //Optional. All of the parameters below are required. 
              interval: 'PT5M'
            }
          };
          console.log("creating indexer");
          console.log(indexer);
          self.client.createIndexer(indexer, function (err, indexer) {
            console.log("created indexer");
            console.log(indexer);
            console.log("error during indexer creation");
            console.log(err);
            var endDate = new Date();    

            var duration = endDate - startDate;
            self.insightsClient.trackMetric("dashboard-search-init", duration);
            res.render('search', {
              title: 'Initialization completed',
              refreshDate: endDate.toString()
            });
          });          
      });

    });   
    
  }
};

module.exports = SearchList;