"use strict";

// Set db server connection string like so:
// let connectionString  = 'mongodb://127.0.0.1:27017/monqade-test';
let connectionString = undefined;


if(process.env.HOSTNAME == 'terary-msi' ||  process.env.MONQADE_RUNTIME == 'travis'){

    connectionString = 'mongodb://127.0.0.1:27017/monqade-test';

} else if( ! connectionString) {

    console.log(`
            \n\n\n
            **********************   Tests  **************************** 
            A) ***Connection string need to be set in test/common.js ***

            B) Be advised for tests a single database will be used
            with a few collections.  

            Database, collection and documents will persist. There is no
            house cleaning, by design.
            
            Please select a database (or new database) specifically for 
            testing.  *Manually Delete* test database when finished.
            \n\n\n

    `);
    process.exit(-1);
}


const mongoose = require('mongoose');
mongoose.Promise = global.Promise;



const subAppPoint = '/testing';
const COMMON_TEST_VARS = {
    static: {
        SUB_APP_MOUNT_POINT:subAppPoint,
        MONGO_CONNECT_STRING: connectionString,
        EXAMPLE_SERVER_PORT:3100,
        MONGO_CONNECT_OPTIONS:{  useNewUrlParser: true, connectTimeoutMS:5000,  useCreateIndex: true, useFindAndModify:false },
    
    },
   
    runtime: {
        mqProxies:{
            usersMqProxy:   undefined,      // will be set at server setup
            orgsMqProxy:    undefined       // will be set at server setup
        },
        ENDPOINT:           undefined,      // set after mongoose connection (bottom this file)

        schemas:            undefined,      // requires live connection
        testRecordSet:      undefined,      // contains documents to be used for testing - set in 'controller.js'
        requester:          undefined       // chai server ref. set controller  - 
    }
}



const mongConn = mongoose.createConnection(COMMON_TEST_VARS.static.MONGO_CONNECT_STRING, COMMON_TEST_VARS.static.MONGO_CONNECT_OPTIONS)
COMMON_TEST_VARS.runtime.MONGO_CONNECTION = mongConn;

COMMON_TEST_VARS.runtime.schemas  =   require('./support/create-mqSchemas')(mongConn);
COMMON_TEST_VARS.runtime.theMqSchema =COMMON_TEST_VARS.runtime.schemas.usersMqSchema; // backward compatibility - will need remove/ use onl users - or whatever

const collectionName =  COMMON_TEST_VARS.runtime.theMqSchema.collectionName;
COMMON_TEST_VARS.runtime.ENDPOINT = subAppPoint + '/' + collectionName + '/'

  
module.exports = COMMON_TEST_VARS;
