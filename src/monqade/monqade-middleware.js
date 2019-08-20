/* cSpell:ignore monqade */

"use strict";

/** @module monqade-middleware */

/**
 * Follows express's middleware pattern with two notable exceptions:
 * * Function(req,res,next, MonqadeSchema) - fourth parameter MqSchema
 * * Terminating middleware - function(req,res,mqSchema) - no next
 */

const MonqadeShared = require('monqade-shared');
const MonqadeError = MonqadeShared.MonqadeError;


/**
 * Assures payload will be in 'res.local.monqadePayload'. Regardless of http method (GET, POST, PATCH, etc) 
 * 
 * * Will write res.local.monqadePayload only if  res.local.monqadePayload is undefined
 * * Safe to be added to middleware stack many times
 * * Creating res.local.monqadePayload outside of this middleware will cause this middleware to have no effect. 
 * 
 * Basically, the write once feature allows this middleware to be added earlier in the middleware stack 
 * to accommodate other middleware that will require the payload.
 * 
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {Function} next - from caller
 * @param {MonqadeSchema} mqSchema - The monqade schema associated with this  mini app.
 * @throws {MonqadeError} MonqadeError with code=JsonParseFailure  if payload can not be found
 * @static
 */
const extractPayloadOrDie = (req, res, next, mqSchema  )=>{
    if(res.locals.monqadePayload !== undefined){
        next(); // Do this once.  Safe to call middleware many times.
    }

    const payloadTemplate = {payload: {
        candidateDoc:undefined,  // only can be simple {key1:val1,key2:val2,...}
        projection:undefined, 
        queryOptions:undefined, 
        query:undefined   // can be complex: {pathID:[{$lt:high_val},{$gt:low_val}]}
    }};

    if(req.body.payload){

        res.locals.monqadePayload =  Object.assign({},payloadTemplate.payload,req.body.payload); 
        //req.monqadePayload =  Object.assign({},payloadTemplate.payload,req.body.payload); 
        return next();
    }
    if(req.params.payload){
        try{  // try to catch JSON.parse issues, and not payload issues
            const pload = JSON.parse(req.params.payload);
            if(pload.payload){
                //req.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload.payload); 
                res.locals.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload.payload); 
            } else {
                // req.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload); 
                res.locals.monqadePayload =  Object.assign({}, payloadTemplate.payload, pload); 

            }
            return next();
        }catch(e){
            const mqError = new MonqadeError('JsonParseFailure',`Could not parse json for 'payload'`,e )
            return terminateMonqadeError(req,res,mqError);  //
        }
    }

    const mqError = new MonqadeError('NoPayloadFound',`Could not extract payload from either GET string or request body` )
    terminateMonqadeError(req,res,mqError);
}
module.exports.extractPayloadOrDie = extractPayloadOrDie;




/**
 * doInsertOne should disallow system paths 
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {Function} next - from caller
 * @param {MonqadeSchema} mqSchema - The monqade schema associated with this  mini app.
 * @static
 */
const terminateIfSystemPathsDetected = (req,res,next, mqSchema) =>{
    const payload = req.body.payload || {}; // don't care about payload, want its contents
                                            // if contents (candidateDoc) does not exist, reject
    const candidateDoc = payload.candidateDoc;
    
    if(!candidateDoc || candidateDoc === undefined){
        return next(); // let down-stream deal with this.
    }

    let containsSystemPaths = false; 

    mqSchema.getPathNamesSystem().forEach(pathID=>{
        if(candidateDoc[pathID]){
            containsSystemPaths = true;
        }
    });

    if(containsSystemPaths){
        const mqError = new MonqadeError('InsertSystemPathsForbidden', 
                                        `System Paths are assigned by system.  Can not insert. Likely 'doUpdateOne' is intended` )
        terminateMonqadeError(req,res,mqError)
        return; // prevent error from being reported in log or screen 

    }else{
        next()
        return;
    }

}
module.exports.terminateIfSystemPathsDetected  = terminateIfSystemPathsDetected; 

//----------------------------- terminals ----------------------------------------------
/**
 * Basically "Hello world" - testing/debug  
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {MonqadeSchema} mqSchema - The monqade schema associated with this  mini app.
 * @static
 */
const echo = (req,res,mqSchema)=>{ // terminal -- will not call next
    res.end('Monqade says hello from: ' + mqSchema.collectionName);
}
module.exports.echo = echo;

/**
 * Sends http status 500 and error
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {Error} unknownError - general error
 * @static
 */
const terminateUnknownError500 = (req,res,unknownError) => {
    //debug
    res.status(500).send({error:unknownError});

}
module.exports.terminateUnknownError500 =terminateUnknownError500; 


/**
 * Sends http status 200 and response for Monqade webMethod
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {MonqadeResponse} mqResponse - response from performing Monqade webMethod
 * @static
 */
const terminateStandardMonqadeResponse  = (req,res,mqResponse)=>{
    res.json({MonqadeResponse:mqResponse}); 
}
module.exports.terminateStandardMonqadeResponse = terminateStandardMonqadeResponse;


/**
 * Forbidden access sent possible a consequence of attempting to access disabled webMethod
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @static
 */
const terminate403= (req,res) => { 
    res.status(403).send();
}
module.exports.terminate403 = terminate403;

/**
 * If MonqadeError - sends http status 400 and error- re-throw otherwise
 * @param {Object} req - from express
 * @param {Object} res - from express
 * @param {Error} mqError - error from performing Monqade webMethod
 * @throws {Error} - If Error paramter is not an Monqade error, will be re-thrown   
 * @static
 */
const terminateMonqadeError= (req,res,mqError) => {
    if(MonqadeShared.MonqadeErrorCodes[mqError.code]){
        res.status(400).json({MonqadeError:mqError});
    }else {
        throw(mqError); 
    }
}
module.exports.terminateMonqadeError =terminateMonqadeError ;
