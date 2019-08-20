"use strict";

/**
 * Basically format mqSchema as JSON - nothing magical, no side effects.
 * Focus on webMethods and what services this API offer
 * @ignore
 */
const pathOptionToJSON = pathOptions =>{
    
    const dataType = (pathOptions.isSystem)? 'system' :  pathOptions['type'];    

    const disc = {
        pathID: pathOptions['name'],
        label: pathOptions['label'] || pathOptions['name'],
        required: pathOptions['isRequired'],
        type: dataType,
        notes: pathOptions['notes'],
        pathID: pathOptions['name'],
    };

    if (pathOptions['maxlength'] && pathOptions['maxlength'] !=='' ){
        disc['max'] = pathOptions['maxlength'];    
    }
    if (pathOptions['minlength'] && pathOptions['minlength'] !=='' ){
        disc['min'] = pathOptions['minlength'];    
    }
    if (pathOptions['max'] && pathOptions['max'] !=='' ){
        disc['max'] = pathOptions['max'];    
    }
    if (pathOptions['min'] && pathOptions['min'] !=='' ){
        disc['min'] = pathOptions['min'];    
    }


return  disc;
}


const pathsToJSON = (mqSchema,pathIDs) =>{
    const pathsJSON = {};
    pathIDs.forEach(pathID=>{
        const opts = mqSchema.getPathOptions(pathID);
        pathsJSON[pathID] =pathOptionToJSON( opts);  
    })
    return pathsJSON;
}

const webMethodToJSON = (method, endpoint, responseType, argument )=>{
    return {
        method:method,  //post|get|delete etc
        endpoint:endpoint, 
        responseType:responseType,
        argumentPathNames:argument
    };

}

const webQueryToJSON = (method, endpoint, responseType, searchablePaths, queryOptions)=>{
    return {
        method:method,  //post|get|delete etc
        endpoint:endpoint, 
        responseType:responseType,
        argumentPathNames:searchablePaths,  // backwards compatability 
        queryOptions:queryOptions

    };

}

const discovery = (mqSchema, enabledWebMethods)=>{

    const webMethods = {}
    const qOptions = {limit:'number'};
    const nonWebMethodEndpoints = [];

    Object.keys(enabledWebMethods).forEach( webMethod=> {

        switch(webMethod){
            case 'doInsertOne' : 
                const insertablePaths = mqSchema.getPathNamesInsertable()
                    .filter(pathID=>{ return mqSchema.getPathNamesSystem().indexOf(pathID) == -1});
                webMethods['doInsertOne']= webMethodToJSON('POST','','MonqadeResponse',insertablePaths)
                break;

            case 'doUpdateOne' : 
                const updateOnePathIDs = mqSchema.getPathNamesSystem().concat(mqSchema.getPathNamesUpdatable());
                webMethods['doUpdateOne']= webMethodToJSON('PATCH','', 'MonqadeResponse', updateOnePathIDs)
                break;

            case 'doDeleteOne' : 
                const deleteOnePathIDs = mqSchema.getPathNamesSystem()
                webMethods['doDeleteOne']= webMethodToJSON('DELETE','','MonqadeResponse',deleteOnePathIDs)
                break;

            case 'doFindOne' :
                const findOnePathIDs = mqSchema.getPathNamesSystem()
                webMethods['doFindOne']= webMethodToJSON('GET','','MonqadeResponse',findOnePathIDs)
                break;

            case 'doUpsertOne':
                webMethods['doUpsertOne']= webMethodToJSON('POST','/doUpsertOne','MonqadeResponse', mqSchema.getPathNamesAll())
                break;

            case 'doFindMany' : 
                webMethods['doFindMany']= webQueryToJSON('GET','/doFindMany','MonqadeResponse', mqSchema.getPathNamesAll(), qOptions)
                webMethods['doFindManyCount']= webQueryToJSON('GET','/doFindManyCount','MonqadeResponse', mqSchema.getPathNamesAll(), qOptions)
                break;

            case 'doQueryMany' : 
                webMethods['doQueryMany']= webQueryToJSON('GET','/doQueryMany','MonqadeResponse', mqSchema.getPathNamesSearchable(), qOptions)
                webMethods['doQueryMany']= webQueryToJSON('GET','/doQueryManyCount','MonqadeResponse', mqSchema.getPathNamesSearchable(), qOptions)
                break;
            case 'discovery' : 
                nonWebMethodEndpoints.push('/discovery')
                break;

            case 'documentation' : 
                nonWebMethodEndpoints.push('/documentation')
                break;

            case 'echo' : 
                nonWebMethodEndpoints.push('/echo')
                break;

            default:
                // danger danger unknown enabled webMethod
                break; // <-- never stops being funny    
        } 

    })

    return {
            allPaths: pathsToJSON(mqSchema, mqSchema.getPathNamesAll()),
            searchablePathIDs: mqSchema.getPathNamesSearchable(),
            projectablePathIDs: mqSchema.getPathNamesProjectable(),
            
            notes:mqSchema.schemaDocumentation, 
            schemaVersion:mqSchema.schemaVersionKey,
            collectionName:mqSchema.collectionName,
            nonWebMethodLinks: nonWebMethodEndpoints, 
            webMethods:webMethods
        };
}
module.exports.discovery = discovery;

