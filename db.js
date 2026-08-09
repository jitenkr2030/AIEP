(function(){
"use strict";
var APP_ID = "52877744-72cc-404a-b68e-fb01f3e387ac";
var db = null, dbReady = false, listeners = [], pendingWrites = [];

function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9)}
function localGet(key,def){try{var s=localStorage.getItem(key);if(s===null||s==="null")return def;return JSON.parse(s)}catch(e){return def}}
function localSet(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}}

function cloudWrite(collection,id,data){
    if(!db||!dbReady){pendingWrites.push({c:collection,i:id,d:data});return}
    try{db.transact(db.tx[collection][id].update(data));console.log("WRITE:",collection,id);}catch(e){console.warn("WRITE FAIL:",collection,e.message);pendingWrites.push({c:collection,i:id,d:data})}
}
function cloudDelete(collection,id){if(!db||!dbReady)return;try{db.transact(db.tx[collection][id].delete())}catch(e){}}
function flushPending(){if(!db||!dbReady||!pendingWrites.length)return;var batch=pendingWrites.splice(0,30);for(var i=0;i<batch.length;i++){try{var w=batch[i];db.transact(db.tx[w.c][w.i].update(w.d));console.log("FLUSH:",w.c,w.i)}catch(e){}}if(pendingWrites.length)setTimeout(flushPending,1000)}
function notify(event,data){for(var i=0;i<listeners.length;i++){if(listeners[i].event===event)listeners[i].cb(data)}}

function mergeCloudData(d){
    try{
        if(d.portalusers){var local=localGet("x_u",[]),emails={};for(var i=0;i<local.length;i++){if(local[i].email)emails[local[i].email.toLowerCase()]=true}for(var k in d.portalusers){var cu=d.portalusers[k];if(cu.email&&!emails[cu.email.toLowerCase()]){local.push({id:k,name:cu.name||"",email:cu.email||"",phone:cu.phone||"",roll:cu.roll||"",tier:cu.tier||"free",joined:cu.joined||""})}}localSet("x_u",local)}
        if(d.results){var local=localGet("x_h",[]),dates={};for(var i=0;i<local.length;i++){dates[(local[i].date||"")+"_"+(local[i].name||"")]=true}for(var k in d.results){var cr=d.results[k];if(!dates[(cr.date||"")+"_"+(cr.name||"")]){local.push(cr)}}localSet("x_h",local)}
        if(d.vouchers){var local=localGet("x_v",{});for(var code in d.vouchers){if(!local[code])local[code]=d.vouchers[code];else local[code].used=Math.max(local[code].used||0,d.vouchers[code].used||0)}localSet("x_v",local)}
        if(d.facultyq){var local=localGet("f_questions",{});for(var k in d.facultyq){var cq=d.facultyq[k];if(cq.paperKey&&cq.questions){try{var parsed=JSON.parse(cq.questions);if(!local[cq.paperKey]||parsed.length>local[cq.paperKey].length){local[cq.paperKey]=parsed}}catch(e){}}}localSet("f_questions",local)}
    }catch(e){console.warn("Merge error:",e)}
}

window.AIEP = {
    ready:false, db:null,
    isConnected:function(){return dbReady},
    _uid:uid, _local:localGet, _localSet:localSet,

    init:function(onReady){
        if(!APP_ID||APP_ID==="YOUR_APP_ID"){if(onReady)onReady(false);return}
        console.log("AIEP: Loading...");
        var s=document.createElement("script");
        s.src="instant.min.js";
        s.onload=function(){
            console.log("AIEP: Script loaded");
            try{
                db=instant.init({appId:APP_ID});
                AIEP.db=db;
                console.log("AIEP: Signing in as guest...");
                db.auth.signInAsGuest();
                // Give auth 3 seconds then proceed
                setTimeout(function(){
                    AIEP.ready=true;dbReady=true;
                    console.log("AIEP: Ready (guest mode)");
                    notify("connected",true);
                    setTimeout(flushPending,500);
                    if(onReady)onReady(true);
                },3000);
            }catch(e){
                console.error("AIEP: Init error:",e);
                if(onReady)onReady(false);
            }
        };
        s.onerror=function(){console.error("AIEP: Script failed");if(onReady)onReady(false)};
        document.head.appendChild(s);
        setTimeout(function(){if(!dbReady){console.warn("AIEP: Timeout");if(onReady)onReady(false)}},15000);
    },

    on:function(event,cb){listeners.push({event:event,cb:cb})},

    subscribe:function(){
        if(!db||!dbReady)return;
        console.log("AIEP: Subscribing...");
        try{db.subscribeQuery({results:{},portalusers:{},vouchers:{},facultyq:{},logs:{},adminconfig:{}},function(resp){
            if(resp.error){console.error("SUB ERROR:",JSON.stringify(resp.error));return}
            console.log("AIEP: Got cloud data");
            if(resp.data){mergeCloudData(resp.data);notify("data",resp.data)}
        })}catch(e){console.error("Subscribe fail:",e)}
    },

    syncAllToCloud:function(callback){
        if(!db||!dbReady){if(callback)callback({ok:false,msg:"Not connected"});return}
        var stats={users:0,results:0,vouchers:0,questions:0,logs:0,errors:0};
        try{
            var users=localGet("x_u",[]);for(var i=0;i<users.length;i++){var u=users[i];if(!u.id)u.id=uid();try{db.transact(db.tx.portalusers[u.id].update({name:u.name||"",email:u.email||"",phone:u.phone||"",roll:u.roll||"",tier:u.tier||"free",joined:u.joined||""}));stats.users++}catch(e){stats.errors++}}
            var results=localGet("x_h",[]);for(var i=0;i<results.length;i++){var r=results[i];if(!r.id)r.id=uid();try{db.transact(db.tx.results[r.id].update({name:r.name||"",email:r.email||"",roll:r.roll||"",exam:r.exam||"",paper:r.paper||"",score:r.score||0,total:r.total||0,pct:r.pct||0,date:r.date||""}));stats.results++}catch(e){stats.errors++}}
            var vouchers=localGet("x_v",{});var vKeys=Object.keys(vouchers);for(var i=0;i<vKeys.length;i++){var code=vKeys[i],id=uid();try{db.transact(db.tx.vouchers[id].update({desc:vouchers[code].desc||"",used:vouchers[code].used||0,max:vouchers[code].max||100,tier:vouchers[code].tier||"starter"}));stats.vouchers++}catch(e){stats.errors++}}
            var fq=localGet("f_questions",{});var fqKeys=Object.keys(fq);for(var i=0;i<fqKeys.length;i++){var key=fqKeys[i],safeKey=key.replace(/[^a-zA-Z0-9_]/g,"_");try{db.transact(db.tx.facultyq[safeKey].update({paperKey:key,count:fq[key].length,questions:JSON.stringify(fq[key]),updated:new Date().toISOString()}));stats.questions+=fq[key].length}catch(e){stats.errors++}}
            var logs=localGet("x_l",[]);var logBatch=logs.slice(-50);for(var i=0;i<logBatch.length;i++){try{db.transact(db.tx.logs[uid()].update({action:logBatch[i].a||"",time:logBatch[i].t||""}));stats.logs++}catch(e){stats.errors++}}
        }catch(e){if(callback)callback({ok:false,msg:e.message});return}
        if(callback)callback({ok:true,stats:stats});
    },

    pullAllFromCloud:function(callback){
        if(!db||!dbReady){if(callback)callback({ok:false,msg:"Not connected"});return}
        try{db.subscribeQuery({results:{},portalusers:{},vouchers:{},facultyq:{},logs:{}},function(resp){if(resp.error){if(callback)callback({ok:false,msg:JSON.stringify(resp.error)});return}if(resp.data){mergeCloudData(resp.data);if(callback)callback({ok:true})}})}catch(e){if(callback)callback({ok:false,msg:e.message})}
    },

    getUsers:function(){return localGet("x_u",[])},
    saveUser:function(user){
        var users=localGet("x_u",[]);var exists=false;
        for(var i=0;i<users.length;i++){if(users[i].email&&users[i].email.toLowerCase()===user.email.toLowerCase()){exists=true;break}}
        if(!exists){
            user.id=user.id||uid();user.joined=user.joined||new Date().toLocaleString();
            users.push(user);localSet("x_u",users);
            console.log("AIEP: Saved user",user.email);
            cloudWrite("portalusers",user.id,{name:user.name||"",email:user.email||"",phone:user.phone||"",roll:user.roll||"",tier:user.tier||"free",joined:new Date().toISOString()});
        }
    },

    getResults:function(){return localGet("x_h",[])},
    saveResult:function(r){
        var hist=localGet("x_h",[]);r.id=r.id||uid();r.date=r.date||new Date().toLocaleString();
        hist.push(r);localSet("x_h",hist);
        console.log("AIEP: Saved result",r.name,r.exam,r.pct+"%");
        cloudWrite("results",r.id,{name:r.name||"",email:r.email||"",roll:r.roll||"",exam:r.exam||"",paper:r.paper||"",score:r.score||0,total:r.total||0,pct:r.pct||0,date:new Date().toISOString()});
    },
    clearResults:function(){localSet("x_h",[])},

    getVouchers:function(){var v=localGet("x_v",null);if(!v){v={"FREE2026":{desc:"Free Access",used:0,max:9999,tier:"ultimate"},"LAUNCH50":{desc:"Launch Promo",used:0,max:9999,tier:"starter"}};localSet("x_v",v)}return v},
    saveVouchers:function(v){localSet("x_v",v);for(var code in v){if(v.hasOwnProperty(code))cloudWrite("vouchers",code,v[code])}},
    useVoucher:function(code){var v=this.getVouchers();if(!v[code])return{ok:false,msg:"Invalid code"};if(v[code].used>=v[code].max)return{ok:false,msg:"Limit reached"};v[code].used=(v[code].used||0)+1;localSet("x_v",v);cloudWrite("vouchers",code,v[code]);return{ok:true,tier:v[code].tier,desc:v[code].desc}},
    addVoucher:function(code,data){var v=this.getVouchers();v[code]=data;localSet("x_v",v);cloudWrite("vouchers",code,data)},
    deleteVoucher:function(code){var v=this.getVouchers();delete v[code];localSet("x_v",v);cloudDelete("vouchers",code)},

    getFacultyQ:function(){return localGet("f_questions",{})},
    saveFacultyQ:function(allQ){localSet("f_questions",allQ);for(var key in allQ){if(allQ.hasOwnProperty(key)){var safeKey=key.replace(/[^a-zA-Z0-9_]/g,"_");cloudWrite("facultyq",safeKey,{paperKey:key,count:allQ[key].length,questions:JSON.stringify(allQ[key]),updated:new Date().toISOString()})}}},
    addQuestion:function(ek,pk,qObj){var all=this.getFacultyQ();var key=ek+"_"+pk;if(!all[key])all[key]=[];all[key].push(qObj);this.saveFacultyQ(all)},
    deleteQuestion:function(ek,pk,qId){var all=this.getFacultyQ();var key=ek+"_"+pk;if(!all[key])return;all[key]=all[key].filter(function(q){return q.id!==qId});this.saveFacultyQ(all)},
    deleteAllQuestions:function(ek,pk){var all=this.getFacultyQ();delete all[ek+"_"+pk];this.saveFacultyQ(all)},
    importBulkQ:function(ek,pk,arr){var all=this.getFacultyQ();var key=ek+"_"+pk;if(!all[key])all[key]=[];var added=0;for(var i=0;i<arr.length;i++){var q=arr[i];if(!q.question||!q.options||!q.options.A)continue;all[key].push({id:"fq_"+uid()+"_"+i,q:q.question,opts:{A:q.options.A,B:q.options.B,C:q.options.C||"",D:q.options.D||""},ans:(q.answer||"A").toUpperCase(),diff:q.difficulty||"medium",topic:q.topic||"",explain:q.explanation||"",date:new Date().toLocaleString()});added++}this.saveFacultyQ(all);return added},

    getTier:function(){return localGet("x_tier","free")},
    setTier:function(t){localSet("x_tier",t)},
    getCurrentUser:function(){return localGet("x_cur",null)},
    setCurrentUser:function(u){localSet("x_cur",u)},
    clearCurrentUser:function(){localStorage.removeItem("x_cur")},

    getAdminCreds:function(){return localGet("x_c",{u:"admin",p:"admin@2026"})},
    setAdminCreds:function(u,p){localSet("x_c",{u:u,p:p});cloudWrite("adminconfig","admincreds",{username:u,updated:new Date().toISOString()})},
    getFacultyCreds:function(){return localGet("f_creds",{u:"faculty",p:"faculty@2026"})},
    setFacultyCreds:function(u,p){localSet("f_creds",{u:u,p:p});cloudWrite("adminconfig","facultycreds",{username:u,updated:new Date().toISOString()})},

    log:function(action){var arr=localGet("x_l",[]);arr.push({a:action,t:new Date().toLocaleString()});if(arr.length>500)arr=arr.slice(-500);localSet("x_l",arr);cloudWrite("logs",uid(),{action:action,time:new Date().toISOString()})},
    getLogs:function(){return localGet("x_l",[])},

    exportAll:function(){return{version:"11.0",exported:new Date().toISOString(),users:this.getUsers(),results:this.getResults(),vouchers:this.getVouchers(),facultyQuestions:this.getFacultyQ(),tier:this.getTier(),adminCreds:this.getAdminCreds(),facultyCreds:this.getFacultyCreds(),logs:this.getLogs()}},
    importAll:function(data){if(data.users)localSet("x_u",data.users);if(data.results)localSet("x_h",data.results);if(data.vouchers)localSet("x_v",data.vouchers);if(data.facultyQuestions)localSet("f_questions",data.facultyQuestions);if(data.tier)localSet("x_tier",data.tier);if(data.adminCreds)localSet("x_c",data.adminCreds);if(data.facultyCreds)localSet("f_creds",data.facultyCreds);if(data.logs)localSet("x_l",data.logs)}
};
})();
