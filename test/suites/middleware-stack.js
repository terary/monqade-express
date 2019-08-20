"use strict";


const chai = require('chai')
const expect = chai.expect;
const fakeMqSchema = {name:'mqSchema'}, fakeRes = {name:'res'}, fakeReq = {name:'req'};
const MiddlewareStack = require('../../src/monqade/MiddlewareStack');
let execLog = [];


const f1 = (req,res,next,mqSchema) => {
    execLog.push('f1')
    next();    
}
const f2 = (req,res,next,mqSchema) => {
    execLog.push('f2')
    next();    
}
const f3 = (req,res,next,mqSchema) => {
    execLog.push('f3')
    next();    
}
const fTerminateEarly = (req,res,next,mqSchema) => {
    execLog.push('fTerminateEarly')
    return;    
}

const f4 = (req,res,next,mqSchema) => {
    execLog.push('f4')
    next();
}


describe(`Instantiation (new) `, () => {
    it(`Should without arguments create object of time MiddlewareStack `, ()=>{
        const mws = new MiddlewareStack();
        expect(mws).to.be.instanceOf(MiddlewareStack);
    });
    it(`Should with function argument create object of time MiddlewareStack, function bottom of stack `, ()=>{
        const mws = new MiddlewareStack(f1);
        expect(mws).to.be.instanceOf(MiddlewareStack);
    });

});

describe(`execute, enqueue, push and use `, ()=>{
//    const fakeMqSchema = {}, fakeRes = {}, fakeReq = {};
    beforeEach(() => {
        execLog = [];

    });
    it(`Should call execution stack FIFO regardless adding middleware using combinations of: push(), use(), enqueue()`, ()=>{
        const expectedStack =  [
                'f1','f2','f3',         //new()
                'f2','f3',              //enqueue  
                'f1','f2',              //push   
                'f4', 'f1', 'f2','f3'   //use
            ];

        const expectedExecOrder =expectedStack.reverse(); 

        const mws = new MiddlewareStack(f1,f2,f3);
        mws.enqueue(f3, f2);
        mws.push(f1, f2);
        mws.use(f3, f2,f1,f4 );
        
        mws.execute(fakeReq,fakeRes,fakeMqSchema);
        expect(execLog).to.eql(expectedExecOrder)
        expect(execLog).to.not.eql(expectedExecOrder.reverse()); // assure order is being tested



    });
    it(`Should stop executing after first terminating function - regardless of remaining stack `, ()=>{
        const expectedStack =  [
                //'f1','f2','f3',         //new()    - wont execute because of fTerminateEarly
                //'f2','f3',              //enqueue  - wont execute because of fTerminateEarly
                'fTerminateEarly', 'f2',  //push   
                'f4', 'f1', 'f2','f3'     //use
            ];

        const expectedExecOrder =expectedStack.reverse(); 
        const mws = new MiddlewareStack(f1,f2,f3);
        mws.enqueue(f3, f2);
        mws.push(fTerminateEarly, f2 );
        mws.use(f3, f2,f1,f4 );
        
        mws.execute(fakeReq,fakeRes,fakeMqSchema);
        expect(execLog).to.eql(expectedExecOrder)
        expect(execLog).to.not.eql(expectedExecOrder.reverse()); // assure order is being tested
    });

    


    it(`Should call execution stack FIFO when using enqueue(fn1, fn2, ...) `, ()=>{
        const mws = new MiddlewareStack();
        mws.enqueue(f1, f2);

        //mws.execute(fakeReq,fakeRes,fakeMqSchema);
        mws.execute(fakeReq,fakeRes,fakeMqSchema);
        expect(execLog).to.eql(['f1','f2'])
        expect(execLog).to.not.eql(['f1','f2'].reverse()); // assure order is being tested


    });
    it(`Should call execution stack FILO when using push(fn1, fn2, ...) `, ()=>{
        const mws = new MiddlewareStack();
        mws.push(f1, f2, f3);

        //mws.execute(fakeReq,fakeRes,fakeMqSchema);
        mws.execute(fakeReq,fakeRes,fakeMqSchema);
        expect(execLog).to.eql(['f3', 'f2', 'f1'])
        expect(execLog).to.not.eql(['f3', 'f2', 'f1'].reverse()); // assure order is being tested


    });


    it(`Should be called with parameters in order and type of: (req:object, res:object, next:function, mqSchema:object)`, ()=>{
        const fnTestParameterOrder = (req,res,next,mqSchema) => {
            execLog.push('fnTestParameterOrder')
            expect(req).to.be.a('object');
            expect(req.name).to.be.equal('req');
            
            expect(res).to.be.a('object');
            expect(res.name).to.be.equal('res');
        
            expect(next).to.be.a('function');
            expect(mqSchema).to.be.a('object');
            expect(mqSchema.name).to.be.equal('mqSchema');
        
            next();    
        }

        const mws = new MiddlewareStack(fnTestParameterOrder);

        //mws.execute(fakeReq,fakeRes,fakeMqSchema);
        mws.execute(fakeReq,fakeRes,fakeMqSchema);


    });



});