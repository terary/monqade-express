"use strict";

const chai = require('chai')
const expect = chai.expect;

const mmw = require('../../src/monqade/monqade-middleware');
const MiddlewareStack = require('../../src/monqade/MiddlewareStack');
const fakeMqSchema = {name:'mqSchema',getPathNamesSystem:()=>{return ['_id','createdAt','updatedAt','schemaVersion']}};
const  fakeRes = {name:'res', locals:{}}, fakeReq = {name:'req'};
let execLog = [];

const f1 = (req,res,next,mqSchema) => {
    execLog.push('f1')
    next();    
}
const finished = (req,res,next,mqSchema) => {
    execLog.push('finished')
    //return; // just doing nothing.
}

const expectResponseMonqadeError400 = {
    name:'res',
    locals: {},
    status: (statusCode)=>{
        expect(statusCode).to.equal(400);
            return { 
                json:(mqError)=>{
                    expect(mqError).to.have.key('MonqadeError')
                }
            }
        }
};

const expectResponseError500 = {
    name:'res',
    locals: {},
    status: (statusCode)=>{
        expect(statusCode).to.equal(500);
        return { 
            send:(errMessage)=>{
                expect(errMessage).to.have.key('error')
            }
        }
    }
};

const expectResponseError403 = {
    name:'res',
    locals: {},
    status: (statusCode)=>{
        expect(statusCode).to.equal(403);
        return { 
            send:(errMessage)=>{
                expect(errMessage).to.be.undefined;
            }
        }
    }
};

    
describe(`extractPayloadOrDie`,  () => {
    beforeEach(()=>{
        execLog= [];
    })
    it(`Should extract payload from req.body.payload when present`, ()=>{
        const fReq = {
            body:{
                payload: {
                    candidateDoc: 'candidateDoc', 
                    projection: 'projection', 
                    queryOptions: 'queryOptions', 
                    query: 'query'
                }
            }
        }

        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.extractPayloadOrDie(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fReq, fakeRes, fakeMqSchema);
        expect(execLog).to.have.members(['f1'])
    });
    it(`Should extract from req.params, tolerant of example.com/endpoint/{payload:{....}}  part 1`, ()=>{
        const fReq = {
            params:{
                payload:JSON.stringify({ payload:  {
                    candidateDoc: 'candidateDoc', 
                    projection: 'projection', 
                    queryOptions: 'queryOptions', 
                    query: 'query'
                }
                })
            },
            body:{}
        };

        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.extractPayloadOrDie(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fReq, fakeRes, fakeMqSchema);
        expect(execLog).to.have.members(['f1'])
    });
    
    it(`Should extract from req.params, tolerant of example.com/endpoint/{....}   part 2 `, ()=>{
        const fReq = {
            params:{
                payload:JSON.stringify({
                    candidateDoc: 'candidateDoc', 
                    projection: 'projection', 
                    queryOptions: 'queryOptions', 
                    query: 'query'
                })
            },
            body:{}
        };
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.extractPayloadOrDie(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fReq, fakeRes, fakeMqSchema);
        expect(execLog).to.have.members(['f1'])
    });
    it(`Should terminate status 400 (MonqadeError)  for json parse error (JSON.parse fails)  `, ()=>{
        const fReq = {
            params:{
                payload:{
                    candidateDoc: 'candidateDoc', 
                    projection: 'projection', 
                    queryOptions: 'queryOptions', 
                    query: 'query'
                }
            },
            body:{}
        };
        
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.extractPayloadOrDie(req,res,next,mqSchema)
        };

        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fReq, expectResponseMonqadeError400, fakeMqSchema);
        expect(execLog).to.not.have.members(['f1'])
    });
    it(`Should terminate status 400 (MonqadeError) for missing payload `, ()=>{
        const fReq = {
            params:{
                payload_does_not_exist:{
                    candidateDoc: 'candidateDoc', 
                    projection: 'projection', 
                    queryOptions: 'queryOptions', 
                    query: 'query'
                }
            },
            body:{}
        };
        
        const testMiddleware = (req, res, next,mqSchema)=>{
            mmw.extractPayloadOrDie(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fReq, expectResponseMonqadeError400, fakeMqSchema);
        expect(execLog).to.not.have.members(['f1'])
    });

});
describe(`terminateIfSystemPathsDetected`,  () => {
    beforeEach(()=>{
        execLog= [];
    })
    it('Should not terminate if there is no candidate doc - therefore no system paths', ()=>{
        const fReq  = {
            body: {
                payload: {
                    candidateDoc:undefined
                }
            }
        };
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminateIfSystemPathsDetected(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( finished, testMiddleware);

        mws.execute(fReq, fakeRes, fakeMqSchema);
        expect(execLog).to.have.members(['finished'])
    });
    it('Should not terminate if there is no payload ', ()=>{
        const fReq  = {
            body: {

            }
        };
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminateIfSystemPathsDetected(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( finished, testMiddleware);

        mws.execute(fReq, fakeRes, fakeMqSchema);
        expect(execLog).to.have.members(['finished'])
    });
    it('Should not terminate if there is candidate doc without systemPaths', ()=>{

        const fReq  = {
            body: {
                payload: {
                    candidateDoc: { pathIDa:'A', pathIDb:'B', pathIDc:'C'   }
                }
            }
        };
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminateIfSystemPathsDetected(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( finished, testMiddleware);

        mws.execute(fReq, fakeRes, fakeMqSchema);
        expect(execLog).to.have.members(['finished'])
    });
    it('Should not terminate if there is candidate doc without systemPaths', ()=>{

        const fReq  = {
            body: {
                payload: {
                    candidateDoc: { createdAt:'A', updatedAt:'B', _id:'C'   }
                }
            }
        };

        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminateIfSystemPathsDetected(req,res,next,mqSchema)
        };
        const mws = new MiddlewareStack( finished, testMiddleware);

        mws.execute(fReq, expectResponseMonqadeError400, fakeMqSchema);
        expect(execLog).to.not.have.members(['finished'])
    });

});
describe(`echo`,  () => {
    it('Should send hello message containing the MonqadeSchema.collectionName', ()=> {
        const fRes = {name:'res',
            end: (message)=>{
                expect(message).to.contain('TEST_STRING');

            }
        };
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.echo(req,res,{collectionName:'TEST_STRING'})
        };

        const mws = new MiddlewareStack( f1, testMiddleware);
        mws.execute(fakeReq, fRes, fakeMqSchema);
        expect(execLog).to.not.have.members(['f1'])

    });
});

describe(`terminateUnknownError500`,  () => {
    // const fakeMqSchema = {name:'mqSchema'}, fakeRes = {name:'res'}, fakeReq = {name:'req'};
    it(`Should send status 500 and an object with key named 'error' `,  () => {

        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminateUnknownError500(req,res,'THE_ERROR_MESSAGE')
        };

        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fakeReq, expectResponseError500, fakeMqSchema);

        expect(execLog).to.not.have.members(['f1'])
    });
});
describe(`terminateStandardMonqadeResponse`,  () => {
    it('Should call res.json.  No next is called, effectively terminating ', ()=>{
        const fRes = {
            name:'res',
            locals:{},
            json: (mqResponse) => {
                //expect(mqResponse).to.equal('SOME_DUMMY_MESSAGE')
                expect(mqResponse).to.have.key('MonqadeResponse')

            }
        };

        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminateStandardMonqadeResponse(req,res,'SOME_DUMMY_MESSAGE')
        };

        const mws = new MiddlewareStack( f1, testMiddleware);
        mws.execute(fakeReq, fRes, fakeMqSchema);
        expect(execLog).to.not.have.members(['f1'])

    })
});
describe(`terminateMonqadeError`,  () => {
    it('Should send Monqade error with https status 400, if error is Monqade Error ', () => {
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminateMonqadeError(req,res,{isMonqadeError:true,code:'UNKNOWN_ERROR'});
        };

        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fakeReq, expectResponseMonqadeError400, fakeMqSchema);

        expect(execLog).to.not.have.members(['f1'])
    })

    it('Should re/throw error if error is not MonqadeError ', () => {
        const testMiddleware = (req,res,next,mqSchema)=>{
            try {
                mmw.terminateMonqadeError(req,res,{isNotMonqadeError:true,codex:'UNKNOWN_ERROR_CODE'});
            }catch(e) {
                expect(e).to.deep.equal({isNotMonqadeError:true,codex:'UNKNOWN_ERROR_CODE'});
            }
        };

        const mws = new MiddlewareStack( f1, testMiddleware);
        mws.execute(fakeReq, expectResponseMonqadeError400, fakeMqSchema);
        expect(execLog).to.not.have.members(['f1'])
    })

});
describe(`terminate403`,  () => {
    it('Should send http status 403 - nothing more.', () => {
        const testMiddleware = (req,res,next,mqSchema)=>{
            mmw.terminate403(req,res);
        };

        const mws = new MiddlewareStack( f1, testMiddleware);

        mws.execute(fakeReq, expectResponseError403, fakeMqSchema);

        expect(execLog).to.not.have.members(['f1'])
    });

});
