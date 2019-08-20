"use strict";

/**
 * 
 * To be deprecated
 * 
 * Surely there must be a better way.
 * Use json from discovery to creat html document?
 * 
 * This simply creates html file documenting the API in human readable format (html).
 * @ignore
 * 
 */


const pageShellHTML= (title, content)=>{
    return `<!DOCTYPE html>
    <head><title>${title}</title>
     <style>
     :root{
        --field-spec-display: hidden;
     }
     .webMethod{
         border: 1px black solid;
         margin:10px;
     }
     .fieldSpec {

     }
     .arguments{
         margin-left:15px;
     }     
     .webMethod>.label{
         font-weight:bold;
     }
     .funcAttrLabel{
         font-weight:bold;
     } 
     .funcAttrValue  {
        color: green;
     }
     article > section {
        /* 
        display:none; 
         
         */
         display:inherit;
    }
     .fieldSpec {
         /* 
        display:none; 
         
         */
        display:inherit;
     }
     </style>
     <script>
     // <a class='toggleShowHideWMDesc' href='#' onclick='showHideWMDescription()'>+</a>
     function showHideWMDescription(qry){
         //alert('hello');
         var x = document.querySelectorAll(qry );
         x.forEach(el => {
            if(el.style.display == 'none') {
                el.style.display = 'inherit';
            }else {
                el.style.display = 'none';
            }
         })
     }
     
     </script>   
    </head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <body>
        <a class='toggleShowHideWMDesc' href='#' onclick='showHideWMDescription("article > section")'>expand Web Method</a>
        <a class='toggleShowHideWMDesc' href='#' onclick='showHideWMDescription(".fieldSpec")'>expand Field Description</a>

        ${content}
    </body>
    </html>
    `;
}

const pathOptionToHTML = pathOptions =>{
    const required = (pathOptions.isRequired)? '*' : '-';
    let fieldSpecHTML =`${pathOptions['name']} ${required}
        <ul class='fieldSpec'>
            <li>label:${pathOptions['label'] || pathOptions['name']}</li>
            <li>required:${pathOptions['isRequired']}</li>
            <li>type:${pathOptions['type']}</li>
            <li>notes:</li>
   `;
    if (pathOptions['notes'] ){
        fieldSpecHTML += `restrictions:${pathOptions['notes']['restriction']} <br />
        purpose:${pathOptions['notes']['purpose']}<br />`;

    }

    if (pathOptions['maxlength'] && pathOptions['maxlength'] ==='' ){
        fieldSpecHTML += `<li>max length: ${pathOptions['maxlength']}</li>`;
    }
    if (pathOptions['minlength'] && pathOptions['minlength'] ==='' ){
        fieldSpecHTML += `<li>min length: ${pathOptions['minlength']}</li>`;
    }
    fieldSpecHTML += `</ul>`
    return  fieldSpecHTML;
}

const pathsToHTML = (mqSchema,pathIDs=[]) =>{
    let pathsHTML = `<ul>`;
    pathIDs.forEach(pathID=>{
        const opts   = mqSchema.getPathOptions(pathID);
        const x  = pathOptionToHTML( opts);
        //pathsHTML +='<li>'+pathOptionToHTML( opts) + '</li>';  
        pathsHTML +=''+pathOptionToHTML( opts) + '';  
    })
    pathsHTML += '</ul>'
    return pathsHTML;
}
const webMethodToHTML = (label,method, endpoint, parameters)=>{
    return `
        <article>
            <header><h2>${label}</h2>
            </header>
            <section>
                <ul>
                    <li><span class='funcAttrLabel'>Method:</span><span class='funcAttrValue'> ${method}</span> </li>
                    <li><span class='funcAttrLabel'>Endpoint:</span><span class='funcAttrValue'> ${endpoint}</span> </li>
                    <li><span class='funcAttrLabel'>Parameters:</span>
                        ${parameters}
                    </li>
                </ul>
            </section>
        </article>
    `;

}
const describeAPI= (mqSchema)=>{
 
    let webMethodsHTML = '';
    const upsertOnePathIDs = mqSchema.getPathNamesAll();
    webMethodsHTML += webMethodToHTML('doUpsertOne','POST','doUpsertOne/',pathsToHTML(mqSchema, upsertOnePathIDs))

    const updateOnePathIDs = mqSchema.getPathNamesUpdatable().concat(mqSchema.getPathNamesSystem());
    webMethodsHTML += webMethodToHTML('doUpdateOne','PATCH','/',pathsToHTML(mqSchema, updateOnePathIDs))

    const insertOnePathIDs = mqSchema.getPathNamesInsertable(); ;
    webMethodsHTML += webMethodToHTML('doInsertOne', 'POST','/',pathsToHTML(mqSchema, insertOnePathIDs))

    const deleteOnePathIDs = mqSchema.getPathNamesSystem()
    webMethodsHTML += webMethodToHTML('doDeleteOne', 'DELETE','/',pathsToHTML(mqSchema, deleteOnePathIDs))

    const findOnePathIDs = mqSchema.getPathNamesSystem()
    webMethodsHTML += webMethodToHTML('doFindOne','GET','/',pathsToHTML(mqSchema, findOnePathIDs))

    webMethodsHTML += webMethodToHTML('doFindMany','GET','doFindMany/', pathsToHTML(mqSchema, mqSchema.getPathNamesAll()));
    webMethodsHTML += webMethodToHTML('doFindManyCount','GET','doFindManyCount/', pathsToHTML(mqSchema, mqSchema.getPathNamesAll()));

    webMethodsHTML += webMethodToHTML('doQueryMany','GET','doQueryMany/', pathsToHTML(mqSchema, mqSchema.getPathNamesSearchable()))
    webMethodsHTML += webMethodToHTML('doQueryManyCount','GET','doQueryManyCount/', pathsToHTML(mqSchema, mqSchema.getPathNamesSearchable()))



    webMethodsHTML += webMethodToHTML('discovery','GET','discovery/','')
    webMethodsHTML += webMethodToHTML('documentation','GET','documentation/','')

    const conventionStatement = require('./convention-statement');
    webMethodsHTML += `<p><pre><code>${conventionStatement}</code></p></pre>`;
    return pageShellHTML(mqSchema.collectionName, webMethodsHTML);
}


module.exports.describe = describeAPI;
//module.exports.describeDoInsertOne = discoverPathsDoInsertOne;

