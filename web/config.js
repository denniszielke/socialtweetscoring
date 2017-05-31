var config = {}

config.host = process.env.ENDPOINT || "[URI for DocumentDB endpoint]";
config.authKey = process.env.AUTHKEY || "[Master key for DocumentDB]";
config.instrumentationKey = process.env.INSTRUMENTATIONKEY;

config.databaseId = "social";
config.collectionId = "tweets";

module.exports = config;
