"use strict";

const express = require('express');

const exampleHelper = require('./support/helper-functions'); 
const expressApp = exampleHelper.getAppInstance();
const mqSchemaDictionary = exampleHelper.getMonqeSchemaInstance()


//const COMMON_TEST_VARS = require('../test/common');
const COMMON_TEST_VARS = require('../environment');
const SUB_APP_MOUNT_POINT     = COMMON_TEST_VARS.static.SUB_APP_MOUNT_POINT;// '/testing'



//create API/Proxy from MonqadeSchema
const MqProxyFactory = require('../')
const dictionMqProxy = MqProxyFactory.getProxyServer( mqSchemaDictionary);


//create express mini-app
const mqApp = express();
expressApp.use(SUB_APP_MOUNT_POINT, mqApp);

//bind the API/proxy to the mini-app
mqApp.use(dictionMqProxy.makeRouter())  // short hand





console.log('API URL: ',SUB_APP_MOUNT_POINT +'/' + mqSchemaDictionary.collectionName);
exampleHelper.startServer(expressApp);