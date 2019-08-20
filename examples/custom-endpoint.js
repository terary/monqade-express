"use strict";

const express = require('express');

const exampleHelper = require('./support/helper-functions'); 
const expressApp = exampleHelper.getAppInstance();

const mqSchemaDictionary = exampleHelper.getMonqeSchemaInstance()


const COMMON_TEST_VARS = require('../environment');
const SUB_APP_MOUNT_POINT     = COMMON_TEST_VARS.static.SUB_APP_MOUNT_POINT;// '/testing'



//create API/Proxy from MonqadeSchema
const MqProxyFactory = require('../')
const mqProxy = MqProxyFactory.getProxyServer( mqSchemaDictionary);

//create express mini-app
const mqApp = express();
expressApp.use(SUB_APP_MOUNT_POINT, mqApp);



// add new webMethod -- can be used like all other web methodss
mqProxy.webMethodAdd('ping',(req, res, nex,mqScheme)=>{
    res.json({hello:"world"});
})

// bind webMethod to Endpoint -- see notes
mqApp.get( '/'+ mqSchemaDictionary.collectionName +'/ping',(req,res)=>{
    mqProxy.webMethodExec('ping',req,res);
})

//bind the API/proxy to the mini-app
mqApp.use(mqProxy.makeRouter())  // short hand


/**
 * binding webMethod to route 
 * In some cases there can be conflicts.  get('/..') -> doFindOne
 * Hence - *order is important*
 *      A) create custom route get('/newEndpoin')
 *      B) call mqProxy.makeRouter() after  
 * See also appendRouteTo
 * 
 */




console.log('API URL: ',SUB_APP_MOUNT_POINT +'/' + mqSchemaDictionary.collectionName);
exampleHelper.startServer(expressApp);