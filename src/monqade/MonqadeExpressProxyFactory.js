/* cSpell:ignore monqade */
"use strict";

const express = require('express');

const mmw = require('./monqade-middleware');
const discovery = require('./discovery')
const documentation = require('./documentation')
const MonqadeShared = require('monqade-shared');
const MonqadeError = MonqadeShared.MonqadeError;
const MiddlewareStack = require('./MiddlewareStack');


const enabledWebMethodsDefault = {
    echo:1 ,
    doInsertOne:1,
    doUpdateOne:1,
    doUpsertOne:undefined,  // use with caution 
    doDeleteOne:1, 
    doFindOne:1,
    doFindMany:1,
    doFindManyCount:1,
    doQueryMany:1,
    doQueryManyCount:1,
    discovery:1,
    documentation:true

}

const falsy = (v)=>{
    return (v && v !==undefined && v !=='' && v !==null) ? false:  true ;
}
const truthy = (v)=>{return !falsy(v);}


/** @module MonqadeExpressProxy */


 /**
 * Specialized middleware - terminates by sending appropriate response. No next()
 * @private
 * @param {Object} req - request from express
 * @param {object} res - response for express
 * @param {Promise} apiCallPromise - returned from a Monqade function call
 * @returns {void}
 */
const _handleMonqadeAPIPromise = (req, res, apiCallPromise)=>{
    apiCallPromise
    .then(mqResponse=>{
        mmw.terminateStandardMonqadeResponse(req,res,mqResponse);
    }).catch(mqError=>{
        //todo: does the 'unknown' error work? 
        //- I think it may work because terminate throws error
        //todo: test this to see that it works as expected
        mmw.terminateMonqadeError(req,res,mqError);
    }).catch(unknownError=>{
        mmw.terminateUnknownError500(req,res,unknownError); 
    });

}


/**
 * Calls the MonqadeSchema function, control handed over to promise handler
 * @private
 * @param {Object} req - request from express
 * @param {object} res - response for express
 * @param {MonqadeSchema} mqSchema - to be used to perform the function
 * @param {String} fnName - function to perform.
 * @returns {void}
 */
 const _doMonqadeCall= (req,res,mqSchema, fnName) => { //fnName: doUpdateOne, doDeleteOne, etc ...

    let candidateDoc,projection,queryOptions; 
    let query;

    ({ query, projection, queryOptions, candidateDoc} = res.locals.monqadePayload);

    if( fnName=='doQueryMany' || fnName=='doQueryManyCount'  ) {
        candidateDoc = query;
    }

    if(!candidateDoc){
        return mmw.terminateMonqadeError(req,res,new MonqadeError('EmptyCandidateDoc',`Could not parse json for 'payload'` ));
    } 
    
    const thePromise =mqSchema[fnName](candidateDoc,projection,queryOptions);
    _handleMonqadeAPIPromise(req,res,thePromise)    
}


 /**
 * Bind schema functions to express routes
 * @private
 * @param {Object} subApp - from express() or express.Route()
 * @param {MonqadeSchema} mqSchema - to be used to perform the function
 * @param {MiddlewareStack} mwStack - middleware stack
 * @param {Object} enabledRoutes - in the form {[Monqade.function]:true, doInsertOne:false, etc... }
 * @returns {subApp} modified subApp passed in
 * @description
 * **Caution Mutant** the subApp passed in will be modified with the new routes
 */
 const _appendRoutes = (subApp,mqSchema,mwStack, enabledRoutes = enabledWebMethodsDefault)=>{
    const baseURI = '/' + mqSchema.collectionName;   // prepend slash  no trailing slash

    // enabledRoutes/enabledMethods -> for webMethods they'll automatically terminate with '403 restricted access'
    // .. For the non-web methods need to manually set to terminate 403

    subApp.get(baseURI+ '/documentation', function(req, res) {
        enabledRoutes['documentation'] 
            ? res.send( documentation.describe( mqSchema)) 
            :  mmw.terminate403(req,res);  

    });
    subApp.get(baseURI+ '/discovery', function(req, res) {
        (enabledRoutes['discovery']) 
            ? res.send(JSON.stringify(discovery.discovery( mqSchema,enabledRoutes))) 
            : mmw.terminate403(req,res); 

    });

    subApp.get(baseURI+ '/echo', function(req, res) {           //first hard coded routs
        mwStack['echo'].execute(req,res,mqSchema);  
    });

    subApp.post(baseURI+'/doUpsertOne', function(req, res) {
        mwStack['doUpsertOne'].execute(req,res,mqSchema);
    })

    subApp.get(baseURI+'/doFindManyCount/:payload', function(req, res) {
        mwStack['doFindManyCount'].execute(req,res,mqSchema);
    })
    subApp.get(baseURI+'/doFindMany/:payload', function(req, res) {
        mwStack['doFindMany'].execute(req,res,mqSchema);
    })

    subApp.get(baseURI+'/doQueryManyCount/:payload', function(req, res) {  
        // url /some/thing/doQueryMany/  <--- matches --> /some/thing/{param}/   
        // url /some/thing/doQueryMany  <--- matches --> /some/thing/{param}/   
        // url /some/thing/doQueryMany/anything  <--- matches --> /some/thing/doQueryMany/{param}/   
        mwStack['doQueryManyCount'].execute(req,res,mqSchema);
    })

    subApp.get(baseURI+'/doQueryMany/:payload', function(req, res) {  
        // url /some/thing/doQueryMany/  <--- matches --> /some/thing/{param}/   
        // url /some/thing/doQueryMany  <--- matches --> /some/thing/{param}/   
        // url /some/thing/doQueryMany/anything  <--- matches --> /some/thing/doQueryMany/{param}/   
        mwStack['doQueryMany'].execute(req,res,mqSchema);
    })

    subApp.patch(baseURI, function(req, res) {
        mwStack['doUpdateOne'].execute(req,res,mqSchema);
    })

    subApp.post(baseURI, function(req, res) {
        mwStack['doInsertOne'].execute(req,res,mqSchema); 
    })
    subApp.delete(baseURI+'/:payload', function(req, res) {
        mwStack['doDeleteOne'].execute(req,res,mqSchema);
    })
    
    subApp.get(baseURI+'/:payload', function(req, res) {
        `not thoroughly tested (or thought out)`
        mwStack['doFindOne'].execute(req,res,mqSchema);
    })

    subApp.get(baseURI, function(req, res) {  // this never hits, conflicts with route for doFindOne
        res.status(404).send("page not found").end();
        return; // <-- this is  bad idea
    })

    return subApp;
}
/**
 * Returns factory of MonqadeProxy.
 * MonqadeProxy is a adapter sort of pattern - converting Express outputs into Monqade inputs 
 * and Monqade outputs into Express inputs, more-or-less.
 * @function
 * @name MonqadeProxyFactory
 * @param {MonqadeSchema} mqSchema - Schema to bind to
 * @param {Object} enabledWebMethods - webMethods to include ( all will be included by default)
 * @returns {MonaqadeExpressProxy}
 * @example
 *      //usage:
 *      const MqProxyFactory = require('monqade-express');
 *      const mqProxy = MqProxyFactory.getProxyServer(mqSchema);
 *      expressApp.use(mqProxy.makeRouter())
 * 
 * 
 */
module.exports.getProxyServer=  (function (mqSchema, enabledWebMethods = {}){ 

    const _enabledWebMethods =Object.assign({}, enabledWebMethodsDefault, enabledWebMethods) ;

    const _webMethodExec= (webMethodName, req,res, mwStack)=>{
        mwStack[webMethodName].execute(req,res,mqSchema);
    }
    const _webMethodAdd = (webMethodName, ... fn) =>{
        middlewareStack[webMethodName] = new MiddlewareStack();
        middlewareStack[webMethodName].use( ... fn);
    }

    // public interface for
    const _use = (webMethodName, ... fn)=>{   
        if( truthy(_enabledWebMethods[webMethodName])){  // similar function as 'use'
            middlewareStack[webMethodName].use( ... fn);
        }
    };

    // build middleware stack for each web method
    const middlewareStack = {}
    Object.keys(enabledWebMethodsDefault).forEach( webMethodName => {
        middlewareStack[webMethodName] = new MiddlewareStack();

        if(truthy(_enabledWebMethods[webMethodName])) {
            if(webMethodName === 'echo'){
                middlewareStack[webMethodName].push(mmw.echo)
            }

            else {
                //specialized middleware to handle Monqade.do[function]
                middlewareStack[webMethodName].push(function(req,res){_doMonqadeCall(req,res,mqSchema,webMethodName)});
                middlewareStack[webMethodName].push( mmw.extractPayloadOrDie);
            }
        }else {
            middlewareStack[webMethodName].push(mmw.terminate403);
        }

    });

    // this will add regardless of enabled
    //could be done in fewer lines- but to demonstration purpose                  
    middlewareStack['doInsertOne'] = new MiddlewareStack();
    middlewareStack['doInsertOne'].push( 
                function(req,res){_doMonqadeCall(req,res,mqSchema,'doInsertOne')},
                mmw.terminateIfSystemPathsDetected,
                mmw.extractPayloadOrDie
            );

    return {
        /**
         * Appends mqSchema routes to the given express app.
         * @public
         * @param {app|express.Router()} subApp - the return from express() or Router();
         * @returns {subApp} modified input paramter - return not intended for use.
         * @example
         *      // mqSchema:MonqadeSchema Type
         *      const mqApp = express();
         *      const mqExpressProxy = require('monqade-express').getProxyServer(mqSchema);
         *      mqExpressProxy.appendRoutesTo(mqApp)
         * @instance
         */
        appendRoutesTo:   function(subApp){  // routes are appended to pre-existing router/app
            _appendRoutes(subApp,mqSchema,middlewareStack, _enabledWebMethods)
        },
      
      
        /**
         * Create express router with mqSchema routes
         * @public
         * @returns {subApp} router appropriate for app.use().
         * @example
         *      const mqApp = express();
         *      const mqExpressProxy = require('monqade-express').getProxyServer(mqSchema);
         *      mqApp.use(mqExpressProxy.makeRouter())
         * @instance
         */
        makeRouter: function(){ // generates new app/router appropriate for express.use()
            return _appendRoutes(express.Router(), mqSchema, middlewareStack, _enabledWebMethods);
        }, 

        /**
         *  - for the time being - same thing that was passed it.
         * @ignore 
         */
        enabledWebMethods: _enabledWebMethods,

        /**
         * Pre webMethod functionality.  Similar to middleware.  Suitable for preparing document
         * 
         *  * Add MonqadeMiddleware (most same as express) to the middleware stack/queue
         *  * Need to specify appropriate Monqade function: doInsertOne, doQueryMany, etc ... 
         *  * See MonqadeMiddleware for more details
         *  * Internally treated as stack, first in - last to execute.  
         *  * Externally presented as a queue (to be consistent with express).
         *  * 'use' is the only exposed method for mwStack manipulation. Effectively - 'enqueue' middleware function
         * 
         * for webMethod call.  System assigned values, restrict or augment search criteria, etc.
         * @public
         * @param {string} webMethodName - One of MonqadesExpresses webMethods (echo, doInsertOne, doSearchMany, ...)
         * @param {function[]} middlewareFunction - The function to execute, (need to define the template function(req,res,next, mqSchema)->... next())
         * @returns {void}
         * @example
         * example
         *           
         *        const mwExample = (req,res,next,mqSchema)=>{do stuff; next()}
         *        const mqExpressProxy = require('monqade-express').getProxyServer(mqSchema);
         * 
         *        mqExpressProxy.use('doInsertOne', mwExample); 
         * 
         *      ** It pushes onto stack. Order is important!
         * 
         * @instance
         * 
         */
        use: function(mqWebMethod,  ...middlewareFunction){_use(mqWebMethod, ...middlewareFunction)},

        webMethodAdd: _webMethodAdd,
        webMethodExec: function(webMethodName,req,res){_webMethodExec(webMethodName,req,res,middlewareStack)},

        testingInterface: {
            handleMonqadeAPIPromise:_handleMonqadeAPIPromise,
            appendRoutes: _appendRoutes
        }
  } 
});
