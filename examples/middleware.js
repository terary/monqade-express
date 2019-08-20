"use strict";

const mwCustomTerminate = (req,res,next,mqSchema) => {

    if(res.locals.customMiddleware && res.locals.customMiddleware.execLog) {
        res.json({execLog:res.locals.customMiddleware.execLog});
    }else {
        res.json({execLog:[]});
    }
    // notice no next
}
const mwCustomFirst =  (req,res,next,mqSchema) => {
    res.locals.customMiddleware = {
        execLog:[]
    };
    res.locals.customMiddleware.execLog.push('First');
    next();
}
const mwCustomSecond =  (req,res,next,mqSchema) => {
    res.locals.customMiddleware.execLog.push('Second');
    next();
}
const mwCustomLast =  (req,res,next,mqSchema) => {
    res.locals.customMiddleware.execLog.push('Last');
    next();
}

const express = require('express');

const exampleHelper = require('./support/helper-functions'); 
const expressApp = exampleHelper.getAppInstance();
const mqSchemaDictionary = exampleHelper.getMonqeSchemaInstance()


const COMMON_TEST_VARS = require('../environment');
const SUB_APP_MOUNT_POINT     = COMMON_TEST_VARS.static.SUB_APP_MOUNT_POINT;// '/testing'



//create API/Proxy from MonqadeSchema
//create API/Proxy from MonqadeSchema
const MqProxyFactory = require('../')
const dictionMqProxy = MqProxyFactory.getProxyServer( mqSchemaDictionary);

//const dictionMqProxy = require('../')( mqSchemaDictionary);


//create express mini-app
const mqApp = express();
expressApp.use(SUB_APP_MOUNT_POINT, mqApp);

mqApp.use((res,req,next)=>{
    next();
})

//bind the API/proxy to the mini-app
mqApp.use(dictionMqProxy.makeRouter())  // short hand

// we're using 'doQueryMany' because it's a route already set-up and want to demonstrate 
// A) Customer middleware
// B) Overriding default webMethod behaviour
dictionMqProxy.use('doQueryMany', mwCustomFirst,
                                    mwCustomSecond,
                                    mwCustomLast, 
                                    mwCustomTerminate);




console.log('API URL: ',SUB_APP_MOUNT_POINT +'/' + mqSchemaDictionary.collectionName);
exampleHelper.startServer(expressApp);

