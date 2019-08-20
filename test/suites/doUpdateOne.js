"use strict";

//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../../environment');

const path = require('path')


const expectedResponses = require('../support/expectedResponses')
const expected400response = expectedResponses.expected400response;
const expectedMonqadeResponse = expectedResponses.expectedMonqadeResponse;


let requester, ENDPOINT;// = chai.request(app).keepOpen()

before(function(){
    console.log('\t*starting', `(${path.basename(__filename)})`)
    requester = COMMON_TEST_VARS.runtime.requester;
    theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
    testRecordSet= COMMON_TEST_VARS.runtime.testRecordSet;
    ENDPOINT = COMMON_TEST_VARS.runtime.ENDPOINT ;

})

it('Control test, (works as expected) Update document with self generated test data results in http status 200, MonqadeResponse  ', function(done) { 
    const testDoc = theMqSchema.createTestDocumentForUpdate();
    const updateDocument =Object.assign({},testDoc, testRecordSet.pop()) 
    const payload ={payload: { candidateDoc:updateDocument} } ;
    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it('Update document with malformed payload results in 400 \'NoPayloadFound\'  ', function(done) { 
    const updateDocument =Object.assign({},theMqSchema.createTestDocumentForUpdate(), testRecordSet.pop()) 
    const payload = { candidateDoc:updateDocument}  ;
    const s = JSON.stringify(payload);
    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expected400response(response, 'NoPayloadFound', 'Wrong datatype ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })

});

it('Update document with no effectual update results in http status 200, MonqadeResponse ', function(done) { 
    const updateDocument =testRecordSet.pop() 
    const payload ={payload: { candidateDoc:updateDocument} } ;

    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send( payload)
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Update without system paths result in 400 'MissingOrInvalidSystemPaths' `, function(done) { 
    const updateDocument =theMqSchema.createTestDocumentForUpdate();// Object.assign() 
    const payload ={payload: { candidateDoc:updateDocument} } ;

    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send( payload )
        .then(response=>{
            expected400response(response, 'MissingOrInvalidSystemPaths', 'Wrong datatype ')
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});


it(`Update with no updatable paths will result in 400 'EmptyCandidateDoc' `, function(done) { 
    const updateDocument =testRecordSet.pop();// Object.assign() 
    theMqSchema.getPathNamesUpdatable().forEach(pathID=>{
        delete updateDocument[pathID]
    });// same thing can be accomplished by creating record from testRecordSet  that contains only system paths 
    const payload ={payload: { candidateDoc:updateDocument} } ;

    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expected400response(response, 'EmptyCandidateDoc', ' No updatable paths ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Update with no system paths will result in 400 'MissingOrInvalidSystemPaths' `, function(done) { 
    const updateDocument =testRecordSet.pop();// Object.assign() 
    theMqSchema.getPathNamesSystem().forEach(pathID=>{
        delete updateDocument[pathID]
    })
    const payload ={payload: { candidateDoc:updateDocument} } ;

    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload )
        .then(response=>{
            expected400response(response, 'MissingOrInvalidSystemPaths', 'no system paths ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});


it(`Update with non-match 'updatedAt' path  result in 400 'NoMatchingDocumentFound' `, function(done) { 
    const updateDocument =Object.assign({},theMqSchema.createTestDocumentForUpdate(), testRecordSet.pop()) 
    updateDocument['updatedAt'] = new Date();
    const payload ={payload: { candidateDoc:updateDocument} } ;

    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload )
        .then(response=>{
            expected400response(response, 'NoMatchingDocumentFound', 'wrong \'updatedAt\' ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Update updatedAt ill formated no will result in 400 'MongooseOtherError' `, function(done) { 
    const updateDocument =Object.assign({},theMqSchema.createTestDocumentForUpdate(), testRecordSet.pop()) 
    updateDocument['updatedAt'] = 'This ain\'t no date';
    const payload ={payload: { candidateDoc:updateDocument} } ;

    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload )
        .then(response=>{
            expected400response(response, 'MongooseOtherError', 'wrong \'updatedAt\' ')
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Update with no system paths will result in 400 'MissingOrInvalidSystemPaths' `, function(done) { 
    const updateDocument =Object.assign({},theMqSchema.createTestDocumentForUpdate(), testRecordSet.pop()) 
    updateDocument['_id'] = 'This aint no ID';
    const payload ={payload: { candidateDoc:updateDocument} } ;

    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload )
        .then(response=>{
            expected400response(response, 'MissingOrInvalidSystemPaths', 'ill formatted  \'_id\' ')
            //expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Update without system paths result in 400 'MissingOrInvalidSystemPaths' `, function(done) { 
    const updateDocument =theMqSchema.createTestDocumentForUpdate();// Object.assign() 
    const payload = {payload:{ candidateDoc:updateDocument} };
    requester.patch(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expected400response(response, 'MissingOrInvalidSystemPaths', 'Wrong datatype ')
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

it(`Doing POST (insert) for update (PATCH) results in 400 'InsertSystemPathsForbidden'`, function(done) { 
    const testDoc = theMqSchema.createTestDocumentForUpdate();
    const updateDocument =Object.assign({},testDoc, testRecordSet.pop()) 
    const payload ={payload: { candidateDoc:updateDocument} } ;
    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expected400response(response, 'InsertSystemPathsForbidden', 'Wrong datatype ')
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});

after(function(){
    console.log('\t*finished', `(${path.basename(__filename)})`)

});
