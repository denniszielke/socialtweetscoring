var config = {}

config.host = process.env.ENDPOINT;
config.authKey = process.env.AUTHKEY;
config.instrumentationKey = process.env.INSTRUMENTATIONKEY;

config.searchUrl = process.env.SEARCHURL;
config.searchKey = process.env.SEARCHKEY;

config.databaseId = "social";
config.collectionId = "tweets";

module.exports = config;
