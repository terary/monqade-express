const chai = require('chai')
  , chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const expected404response = (response)=>{

  expect(response.status).to.equal(404);
}
const expected403response = (response)=>{

  expect(response.status).to.equal(403);
}
const expected200response = (response)=>{

  expect(response.status).to.equal(200);
}

const expected400response = (response,MonqadeErrorCode,causeMessage = '')=>{
    expect(response).to.be.json;
    const responseOBJ = JSON.parse(response.text)

    expect(response.status).to.equal(400);
    expect(responseOBJ).to.have.property('MonqadeError');
    expect(responseOBJ.MonqadeError['_code'],causeMessage).to.equal(MonqadeErrorCode);

}

const expectedMonqadeResponse =(response)=>{
    expect(response).to.be.json;
    const mqResponse = response.body.MonqadeResponse;
    expect(mqResponse.isMonqadeResponse,' mqResponse.isMonqadeResponse ').to.be.true;
    expect(mqResponse['_docs'],' _docs should be an array').to.be.an('array');
    return mqResponse;

}
module.exports.expected200response =expected200response;
module.exports.expected404response =expected404response;
module.exports.expected400response =expected400response;
module.exports.expectedMonqadeResponse =expectedMonqadeResponse;
module.exports.expected403response = expected403response;


