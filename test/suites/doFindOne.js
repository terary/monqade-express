"use strict";

const path = require('path')
//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../../environment');

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
    done();
})

it('findOne document with test document http status 200, MonqadeResponse  ', function(done) { 
    const candidateDoc = testRecordSet.pop() ;
    const payload = {payload: { candidateDoc}} ;
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT  + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            const str = JSON.stringify(response.body);
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
    
it(`findOne with 'undefined' document result in 400 'EmptyCandidateDoc'  `, function(done) { 

    // const payload = { candidateDoc:undefined} ;
    const payload = {payload: { candidateDoc:undefined}} ;
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    
    // chai.request(MONQADE_HOST)
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

it(`findOne with empty '{}' document result in 400 'MissingOrInvalidDocumentIDs'  `, function(done) { 
    const  candidateDoc= {};
    const payload = {payload: { candidateDoc}} ;
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    
    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'MissingOrInvalidDocumentIDs', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});


it(`Should respond with 400 'MissingOrInvalidDocumentIDs' if the document IDs (system paths) are not supplied  `, function(done) { 
    const candidateDoc = testRecordSet.pop() ;
    theMqSchema.getPathNamesSystem().forEach(pathID=>{
        delete candidateDoc[pathID]
    });
    const payload = {payload:{ candidateDoc}} ;
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    
    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'MissingOrInvalidDocumentIDs', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Should respond 400 'MissingOrInvalidSystemPath' when using only  '{_id:...}' - all system paths are required `, function(done) { 
    const candidateDoc ={_id:testRecordSet.pop()['_id'] };
    const payload ={payload: { candidateDoc}}
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'MissingOrInvalidSystemPaths', "'undefined' query ")
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Should response 400 when using invalid formats( ill formatted 'updatedAt') `, function(done) { 
    const candidateDoc = testRecordSet.pop();
    candidateDoc['updatedAt'] ="This ain't no date";

    const payload = {payload:{ candidateDoc}};
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.get(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .query()
        .then(response=>{
            expected400response(response, 'MongooseError', "'undefined' query ")
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Should respond 400 'NoMatchingDocumentFound' if updatedAt is not accurate (and all other system fields are ok)  `, function(done) { 
      const candidateDoc = testRecordSet.pop();
      candidateDoc['updatedAt'] = new Date();
      const payload = {payload:{ candidateDoc}};
      const s = JSON.stringify(payload);
      const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
  
      requester.get(ENDPOINT + payloadEncoded)
      .set('content-type', 'application/json')
      .query()
          .then(response=>{
             expected400response(response, 'NoMatchingDocumentFound', "'undefined' query ")
              //expectedMonqadeResponse(response);
              done();
          }).catch(unknownError=>{
              done(unknownError);
          })
  });

after(function(done){
    console.log('\t*finished', `(${path.basename(__filename)})`)
        done();
})
