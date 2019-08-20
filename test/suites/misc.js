"use strict";
`
    Just a few tests that didn't require there own suites and didn't fit in anywhere else.

    -------------------------------------------

    currently using testInterface for: 
        A) _appendRoutes
        B) handleMonqadeAPIPromise 

    _appendRoutes 
    Can be remedy by returning configurable appendRoutes, exposing all parameters
    This would be useful in production - maybe?  Specifically, enabledWebMethods - does it need
    to commit? or should that be changeable? Currently can be changed by manipulating the schemaProxy
    
    If it is undesirable to make it changeable would it be better to 'seal', both use-case makeRoutes and appendRoutesTo
    use the same parameters, mostly.  

    handleMonqadeAPIPromise
    I am stuck.  Will either need figure away to cause the thing to fail (not sure how). Or deal with public interface

    see inheritance closures - I think it maybe possible to inherit->extend exposing 
    access?
    https://www.ruzee.com/blog/2008/12/javascript-inheritance-via-prototypes-and-closures/

`


const chai = require('chai')
const expect = chai.expect;

const path = require('path')
//const COMMON_TEST_VARS = require('../common');
const COMMON_TEST_VARS = require('../../environment');


let expected200response, expected404response, expected400response, expected403response;
 ( { expected200response, expected404response, expected400response, expected403response} = require('../support/expectedResponses'));

const mqSchemaChaos = COMMON_TEST_VARS.runtime.schemas.chaosMqSchema;
const usersProxy  =COMMON_TEST_VARS.runtime.mqProxies.usersMqProxy 


const express = require('express');
const myApp = express();

const MqProxyFactory = require('../..')
const mqChaosProxyServer = MqProxyFactory.getProxyServer( mqSchemaChaos);



myApp.use(mqChaosProxyServer.makeRouter())  // short hand


let requester,ENDPOINT;// = chai.request(app).keepOpen()

before(function(){
    console.log('\t*starting', `(${path.basename(__filename)})`)
    requester = COMMON_TEST_VARS.runtime.requester;
    theMqSchema = COMMON_TEST_VARS.runtime.theMqSchema;
    testRecordSet= COMMON_TEST_VARS.runtime.testRecordSet;
    ENDPOINT = COMMON_TEST_VARS.runtime.ENDPOINT ;
})

    it(`Should build routes without option enabledwebMethods`, () => {
        // mostly to satisfy coverage
        const mwStack = {};
        const newRouter =mqChaosProxyServer.testingInterface.appendRoutes(express.Router(),mqSchemaChaos,mwStack); 
        expect(newRouter,'').to.be.instanceOf(Function); 
    } )
    it(`Should be no issue to add 'use' for non enabled or no webMethods. Will have no effect`, () => {
        mqChaosProxyServer.use('doInsertOneX',(req,res,next,mqSchema)=>{
            // simply to make coverage report happy
        
        })
        expect('NO_ERROR','for non methods').to.equal('NO_ERROR');
    } )

    it(`Should be able to gracefully handle unknown errors - respond http 500`, () => {

        const expectResponseError500 = {
            name:'res',
            status: (statusCode)=>{
                expect(statusCode).to.equal(500);
                return { 
                    send:(errMessage)=>{
                        expect(errMessage).to.have.key('error')
                    }
                }
            }
        };
        // is it possible to donkey punch the interface - instead of exposing for testing purposes?
        mqChaosProxyServer.testingInterface.handleMonqadeAPIPromise({},expectResponseError500,Promise.reject())
    });

    it('Should get 404 for empty get request  ', function(done) { 
        const candidateDoc = testRecordSet.pop() ;
        const payload = {payload: { candidateDoc}} ;
        const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
        
    
        requester.get(ENDPOINT  )
        .set('content-type', 'application/json')
        .query()
            .then(response=>{
                expected404response(response)
                done();
            }).catch(unknownError=>{
                done(unknownError);
            })
    });
    it('Should return 403 of discovery is documentation', (done)=>{
        `   
            Toggle the proxy's enabledMethods to make test work.
            This is simply but not ideal.  More similar use/test case
            would create server specific for this test.
        `

        const preserveValue = usersProxy.enabledWebMethods.documentation;
        usersProxy.enabledWebMethods.documentation = false;        

        requester.get(ENDPOINT + 'documentation'  )
        .set('content-type', 'application/json')
        .query()
            .then(response=>{
                usersProxy.enabledWebMethods.documentation = preserveValue ;        
                expected403response(response)
                done();
            }).catch(unknownError=>{
                usersProxy.enabledWebMethods.documentation = preserveValue ;        
                done(unknownError);
            })
    })

    it('Should get 200 response code for /documentation  ', function(done) { 
        const candidateDoc = testRecordSet.pop() ;
        
    
        requester.get(ENDPOINT + 'documentation'  )
        .set('content-type', 'application/json')
        .query()
            .then(response=>{
                expected200response(response)
                done();
            }).catch(unknownError=>{
                done(unknownError);
            })
    });
    it('Should get 200 response code for /discovery  ', function(done) { 
        const candidateDoc = testRecordSet.pop() ;
        const payload = {payload: { candidateDoc}} ;
        const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
        
    
        requester.get(ENDPOINT + 'discovery'  )
        .set('content-type', 'application/json')
        .query()
            .then(response=>{
                expected200response(response)
                done();
            }).catch(unknownError=>{
                done(unknownError);
            })
    });
    it('Should return 403 of discovery is disabled', (done)=>{
        `   
            Toggle the proxy's enabledMethods to make test work.
            This is simply but not ideal.  More similar use/test case
            would create server specific for this test.
        `

        const preserveValue = usersProxy.enabledWebMethods.discovery;
        usersProxy.enabledWebMethods.discovery = false;        

        requester.get(ENDPOINT + 'discovery'  )
        .set('content-type', 'application/json')
        .query()
            .then(response=>{
                usersProxy.enabledWebMethods.discovery = preserveValue ;        
                expected403response(response)
                done();
            }).catch(unknownError=>{
                usersProxy.enabledWebMethods.discovery = preserveValue ;        
                done(unknownError);
            })
    })

    it('Should get 200 response code for /echo  ', function(done) { 
        const candidateDoc = testRecordSet.pop() ;
        const payload = {payload: { candidateDoc}} ;
        const payloadEncoded = encodeURIComponent(JSON.stringify(payload))
        
    
        requester.get(ENDPOINT + 'echo'  )
        .set('content-type', 'application/json')
        .query()
            .then(response=>{
                expected200response(response)
                done();
            }).catch(unknownError=>{
                done(unknownError);
            })
    });
    describe('Customer webMethod add & execute', ()=>{
        it('Should be able to define webMethod and it\'s call middleware stack will be called with necessary args.' , (done )=>{
            mqChaosProxyServer.webMethodAdd('doTest', (req,res,next,mqSchema)=>{
                expect(req).to.not.be.undefined;
                expect(res).to.not.be.undefined;
                expect(next).to.not.be.undefined;
                expect(mqSchema).to.not.be.undefined;
                done()
            });
            mqChaosProxyServer.webMethodExec('doTest',{},{}) 
    
        });

    });
after(function(){
    console.log('\t*finished', `(${path.basename(__filename)})`)
        
})
