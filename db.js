(function(){
"use strict";
var APP_ID = "52877744-72cc-404a-b68e-fb01f3e387ac";
var API = "/api";
var dbReady = false, listeners = [];

function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9)}
function localGet(key,def){try{var s=localStorage.getItem(key);if(s===null||s==="null")return def;return JSON.parse(s)}catch(e){return def}}
function localSet(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}}

function apiCall(endpoint,data,callback){
    fetch(API+"/"+endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data)
    }).then(function(r){return r.json()}).then(function(r){
        if(callback)callback(r);
    }).catch(function(e){
        console.warn("API ERROR:",e.message);
        if(callback)callback({ok:false,error:e.message});
    });
}

function cloudWrite(collection,id,data){
    apiCall("write",{collection:collection,id:id,data:data},function(r){
        if(r.ok)console.log("WRITE OK:",collection);
        else console.warn("WRITE FAIL:",r.error);
    });
}
function cloudDelete(collection,id){apiCall("delete",{collection:collection,id:id})}

function notify(event,data){for(var i=0;i<listeners.length;i++){if(listeners[i].event===event)listeners[i].cb(data)}}

function mergeCloudData(d){
    try{
        if(d.portalusers){var local=localGet("x_u",[]),emails={};for(var i=0;i<local.length;i++){if(local[i].email)emails[local[i].email.toLowerCase()]=true}for(var k in d.portalusers){var cu=d.portalusers[k];if(cu.email&&!emails[cu.email.toLowerCase()]){local.push({id:k,name:cu.name||"",email:cu.email||"",phone:cu.phone||"",roll:cu.roll||"",tier:cu.tier||"free",joined:cu.joined||""})}}localSet("x_u",local)}
        if(d.results){var local=localGet("x_h",[]),dates={};for(var i=0;i<local.length;i++){dates[(local[i].date||"")+"_"+(local[i].name||"")]=true}for(var k in d.results){var cr=d.results[k];if(!dates[(cr.date||"")+"_"+(cr.name||"")]){local.push(cr)}}localSet("x_h",local)}
        if(d.vouchers){var local=localGet("x_v",{});for(var code in d.vouchers){if(!local[code])local[code]=d.vouchers[code];else local[code].used=Math.max(local[code].used||0,d.vouchers[code].used||0)}localSet("x_v",local)}
        if(d.facultyq){var local=localGet("f_questions",{});for(var k in d.facultyq){var cq=d.facultyq[k];if(cq.paperKey&&cq.questions){try{var parsed=JSON.parse(cq.questions);if(!local[cq.paperKey]||parsed.length>local[cq.paperKey].length){local[cq.paperKey]=parsed}}catch(e){}}}localSet("f_questions",local)}
    }catch(e){}
}

function pollCloud(){
    apiCall("query",{results:{},portalusers:{},vouchers:{},facultyq:{},logs:{}},function(data){
        if(data&&!data.error){mergeCloudData(data);notify("data",data)}
    });
}

window.AIEP = {
    ready:false, db:null,
    isConnected:function(){return dbReady},
    _uid:uid, _local:localGet, _localSet:localSet,

    init:function(onReady){
        console.log("AIEP: Init");
        apiCall("query",{portalusers:{}},function(data){
            if(data&&!data.error){
                dbReady=true;
                console.log("AIEP: Server connected");
                notify("connected",true);
                if(onReady)onReady(true);
            }else{
                console.warn("AIEP: Server error");
                if(onReady)onReady(false);
            }
        });
    },

    on:function(event,cb){listeners.push({event:event,cb:cb})},

    subscribe:function(){
        if(!dbReady)return;
        pollCloud();
        setInterval(pollCloud,10000);
    },

    syncAllToCloud:function(callback){
        var stats={users:0,results:0,vouchers:0,questions:0,logs:0};
        var users=localGet("x_u",[]);for(var i=0;i<users.length;i++){var u=users[i];if(!u.id)u.id=uid();cloudWrite("portalusers",u.id,{name:u.name||"",email:u.email||"",phone:u.phone||"",roll:u.roll||"",tier:u.tier||"free",joined:u.joined||""});stats.users++}
        var results=localGet("x_h",[]);for(var i=0;i<results.length;i++){var r=results[i];if(!r.id)r.id=uid();cloudWrite("results",r.id,{name:r.name||"",email:r.email||"",roll:r.roll||"",exam:r.exam||"",paper:r.paper||"",score:r.score||0,total:r.total||0,pct:r.pct||0,date:r.date||""});stats.results++}
        var vouchers=localGet("x_v",{});var vKeys=Object.keys(vouchers);for(var i=0;i<vKeys.length;i++){var code=vKeys[i],id=uid();cloudWrite("vouchers",id,{desc:vouchers[code].desc||"",used:vouchers[code].used||0,max:vouchers[code].max||100,tier:vouchers[code].tier||"starter"});stats.vouchers++}
        var fq=localGet("f_questions",{});var fqKeys=Object.keys(fq);for(var i=0;i<fqKeys.length;i++){var key=fqKeys[i];cloudWrite("facultyq",key.replace(/[^a-zA-Z0-9_]/g,"_"),{paperKey:key,count:fq[key].length,questions:JSON.stringify(fq[key]),updated:new Date().toISOString()});stats.questions+=fq[key].length}
        var logs=localGet("x_l",[]);for(var i=Math.max(0,logs.length-50);i<logs.length;i++){cloudWrite("logs",uid(),{action:logs[i].a||"",time:logs[i].t||""});stats.logs++}
        if(callback)callback({ok:true,stats:stats});
    },

    pullAllFromCloud:function(callback){
        apiCall("query",{results:{},portalusers:{},vouchers:{},facultyq:{},logs:{}},function(data){
            if(data&&!data.error){mergeCloudData(data);if(callback)callback({ok:true})}
            else{if(callback)callback({ok:false,msg:"Query failed"})}
        });
    },

    getUsers:function(){return localGet("x_u",[])},
    saveUser:function(user){var users=localGet("x_u",[]);var exists=false;for(var i=0;i<users.length;i++){if(users[i].email&&users[i].email.toLowerCase()===user.email.toLowerCase()){exists=true;break}}if(!exists){user.id=user.id||uid();user.joined=user.joined||new Date().toLocaleString();users.push(user);localSet("x_u",users);cloudWrite("portalusers",user.id,{name:user.name||"",email:user.email||"",phone:user.phone||"",roll:user.roll||"",tier:user.tier||"free",joined:new Date().toISOString()})}},
    getResults:function(){return localGet("x_h",[])},
    saveResult:function(r){var hist=localGet("x_h",[]);r.id=r.id||uid();r.date=r.date||new Date().toLocaleString();hist.push(r);localSet("x_h",hist);cloudWrite("results",r.id,{name:r.name||"",email:r.email||"",roll:r.roll||"",exam:r.exam||"",paper:r.paper||"",score:r.score||0,total:r.total||0,pct:r.pct||0,date:new Date().toISOString()})},
    clearResults:function(){localSet("x_h",[])},
    getVouchers:function(){var v=localGet("x_v",null);if(!v){v={"FREE2026":{desc:"Free Access",used:0,max:9999,tier:"ultimate"},"LAUNCH50":{desc:"Launch Promo",used:0,max:9999,tier:"starter"}};localSet("x_v",v)}return v},
    saveVouchers:function(v){localSet("x_v",v);for(var code in v){if(v.hasOwnProperty(code))cloudWrite("vouchers",code,v[code])}},
    useVoucher:function(code){var v=this.getVouchers();if(!v[code])return{ok:false,msg:"Invalid code"};if(v[code].used>=v[code].max)return{ok:false,msg:"Limit reached"};v[code].used=(v[code].used||0)+1;localSet("x_v",v);cloudWrite("vouchers",code,v[code]);return{ok:true,tier:v[code].tier,desc:v[code].desc}},
    addVoucher:function(code,data){var v=this.getVouchers();v[code]=data;localSet("x_v",v);cloudWrite("vouchers",code,data)},
    deleteVoucher:function(code){var v=this.getVouchers();delete v[code];localSet("x_v",v);cloudDelete("vouchers",code)},
    getFacultyQ:function(){return localGet("f_questions",{})},
    saveFacultyQ:function(allQ){localSet("f_questions",allQ);for(var key in allQ){if(allQ.hasOwnProperty(key)){cloudWrite("facultyq",key.replace(/[^a-zA-Z0-9_]/g,"_"),{paperKey:key,count:allQ[key].length,questions:JSON.stringify(allQ[key]),updated:new Date().toISOString()})}}},
    addQuestion:function(ek,pk,qObj){var all=this.getFacultyQ();var key=ek+"_"+pk;if(!all[key])all[key]=[];all[key].push(qObj);this.saveFacultyQ(all)},
    deleteQuestion:function(ek,pk,qId){var all=this.getFacultyQ();var key=ek+"_"+pk;if(!all[key])return;all[key]=all[key].filter(function(q){return q.id!==qId});this.saveFacultyQ(all)},
    deleteAllQuestions:function(ek,pk){var all=this.getFacultyQ();delete all[ek+"_"+pk];this.saveFacultyQ(all)},
    importBulkQ:function(ek,pk,arr){var all=this.getFacultyQ();var key=ek+"_"+pk;if(!all[key])all[key]=[];var added=0;for(var i=0;i<arr.length;i++){var q=arr[i];if(!q.question||!q.options||!q.options.A)continue;all[key].push({id:"fq_"+uid()+"_"+i,q:q.question,opts:{A:q.options.A,B:q.options.B,C:q.options.C||"",D:q.options.D||""},ans:(q.answer||"A").toUpperCase(),diff:q.difficulty||"medium",topic:q.topic||"",explain:q.explanation||"",date:new Date().toLocaleString()});added++}this.saveFacultyQ(all);return added},
    getTier:function(){return localGet("x_tier","free")},setTier:function(t){localSet("x_tier",t)},
    getCurrentUser:function(){return localGet("x_cur",null)},setCurrentUser:function(u){localSet("x_cur",u)},clearCurrentUser:function(){localStorage.removeItem("x_cur")},
    getAdminCreds:function(){return localGet("x_c",{u:"admin",p:"admin@2026"})},setAdminCreds:function(u,p){localSet("x_c",{u:u,p:p});cloudWrite("adminconfig","admincreds",{username:u,updated:new Date().toISOString()})},
    getFacultyCreds:function(){return localGet("f_creds",{u:"faculty",p:"faculty@2026"})},setFacultyCreds:function(u,p){localSet("f_creds",{u:u,p:p});cloudWrite("adminconfig","facultycreds",{username:u,updated:new Date().toISOString()})},
    log:function(action){var arr=localGet("x_l",[]);arr.push({a:action,t:new Date().toLocaleString()});if(arr.length>500)arr=arr.slice(-500);localSet("x_l",arr);cloudWrite("logs",uid(),{action:action,time:new Date().toISOString()})},
    getLogs:function(){return localGet("x_l",[])},
    exportAll:function(){return{version:"11.0",exported:new Date().toISOString(),users:this.getUsers(),results:this.getResults(),vouchers:this.getVouchers(),facultyQuestions:this.getFacultyQ(),tier:this.getTier(),adminCreds:this.getAdminCreds(),facultyCreds:this.getFacultyCreds(),logs:this.getLogs()}},
    importAll:function(data){if(data.users)localSet("x_u",data.users);if(data.results)localSet("x_h",data.results);if(data.vouchers)localSet("x_v",data.vouchers);if(data.facultyQuestions)localSet("f_questions",data.facultyQuestions);if(data.tier)localSet("x_tier",data.tier);if(data.adminCreds)localSet("x_c",data.adminCreds);if(data.facultyCreds)localSet("f_creds",data.facultyCreds);if(data.logs)localSet("x_l",data.logs)}
};
})();
