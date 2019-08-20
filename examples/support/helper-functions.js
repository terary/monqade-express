"use strict";

//create and return express app
//fewer unnecessary lines of code in example

const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser')
//const dictSchemaDef = require('./dictionary.mqschema.js');
const dictSchemaDef = require('monqade-dev-schemas').dictionary;
const MonqadeSchema = require('monqade-schema');


//const COMMON_TEST_VARS = require('../../test/common');
const COMMON_TEST_VARS = require('../../environment');
// const SUB_APP_MOUNT_POINT     = COMMON_TEST_VARS.static.SUB_APP_MOUNT_POINT;// '/testing'
// const MONQADE_TEST_HTTP_PORT     = COMMON_TEST_VARS.static.EXAMPLE_SERVER_PORT;// '/testing'
const mongConn     = COMMON_TEST_VARS.runtime.MONGO_CONNECTION;// '/testing'
const MONQADE_TEST_HTTP_PORT     = COMMON_TEST_VARS.static.EXAMPLE_SERVER_PORT;// '/testing'

const getAppInstance = () =>{
    const app = express();

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.header('Access-Control-Allow-Methods', 'PATCH, POST, GET, DELETE, OPTIONS');
      next();
    });
    app.use( bodyParser.json() );       //
    return app    
}
module.exports.getAppInstance = getAppInstance;

const getMonqeSchemaInstance = () =>{
    const dictionarySchema = new MonqadeSchema(dictSchemaDef.paths,dictSchemaDef.options, mongConn);
    return dictionarySchema;
}
module.exports.getMonqeSchemaInstance = getMonqeSchemaInstance;


const startServer = (expressApp) => {
    expressApp.listen(MONQADE_TEST_HTTP_PORT, function() {
        console.log(`Monqade test server running on port: ${MONQADE_TEST_HTTP_PORT}`);
    
        fetch('http://localhost:3100/testing/dictionary/discovery')
          .then(res => res.json())
          .then(json => 
            console.log(json['notes'])
            ).catch(e=>{
              console.log('Error:',e)
            });
      
      });
}
module.exports.startServer = startServer;






