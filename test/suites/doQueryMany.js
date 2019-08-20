"use strict";

const path = require('path')

//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../../environment');

const chai = require('chai');
const expect = chai.expect;

const expectedResponses = require('../support/expectedResponses')
const expected400response = expectedResponses.expected400response;
const expectedMonqadeResponse = expectedResponses.expectedMonqadeResponse;

let requester,ENDPOINT;// = chai.request(app).keepOpen()

before(function(){
    console.log('\t*starting', `(${path.basename(__filename)})`)
    requester = COMMON_TEST_VARS.runtime.requester;
    theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
    testRecordSet= COMMON_TEST_VARS.runtime.testRecordSet;
    ENDPOINT = COMMON_TEST_VARS.runtime.ENDPOINT ;  
    ENDPOINT +=  'doQueryMany/';
})



it('doQueryMany control test - works as expected.  ', function(done) { 
    const testRecord = testRecordSet.pop();
    const queryPathName = theMqSchema.getPathNamesSearchable().pop();

    const payload = {payload:{
        query:{
            [queryPathName]:testRecord[queryPathName]
        },
        queryOptions:{},
        projection:[]
    }};
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('doQueryManyCount control test - works as expected.  ', function(done) { 
    ` doQueryMany and doQueryManyCount - use mostly the same code. 
      scrub and validation is the same code.  
    `
    const testRecord = testRecordSet.pop();
    const queryPathName = theMqSchema.getPathNamesSearchable().pop();

    const payload = {payload:{
        query:{
            [queryPathName]:testRecord[queryPathName]
        },
        queryOptions:{},
        projection:[]
    }};
    const s = JSON.stringify(payload);
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    const ENDPOINT_COUNT =  COMMON_TEST_VARS.runtime.ENDPOINT + 'doQueryManyCount/';

    requester.get(ENDPOINT_COUNT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const mqResponse = expectedMonqadeResponse(response);
            const count = mqResponse['_docs'][0]['count'];
            expect(count, ' should find more than  ').to.be.gte(0);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('Should be able to handle complex queries.  ', function(done) { 
    const payload = {payload:{
        query:{
            $and:[{idxBucket:{$gt:0}},{idxBucket:{$lt:10}}]
        },
        queryOptions:{},
        projection:[]
    }};
    const s = JSON.stringify(payload);
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
it(`Should be reject complex queries with 'IllegalQueryOptionDetected' when then contain unknown paths  `, function(done) { 
    const payload = {payload:{
        query:{
            $and:[{idxBucket_x:{$gt:0}},{idxBucket:{$lt:10}}]
        },
        queryOptions:{},
        projection:[]
    }};
    const s = JSON.stringify(payload);
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            // expectedMonqadeResponse(response);
            expected400response(response, 'IllegalQueryOptionDetected', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
it(`Should be reject complex queries with 'IllegalQueryOptionDetected' when then contain unknown operator  `, function(done) { 
    const payload = {payload:{
        query:{
            $an:[{idxBucket:{$gt:0}},{idxBucket:{$lt:10}}]
        },
        queryOptions:{},
        projection:[]
    }};
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            // expectedMonqadeResponse(response);
            expected400response(response, 'IllegalQueryOptionDetected', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});


it(`doQueryMany with 'undefined' query results in 400 MonqadeError.code== 'EmptyCandidateDoc'  `, function(done) { 
    const payload = {payload:{
        query:undefined,
        queryOptions:{},
        projection:[]
    }};

    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'EmptyCandidateDoc', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`doQueryMany with no payload results in  400 'JsonParseFailure' `, function(done) { 
    requester.get(ENDPOINT)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'JsonParseFailure', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});



it(`doQueryMany with empty query results in 400 MonqadeError.code== 'EmptyFindCriteria'  `, function(done) { 
    const payload = {payload:{
        query:{},
        queryOptions:{},
        projection:[]
    }};

    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    
    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'EmptyFindCriteria', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('Actual default projection matches expected projection + system paths  ', function(done) { 

    const projectionPaths = undefined; // defaults to all paths isProjectable=true

    const expectedProjection =[ ... new Set(  theMqSchema.getPathNamesProjectable().concat(theMqSchema.getPathNamesSystem()).sort())]; 
    const testRecord = testRecordSet.pop();
    const queryPathName = theMqSchema.getPathNamesSearchable().pop();

    const payload = {payload:{
        query:{
            [queryPathName]:testRecord[queryPathName]
        },
        queryOptions:{},
        projection:projectionPaths
    }};

    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    //chai.request(MONQADE_HOST)
    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const mqResponse = expectedMonqadeResponse(response);
            const aDocument  =mqResponse['_docs'].pop();
            const effectiveProjection = Object.keys(aDocument).sort();
            expect(effectiveProjection,'effective projection should be projectable + system').to.deep.equal(expectedProjection);
            
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it ('Actual specified projection matches expected projection + system paths  ', function(done) { 

    const projectionPaths = [ // Get single pathID that is projectable and not system Path
            theMqSchema.getPathNamesProjectable()
            .filter( p=>{ return theMqSchema.getPathNamesSystem().indexOf(p) ===-1 })
            .pop()
        ];    
    const expectedProjection =[ ... new Set(  projectionPaths.concat(theMqSchema.getPathNamesSystem()).sort())]; 

    const testRecord = testRecordSet.pop();
    const queryPathName = theMqSchema.getPathNamesSearchable().pop();
    const payload = {payload:{
        query:{
            [queryPathName]:testRecord[queryPathName]
        },
        queryOptions:{},
        projection:projectionPaths
    }};

    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    //chai.request(MONQADE_HOST)
    requester.get(ENDPOINT + payloadEncoded )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const mqResponse =  expectedMonqadeResponse(response);
            const aDocument  = mqResponse['_docs'].pop();
            const effectiveProjection = Object.keys(aDocument).sort();
            expect(effectiveProjection,' effective projection should be projectable + system').to.deep.equal(expectedProjection);
            
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it (`Bad JSON (unencoded payload) should result in MonqadeError.code 'JsonParseFailure' http status 400  `, function(done) { 
    const projectionPaths =  [theMqSchema.getPathNamesProjectable().pop()]
    const expectedProjection =[ ... new Set(  projectionPaths.concat(theMqSchema.getPathNamesSystem()).sort())]; 

    const testRecord = testRecordSet.pop();
    const queryPathName = theMqSchema.getPathNamesSearchable().pop();
    const payload = {payload:{
        query:{
            [queryPathName]:testRecord[queryPathName]
        },
        queryOptions:{},
        projection:[]
    }};
    
    requester.get(ENDPOINT + payload )
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'JsonParseFailure', " bad json ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});



after(function(){

    console.log(` maybe can rework this in MiddlewareStack
    give up hope of using Schema neutral testing`);
    console.log('\t*finished', `(${path.basename(__filename)})`)

})
