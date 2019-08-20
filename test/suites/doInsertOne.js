"use strict";

const path = require('path')
//const COMMON_TEST_VARS = require('./common');
const COMMON_TEST_VARS = require('../../environment');
const chai = require('chai')
const expect = chai.expect;

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




it('(control test - work as expected) Insert document with self generated test data causes serialized MonqadeResponse  ', function(done) { 
    const candidateDoc =theMqSchema.createTestDocumentForInsert()
    const payload = { payload:{candidateDoc}};
    const s = JSON.stringify(payload);    

    requester.post(ENDPOINT)
    .set('content-type', 'application/json')
    .send(payload)
        .then(response=>{
            expectedMonqadeResponse(response);
            done();
        }).catch(unknownError=>{
            done(unknownError);
        })
});
    it('validation error - requires schema specific testing -- "MongooseValidationError"   ', function(done) { 
        
        const candidateDoc =theMqSchema.createTestDocumentForInsert()
        if(! ( 'someDate' in candidateDoc) )  {
            this.test.title = 'Test not valid for this schema, skipping... ' + this.test.title;
            this.test.skip();

        }

        candidateDoc['someDate']='not a date';
        const payload = { payload:{candidateDoc}};
        const s = JSON.stringify(payload);    
       requester.post(ENDPOINT)
       .set('content-type', 'application/json')
       .send(payload)
            .then(response=>{
                expected400response(response, 'MongooseValidationError', ' \'undefined\' document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
   });
   it(` Insert 'undefined' document causes 'EmptyCandidateDoc' `, function(done) { 
        const insertDoc= undefined;
        
        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({payload:{ candidateDoc:insertDoc}})
            .then(response=>{
                expected400response(response, 'EmptyCandidateDoc', ' \'undefined\' document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
    });
    it(`no 'payload'  causes 'NoPayloadFound' -400  `, function(done) { 
        //const insertDoc= undefined;
        
        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({payloadx:{ }})
            .then(response=>{
                expected400response(response, 'NoPayloadFound', ' \'undefined\' document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
    });
    it(`misplaced payload 1) within another object  causes 'NoPayloadFound' -400  `, function(done) { 
        //const insertDoc= undefined;
        const candidateDoc =theMqSchema.createTestDocumentForInsert()
        
        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({package:{payload:{candidateDoc} }})
            .then(response=>{
                expected400response(response, 'NoPayloadFound', ' \'undefined\' document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
    });
    it(`misplaced payload 2) malformed payload  causes 'EmptyCandidateDoc' -400  `, function(done) { 
        //const insertDoc= undefined;
        const candidateDoc =theMqSchema.createTestDocumentForInsert()
        
        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({payload:{package:{candidateDoc} }})
            .then(response=>{
                expected400response(response, 'EmptyCandidateDoc', ' \'undefined\' document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
    })
        
        
    it('Insert document with self generated test data causes serialized MonqadeResponse  ', function(done) { 
        const candidateDoc =theMqSchema.createTestDocumentForInsert()
        
        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({ payload:{candidateDoc}})
            .then(response=>{
                expectedMonqadeResponse(response);
                done();
            }).catch(unknownError=>{
                done(unknownError);
            })
    });

    it('Wrong http (patch->update) method cause 404 error. ', function(done) { 
        const candidateDoc =theMqSchema.createTestDocumentForInsert()
        requester.patch(ENDPOINT)
        .set('content-type', 'application/json')
        .send({ payload:{candidateDoc}})
            .then(response=>{
                expect(response.status).to.equal(400); 
                done();
            }).catch(unknownError=>{
                done(unknownError);
            })
    });

    it(`Insert preexisting document causes 'InsertSystemPathsForbidden' `, function(done) { 
        const insertDoc = testRecordSet.pop();
        
        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({ payload:{candidateDoc:insertDoc}})
            .then(response=>{
                expected400response(response, 'InsertSystemPathsForbidden', ' preexisting document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
    });
    it(`Insert  document with some/any systemID causes 'InsertSystemPathsForbidden' `, function(done) { 
        const insertDoc = testRecordSet.pop();
        // 
        delete insertDoc['_id'];
        delete insertDoc['createdAt'];
        delete insertDoc['updatedAt'];

        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({ payload:{candidateDoc:insertDoc}})
            .then(response=>{
                expected400response(response, 'InsertSystemPathsForbidden', ' preexisting document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
    });
    

    // it.skip(`Insert document with bad data-typing causes 'MongooseValidationError' (requires schema specific  - knowledge ) `, function(done) { 
    //     `Test requires specific knowledge of underlying schema data types. 
    //         Need to know the path datatype then find a suitable 'wrong' datatype
    //         Maybe at some later time - will write 'swapDataType' routine - 
    //         not today.   
    //     `

    //     const insertDoc=    theMqSchema.createTestDocumentForInsert()
    //     insertDoc['idxBucket'] = new Date();
    //     //const insertDoc = {idxBucket: new Date()};
    //     chai.request(MONQADE_HOST)
    //     .post(ENDPOINT)
    //     .set('content-type', 'application/json')
    //     .send({ candidateDoc:insertDoc})
    //         .then(response=>{
    //             expected400response(response, 'MongooseValidationError', 'Wrong datatype ')
    //             done();
    //         }).catch(otherError=>{
    //             console.log(otherError)
    //             done(otherError);
    //         })
    // });
    it(`Insert empty '{}' document causes 'EmptyCandidateDoc' `, function(done) { 
        const insertDoc = {}
        requester.post(ENDPOINT)
        .set('content-type', 'application/json')
        .send({payload:{ candidateDoc:insertDoc}})
            .then(response=>{
                expected400response(response, 'EmptyCandidateDoc', ' \'undefined\' document ')
                done();
            }).catch(otherError=>{
                console.log(otherError)
                done(otherError);
            })
    });

it('skipping it',() => {
}); // 

after(function(done){
    done();
})
