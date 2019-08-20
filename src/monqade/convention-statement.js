"use strict";

const conventionStatement= `
    http://example.com/miniapppath/vX/collectionname/
    http://example.com/miniapppath/vX/collectionname
    Same thing.  Nothing implied.

    Convention is to document everything with trailing '/'.
    But the trailing slash doesn't imply an different resource from those resources without.

    endpoints utilizing body in request will have full and complete endpoint 'http://example.com/x/y/'
        and payload will be within the body using key: payload as key
        body.payload={key1:value1, key2:value2, ...}

    endpoints utilizing url to send payload will be in the form 'http://example.com/x/y/{payload:{...    }}'
    where {payload:{...    }} will be url encoded.

    payload:
        {payload:{key1:value1, key2:value2,...}}
        all the standard json applies


    http://example.com/mini-app-path1/MAP2/MAPn/vX/collectionname/function/
    example.com -- 
        host name
    
    /mini-app-path1/MAP2/MAPn/ -- 
        Zero or more distinctions to the mini app,
        not part of the mini app but part of the url structure.
        may not be present
    
    vX -- 
        Version: form v1, v002, v123, vSomeString - 
        a string value that probably looks like a number prefixed with v
        not part of the mini app but part of the url structure.
        maybe not be present.

    collectionname -- 
        The name of the mini app.  Likely the collection name of target document collection.
        will be present - required

    function -- 
        The function to be performed
        functions: doFindOne, doQueryMany, ...,  Check api for specific function availability 
        may not be present - depends on endpoint http method (post, get, etc,)


App and mini versioning 
    App/MiniApp version is out side of scope of MonqadeExpress
    http://example.com/mini-app-path1/MAP2/MAPn/vX/collectionname/function/

    vX is arbitrary - and completely at the discretion of developer


    http://example.com/mini-app-path1/MAP2/MAPn/vX/collectionname/svX/function/
    svX - schema version.  
    Not currently available natively. 

    It is theoretically possible to run servers with different version of the same schema (collectionName)
    This would be a bad idea - probably - except for backwards compatibility perhaps? or if there were
    some intermediatory code to convert schema old->new.  
    That is outside scope of today's concerns. 
    
`;
module.exports = conventionStatement;