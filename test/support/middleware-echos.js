// echo* bogus middleware for demo/test purpose

const doEchoTerminate = (req,res,next,mqSchema)=>{
  res.end();
  // echo functions do res.writer(...) -- causing headers to be sent.
  // Thus making them incompatable with monqade functions which send set/headers
  // effectively
  //        add cors headers
  //        write echo content
  //        send json headder
  //        write/send monqade response <-- 
  next();
}

const doEcho = (req,res,next,mqSchema)=>{
    let message='echo 1 The Message: ';// req.query['message'];
    Object.entries(req.query).forEach(([k,v])=>{
      message += `${k} = ${v} <br />`;
    })
  
    if( 'secretMessages' in req) {
      req.secretMessages.forEach(msg=>{
        res.write('The Secrets:'+ msg);
      })
    }else {
      req.secretMessages = [];  // just a function that does something 
                                // not meant to be meaningful
      req.secretMessages.push('No kept secrets');
      res.write(req.secretMessages.pop());
    }
    res.write(message);
    next();
}

const doEcho2 = (req,res,next,mqSchema)=>{
    let message='The Message: ';// req.query['message'];
    let sm = req.query.secretMessages
    if(sm){
        req.secretMessages.push(sm);
    }
    res.write(message);
    res.write(" echo2 xxx " + req.secretMessages.join(" * ") + " xxx ");
    next();
}

const doEcho3 = (req,res,next,mqSchema) => {
    if (! req['secretMessages'])  {
        req['secretMessages'] =[];
    }

    req.secretMessages.push('Secrets from 3');
    res.write('Doing it echo 3');
    next()
}
const doNothing1 = (req,res,next,mqSchema) => {
  next();
}
const doNothing2 = (req,res,next,mqSchema) => {
  next();
}
const doNothing3 = (req,res,next,mqSchema) => {
  next();
}
const doNothing4 = (req,res,next,mqSchema) => {
  next();
}
  
module.exports = {doEcho, doEcho2, doEcho3, doEchoTerminate, doNothing1, doNothing2,doNothing3,doNothing4}