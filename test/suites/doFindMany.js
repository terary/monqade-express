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

before(function(done){
    console.log('\t*starting', `(${path.basename(__filename)})`)
    requester = COMMON_TEST_VARS.runtime.requester;
    theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
    testRecordSet= COMMON_TEST_VARS.runtime.testRecordSet;
    ENDPOINT = COMMON_TEST_VARS.runtime.ENDPOINT ;
    ENDPOINT +=  'doFindMany/';
    done();

})

    
it('doFindMany control test - works as expected.  ', function(done) { 
    const searchCriteria = testRecordSet.pop() ;
    const projection = undefined;
    const queryOptions = undefined;
    const payload = {payload: { candidateDoc:searchCriteria, projection, queryOptions} };
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('#Count should return 1 document with key count.  ', function(done) { 
    const searchCriteria = testRecordSet.pop() ;
    const projection = undefined;
    const queryOptions = undefined;
    const payload = {payload: { candidateDoc:searchCriteria, projection, queryOptions} };
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    const ENDPOINT_COUNT =  COMMON_TEST_VARS.runtime.ENDPOINT + 'doFindManyCount/';

    requester.get(ENDPOINT_COUNT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const mqResponse = expectedMonqadeResponse(response);
            const count = mqResponse['_docs'][0]['count'];
            expect(count, ' finds exactly 1 with _id=... ').to.equal(1);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Empty '{}' document result in 400 MonqadeError.code== 'EmptyFindCriteria'  `, function(done) { 

    const searchCriteria = {};// testRecordSet.pop() ;
    const projection = undefined;
    const queryOptions = undefined;

    const payload ={payload: { candidateDoc:searchCriteria, projection, queryOptions} };

    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT+ payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'EmptyFindCriteria', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`'undefined' document result in 400 MonqadeError.code== 'EmptyCandidateDoc'  `, function(done) { 
    const searchCriteria = undefined; 
    const projection = undefined;
    const queryOptions = undefined;

    const payload ={payload: { candidateDoc:searchCriteria, projection, queryOptions} };
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'EmptyCandidateDoc', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});


it(`find document with some random 'searchable' set to value known to exist will result in MonqadeResponse  `, function(done) { 
    const searchCriteria = {};// testRecordSet.pop() ;
    const findPathName = theMqSchema.getPathNamesSearchable().pop();

    searchCriteria[findPathName] = testRecordSet.pop()[findPathName];

    const projection = undefined;
    const queryOptions = undefined;

    const payload ={payload: { candidateDoc:searchCriteria, projection, queryOptions} };
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Projection actual should be projection requested + system paths  `, function(done) { 
    const searchCriteria = {};// testRecordSet.pop() ;
    const findPathName = theMqSchema.getPathNamesSearchable().pop();
    searchCriteria[findPathName] = testRecordSet.pop()[findPathName];

    const projection = theMqSchema.getPathNamesProjectable().slice(0,2);
    const expectedProjection =[ ... new Set(  projection.concat(theMqSchema.getPathNamesSystem()).sort())]; 
    const queryOptions = undefined;

    const payload ={payload: { candidateDoc:searchCriteria, projection, queryOptions} };
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const mqResponse =expectedMonqadeResponse(response);
            const aDocument  = mqResponse['_docs'].pop();
            const effectiveProjection = Object.keys(aDocument).sort();
            expect(effectiveProjection,' effective projection should be projectable + system').to.deep.equal(expectedProjection);

            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});


it(`queryOption:limit should restrict number of documents to one (skipped, requires specific knowledge see notes)  `, function(done) { 

    `This test requires specific knowledge of the schema.`

    const findDocument = {};// testRecordSet.pop() ;
    const findPathName = theMqSchema.getPathNamesSearchable().pop();
    findDocument[findPathName] = testRecordSet.pop()[findPathName];

    const projection = undefined;
    const queryLimit = 1;
    const queryOptions = {limit:queryLimit};
    const findManyArgs = {
        candidateDoc:findDocument,
        //findDocument:findDocument,
        projection:projection,
        queryOptions: queryOptions
    };
    const payload = {payload: findManyArgs};
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

 
    requester.get(ENDPOINT+ payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const mqResponse= expectedMonqadeResponse(response);
            const theDocs = mqResponse['_docs'];
            expect(theDocs.length,'').to.be.at.most(queryLimit);

            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

after(function(done){
    console.log('\t*finished', `(${path.basename(__filename)})`)
        done();
})
