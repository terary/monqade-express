function* _executableStack(ops){
    for(let i =ops.length -1 ; i>-1; i--){
        yield ops[i];
    }
}


/**
 * Function stack - serves as middleware collection 
 * 
 * @class MiddlewareStack
 * @description Internally a stack of middleware functions.  Some behaviour modifications to mimic express's use(...) 
 * 
 * See [MonqadeMiddleware]{@link http://docs.monqade.com/tutorial-MonqadeMiddleware.html} for more information
 * 
 * @param {Function} miniStack - Optional zero or more functions to initialize the stack  (FILO)
 */
class MiddlewareStack {
    constructor( ... miniStack){
        this._stack = [];
        this.push( ... miniStack);
    }

    /**
     * Alias for enqueue 
     */
    use(...fn) {
        this.enqueue(...fn);
    }


    /**
     * @param {Function} fn - Function(s) accepts mini middleware queue and append onto  Monqade middleware stack.
     * @description Prepends functions to the middleware queue
     *  
     * * Functions are in the form (req,res, next, mqSchema)=>{do_stuff; next()} 
     * * **Notable Gotcha** 
     * 
     *          MiddlewareStack.enqueue(fn1,fn2,fn3)
     *          // will execution fn1 -> fn2 -> fn3 -> Monqade functions -> terminate
     * 
     *          MiddlewareStack.push(fn1,fn2,fn3)
     *          // will execution fn3 -> fn2 -> fn1 -> Monqade functions -> terminate
     *    
     * [See MonqadeMiddleware]{@link http://docs.monqade.com/tutorial-MonqadeMiddleware.html} for more information
     */
    enqueue( ... fn){
        this._stack.push( ...[...fn].reverse() );
    }

    /**
     * @param {Function} fn - Accepts middleware stack and pushes onto the  Monqade middleware stack.
     * @description Pushes onto the middleware stack
     *  
     * * Functions are in the form (req,res, next, mqSchema)=>{do_stuff; next()} 
     * * **Notable Gotcha** 
     * 
     *          MiddlewareStack.enqueue(fn1,fn2,fn3)
     *          // will execution fn1 -> fn2 -> fn3 -> Monqade functions -> terminate
     * 
     *          MiddlewareStack.push(fn1,fn2,fn3)
     *          // will execution fn3 -> fn2 -> fn1 -> Monqade functions -> terminate
     *    
     * [See MonqadeMiddleware]{@link http://docs.monqade.com/tutorial-MonqadeMiddleware.html} for more information
     */
    push( ... fn){
        this._stack.push(...fn);
    }

    /**
     * - **Begins** execution of the middleware stack  
     * @public
     * @param {Object} req - Request object from express
     * @param {Object} res - Response object for express
     * @param {MonqadeSchema} mqSchema - MonqadeSchema
     *      
     * @returns {undefined}
     */
    execute(req,res,mqSchema){
        const executingStack = _executableStack(this._stack);
        this._executeNext(req,res,mqSchema, executingStack);
    }

    /**
     * - **Continues** execution of the middleware stack 
     * @private
     * @param {Object} req - Request object from express
     * @param {Object} res - Response object for express
     * @param {MonqadeSchema} mqSchema - MonqadeSchema
     */
    _executeNext(req,res,mqSchema,exeStack){
        
        // const fn=this.executingStack.next().value
        const fn=exeStack.next().value

        const self= this;
        if(fn !== undefined) {
            fn(req,res,function(){self._executeNext(req,res,mqSchema,exeStack)},mqSchema  );
        } // if enque/push does not include terminated fn  - the last fn will be undefined 
    }
}


module.exports = MiddlewareStack;
