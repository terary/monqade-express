
/**
 * Just to keep code organized
 * Maybe a bad idea 
 * Can be called exactly once per mongoose connection ref
 * 
 *  - and can not rely on Node's package loading to do it
 * 
 * 
 * For the time being - doing this way just to keep code cleaner
 * 
 */

const MonqadeSchema = require('monqade-schema');
const usersSchemaDef = require('monqade-dev-schemas').users;
const orgsSchemaDef = require('monqade-dev-schemas').organizations;
const chaosSchemaDef = require('monqade-dev-schemas').chaos;

module.exports= (function(mongooseRef){ 
    const usersMqSchema = new MonqadeSchema(usersSchemaDef.paths, usersSchemaDef.options, mongooseRef  )
    const orgsMqSchema = new MonqadeSchema(orgsSchemaDef.paths, orgsSchemaDef.options, mongooseRef  )
    const chaosMqSchema = new MonqadeSchema(chaosSchemaDef.paths, chaosSchemaDef.options, mongooseRef  )

    return {usersMqSchema, orgsMqSchema, chaosMqSchema }

});
