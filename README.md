---
services: documentdb
platforms: nodejs
author: denniszielke
---

# Web application development with Node.js and Express using DocumentDB
This sample shows you how to use the Microsoft Azure DocumentDB service to store and access data from a Node.js Express application hosted on Azure Websites. 

![Social tweetscoring](./media/image1.png)

For a complete end-to-end walk-through of creating this application, please refer to the [full tutorial on the Azure documentation page](https://azure.microsoft.com/en-us/documentation/articles/documentdb-nodejs-application/)

## Running this sample
1. Deploy the arm template in arm/template.json to azure

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fdenniszielke%2Fsocialtweetscoring%2Fmaster%2Farm%2Ftemplate.json" target="_blank">
    <img src="http://azuredeploy.net/deploybutton.png"/>
</a>  

It will deploy the following resources
- CosmosDB
- Azure Function
- Logic App (unfortunately the Twitter connector cannot be deployed by ARM yet - therefore it does not work)
- App service
- Application Insights
- Search service
- Text Analytics Cognitive Service
- DocumentDb Connection, AppInsights configuration, Cognitive Services access key, Search Admin Keys inside the app service and function appsettings
- Code from github to the dashboard and the functions

Open issues:
- Search Indexer fails to deploy 
- Twitter Connector not possible to deploy


## More information

- [Azure DocumentDB Documentation](https://azure.microsoft.com/en-us/documentation/services/documentdb/)
- [Azure DocumentDB Node SDK](https://www.npmjs.com/package/documentdb)
- [Azure DocumentDB Node SDK Reference Documentation](http://azure.github.io/azure-documentdb-node/)
