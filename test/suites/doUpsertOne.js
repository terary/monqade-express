"use strict";

const path = require('path')

//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../../environment');

const chai = require('chai');
const expect = chai.expect;

const expectedResponses = require('../support/expectedResponses')
const expected400response = expectedResponses.expected400response;
const expectedMonqadeResponse = expectedResponses.expectedMonqadeResponse;

let requester, ENDPOINT, uniqueForeignIDPathName;// = chai.request(app).keepOpen()

before(function(){
    console.log('\t*starting', `(${path.basename(__filename)})`)
    requester = COMMON_TEST_VARS.runtime.requester;
    theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
    testRecordSet= COMMON_TEST_VARS.runtime.testRecordSet;
    ENDPOINT = COMMON_TEST_VARS.runtime.ENDPOINT ;
    // uniqueForeignIDPathName this never gets set
    //  need to figure out how to test if schema has uni or not
    //  skip or?  Probably best to have two tests instead of logic in
    //  one test to handle two conditions

    ENDPOINT +=  'doUpsertOne/';
})


it(`Control test - works as expected Upsert with test data results in http status 200, MonqadeResponse  `, function(done) { 
    const updateDocument =Object.assign({},testRecordSet.pop(), theMqSchema.createTestDocumentForInsert() ) 
    const payload = {payload:{ candidateDoc:updateDocument}};

    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send({payload:{ candidateDoc:updateDocument}})
        .then(response=>{
            const s = JSON.stringify(response);
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
it(`Malformed package object results in 400 'NoPayloadFound'`, function(done) { 
    
    const updateDocument =Object.assign({},testRecordSet.pop(), theMqSchema.createTestDocumentForInsert() ) 
    const str = JSON.stringify(updateDocument);
    const payload = {package:{payload:{ candidateDoc:updateDocument}}};

    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expected400response(response, 'NoPayloadFound', '"package" malformed')
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })

});

it('Upsert document with foreign identifiers  http status 200   ', function(done) { 
    const updateDocument =Object.assign({},testRecordSet.pop(), theMqSchema.createTestDocumentForUpdate() ) 
    const x=uniqueForeignIDPathName;
    theMqSchema.getPathNamesSystem().forEach(pathID=>{
        delete updateDocument[pathID];
    });
    const payload = {payload:{ candidateDoc:updateDocument}} 

    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            if (uniqueForeignIDPathName ){
                expectedMonqadeResponse(response);
            }else {
                expected400response(response, 'MissingOrInvalidDocumentIDs', 'No unique document  identifiers ')
            }

            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('Upsert document with no unique identifiers results in http status 400, MonqadeError.cod=\'MissingOrInvalidDocumentIDs\'  ', function(done) { 
    const updateDocument =Object.assign({},testRecordSet.pop(), theMqSchema.createTestDocumentForUpdate() ) 
    delete updateDocument[uniqueForeignIDPathName];
    theMqSchema.getPathNamesSystem().forEach(pathID=>{
        delete updateDocument[pathID];
    });
    const payload = {payload:{ candidateDoc:updateDocument}}

    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expected400response(response, 'MissingOrInvalidDocumentIDs', 'No unique document  identifiers ')
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('Upsert document with mongo identifiers  http status 200   ', function(done) { 
    const updateDocument =Object.assign({},testRecordSet.pop(), theMqSchema.createTestDocumentForUpdate() ) 
    delete updateDocument[uniqueForeignIDPathName];
    const payload = {payload:{ candidateDoc:updateDocument}};

    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            //expected400response(response, 'MissingOrInvalidDocumentIDs', 'No unique document  identifiers ')
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Upsert a document with mongoose/mongo error has _originalError  http status 400, MonqadeError.code = 'MongooseOtherError'   `, function(done) { 
    const updateDocument =Object.assign({},testRecordSet.pop(), theMqSchema.createTestDocumentForUpdate() ) 
    const requiredPathID = theMqSchema.getPathNamesRequired().pop(); 
    updateDocument[requiredPathID] = null;

    const payload={payload:{ candidateDoc:updateDocument}}
    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expected400response(response, 'MongooseOtherError', `Setting pre-existing document's required path to null` );
            expect(response.body.MonqadeError._originalError).not.to.be.null;
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
