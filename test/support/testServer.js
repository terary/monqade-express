"use strict";

const express = require('express');
const bodyParser = require('body-parser')

const MqProxyFactory = require('../..')
const mw =require('./middleware-echos')
const COMMON_TEST_VARS = require('../../environment');
const SUB_APP_MOUNT_POINT = COMMON_TEST_VARS.static.SUB_APP_MOUNT_POINT;// '/testing'




const app = express();
const mqApp = express();

app.use( bodyParser.json() );       //
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'PATCH, POST, GET, DELETE, OPTIONS');
  next();
});





const setupMonqadeStuff = ()=>{
	app.use(SUB_APP_MOUNT_POINT,mqApp);  // seems to need to be done here
									 	 // maybe something to do with parallel execution export etc



	//Demonstrate: Short and sweet - simply add new (creates new miniApp)
	const mqSchemaUsers = COMMON_TEST_VARS.runtime.schemas.usersMqSchema
	const MonqadeExpressProxyUsers = MqProxyFactory.getProxyServer( mqSchemaUsers,{echo:true, doUpsertOne:true });
	
	mqApp.use(MonqadeExpressProxyUsers.makeRouter())  // short hand
	

	// Demonstrate:  Add routes to preexisting app??  (add to preexisting app/miniap)
	const mqSchemaOrgs = COMMON_TEST_VARS.runtime.schemas.orgsMqSchema
	const MonqadeExpressProxyOrgs = MqProxyFactory.getProxyServer( mqSchemaOrgs);
	
	MonqadeExpressProxyOrgs.appendRoutesTo(mqApp)


	// Demonstrate: MonqadeMiddleware.  Silly echo - middleware 
	// MonqadeExpressProxyOrgs.use('echo', mw.echos.doEcho, mw.echos.doEcho2, mw.echos.doEcho3); 
	// MonqadeExpressProxyUsers.use('echo', mw.echos.doEcho, mw.echos.doEcho2, mw.echos.doEcho3); 
	MonqadeExpressProxyOrgs.use('echo', mw.doEcho, mw.doEcho2, mw.doEcho3); 
	MonqadeExpressProxyUsers.use('echo', mw.doEcho, mw.doEcho2, mw.doEcho3); 
                                              

	console.log('Schema Name',mqSchemaOrgs.collectionName, 'API URL: ',SUB_APP_MOUNT_POINT +'/' + mqSchemaOrgs.collectionName);
	console.log('Schema Name',mqSchemaUsers.collectionName, 'API URL: ',SUB_APP_MOUNT_POINT +'/' + mqSchemaUsers.collectionName);


	COMMON_TEST_VARS.runtime.mqProxies.usersMqProxy = MonqadeExpressProxyUsers; // future use
	COMMON_TEST_VARS.runtime.mqProxies.orgsMqProxy = MonqadeExpressProxyOrgs; // future use
  
}
setupMonqadeStuff();

  

module.exports = app; // server is for testing, chai will call 'listen'

