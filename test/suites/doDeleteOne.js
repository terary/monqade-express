"use strict";

const path = require('path');
//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../../environment');


const expectedResponses = require('../support/expectedResponses')
const expected400response = expectedResponses.expected400response;
const expectedMonqadeResponse = expectedResponses.expectedMonqadeResponse;

let requester, ENDPOINT;// = chai.request(app).keepOpen()

before(function(done){
    console.log('\t*set up', `(${path.basename(__filename)})`)

    requester = COMMON_TEST_VARS.runtime.requester;
    theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
    testRecordSet= COMMON_TEST_VARS.runtime.testRecordSet;
    ENDPOINT = COMMON_TEST_VARS.runtime.ENDPOINT ;
    done();


})

it('Should results in http status 200 - deleted specified document  (control test, all works as expected)', function(done) { 
    const candidateDoc = testRecordSet.pop() ;
    const payload ={payload: { candidateDoc} };
    
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
    const newEndPoint =ENDPOINT + payloadEncoded; 
    requester.delete(newEndPoint)
    .set('content-type', 'application/json')
    .send()
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })

});

it(`Should result in 400 'NoMatchingDocumentFound'  when non-matching 'updatedAt' system paths`, function(done) { 
    const candidateDoc = testRecordSet.pop() ;
    candidateDoc['updatedAt'] = new Date();

    const payload ={payload: { candidateDoc} };
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.delete(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .send()
        .then(response=>{
            expected400response(response, 'NoMatchingDocumentFound', 'wrong \'updatedAt\' ')
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
it(`Should result in 400 'MissingOrInvalidSystemPaths' -  delete without system paths `, function(done) { 
   const deleteDocument =testRecordSet.pop()
    theMqSchema.getPathNamesSystem().forEach(pathID=>{
        delete deleteDocument[pathID];
    });

    const payload = {payload:{ candidateDoc:deleteDocument} };
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.delete(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .send()
        .then(response=>{
            expected400response(response, 'MissingOrInvalidSystemPaths', 'Wrong datatype ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
it(`Should result in 400 'MissingOrInvalidSystemPaths' -  malformed '_id' `, function(done) { 
    const deleteDocument =testRecordSet.pop()

    deleteDocument['_id'] = 'This ain\'t no _id'
    const payload ={payload: { candidateDoc:deleteDocument}} ;
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.delete(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .send()
        .then(response=>{
            expected400response(response, 'MissingOrInvalidSystemPaths', 'Wrong datatype ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
it(`Should result in 400 'MongooseError' - malformed 'updatedAt' (date bad format) `, function(done) { 

    const deleteDocument =testRecordSet.pop()

    deleteDocument['updatedAt'] = 'This ain\'t no updated'
    const payload ={payload: { candidateDoc:deleteDocument}} ;
    const payloadEncoded = encodeURIComponent(JSON.stringify(payload))

    requester.delete(ENDPOINT + payloadEncoded)
    .set('content-type', 'application/json')
    .send()
        .then(response=>{
            expected400response(response, 'MongooseError', 'Wrong datatype ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

after(function(done){
    console.log('\t*tear-down', `(${path.basename(__filename)})`)
    done();
})
