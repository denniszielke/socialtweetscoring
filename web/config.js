var config = {}

config.host = process.env.ENDPOINT;
config.authKey = process.env.AUTHKEY;
config.instrumentationKey = process.env.INSTRUMENTATIONKEY;
config.searchApp = process.env.SEARCHAPP;
config.searchKey = process.env.SEARCHKEY;

config.searchIndex = "cooltweets";
config.databaseId = "tweets";
config.collectionId = "social";

module.exports = config;
