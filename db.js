// ============================================================
// AIEP DATABASE LAYER — InstantDB + localStorage fallback
// Loaded by: index.html, faculty.html, admin.html
// ============================================================
(function(){
"use strict";

var APP_ID = "52877744-72cc-404a-b68e-fb01f3e387ac";
var db = null;
var dbReady = false;
var listeners = [];

// ---- CORE ----
window.AIEP = {
    ready: false,
    db: null,

    // ---- CONNECTION STATUS ----
    isConnected: function(){ return dbReady; },

    // ---- INIT ----
    init: function(onReady){
        if(!APP_ID || APP_ID === "YOUR_APP_ID"){
            console.log("AIEP: No App ID, running localStorage only");
            if(onReady) onReady(false);
            return;
        }
        var s = document.createElement("script");
        s.src = "https://unpkg.com/@instantdb/core";
        s.onload = function(){
            try {
                db = instant.init({ appId: APP_ID });
                AIEP.db = db;
                AIEP.ready = true;
                dbReady = true;
                console.log("AIEP: InstantDB connected");
                AIEP._notify("connected", true);
                if(onReady) onReady(true);
            } catch(e) {
                console.warn("AIEP: InstantDB init failed:", e);
                if(onReady) onReady(false);
            }
        };
        s.onerror = function(){
            console.warn("AIEP: InstantDB CDN failed to load");
            if(onReady) onReady(false);
        };
        document.head.appendChild(s);

        // Timeout fallback
        setTimeout(function(){
            if(!dbReady){
                console.warn("AIEP: InstantDB timeout, using localStorage");
                if(onReady) onReady(false);
            }
        }, 8000);
    },

    // ---- EVENT SYSTEM ----
    on: function(event, cb){
        listeners.push({event:event, cb:cb});
    },
    _notify: function(event, data){
        for(var i=0;i<listeners.length;i++){
            if(listeners[i].event === event) listeners[i].cb(data);
        }
    },

    // ---- USERS ----
    getUsers: function(){
        return AIEP._local("x_u", []);
    },
    saveUser: function(user){
        var users = AIEP.getUsers();
        var exists = false;
        for(var i=0;i<users.length;i++){
            if(users[i].email && users[i].email.toLowerCase() === user.email.toLowerCase()){
                exists = true;
                break;
            }
        }
        if(!exists){
            user.id = user.id || AIEP._uid();
            user.joined = user.joined || new Date().toLocaleString();
            users.push(user);
            AIEP._local("x_u", users);
            AIEP._cloudWrite("portalusers", user.id, {
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                roll: user.roll || "",
                tier: user.tier || "free",
                joined: new Date().toISOString()
            });
        }
        return user;
    },

    // ---- RESULTS ----
    getResults: function(){
        return AIEP._local("x_h", []);
    },
    saveResult: function(result){
        var hist = AIEP.getResults();
        result.id = result.id || AIEP._uid();
        result.date = result.date || new Date().toLocaleString();
        hist.push(result);
        AIEP._local("x_h", hist);
        AIEP._cloudWrite("results", result.id, {
            name: result.name || "",
            email: result.email || "",
            roll: result.roll || "",
            exam: result.exam || "",
            paper: result.paper || "",
            score: result.score || 0,
            total: result.total || 0,
            pct: result.pct || 0,
            date: new Date().toISOString()
        });
        return result;
    },
    clearResults: function(){
        AIEP._local("x_h", []);
        // Cloud results persist unless manually deleted
    },

    // ---- VOUCHERS ----
    getVouchers: function(){
        var defaults = {
            "FREE2026": {desc:"Free Access",used:0,max:9999,tier:"ultimate"},
            "LAUNCH50": {desc:"Launch Promo",used:0,max:9999,tier:"starter"}
        };
        var stored = AIEP._local("x_v", null);
        if(!stored){
            AIEP._local("x_v", defaults);
            return defaults;
        }
        // Merge defaults if missing
        for(var k in defaults){
            if(!stored[k]) stored[k] = defaults[k];
        }
        return stored;
    },
    saveVouchers: function(v){
        AIEP._local("x_v", v);
        // Sync each voucher to cloud
        for(var code in v){
            if(v.hasOwnProperty(code)){
                AIEP._cloudWrite("vouchers", code, v[code]);
            }
        }
    },
    useVoucher: function(code){
        var v = AIEP.getVouchers();
        if(!v[code]) return {ok:false, msg:"Invalid code"};
        if(v[code].used >= v[code].max) return {ok:false, msg:"Limit reached"};
        v[code].used = (v[code].used || 0) + 1;
        AIEP.saveVouchers(v);
        // Update single field in cloud
        if(db && dbReady){
            try{ db.transact(db.tx.vouchers[code].update({used: v[code].used})) }catch(e){}
        }
        return {ok:true, tier: v[code].tier, desc: v[code].desc};
    },
    addVoucher: function(code, data){
        var v = AIEP.getVouchers();
        v[code] = data;
        AIEP.saveVouchers(v);
    },
    deleteVoucher: function(code){
        var v = AIEP.getVouchers();
        delete v[code];
        AIEP._local("x_v", v);
        if(db && dbReady){
            try{ db.transact(db.tx.vouchers[code].delete()) }catch(e){}
        }
    },

    // ---- FACULTY QUESTIONS ----
    getFacultyQ: function(){
        return AIEP._local("f_questions", {});
    },
    saveFacultyQ: function(allQ){
        AIEP._local("f_questions", allQ);
        // Sync each paper's questions to cloud
        for(var key in allQ){
            if(allQ.hasOwnProperty(key)){
                AIEP._cloudWrite("facultyq", key.replace(/[^a-zA-Z0-9]/g,"_"), {
                    paperKey: key,
                    questions: JSON.stringify(allQ[key]),
                    count: allQ[key].length,
                    updated: new Date().toISOString()
                });
            }
        }
    },
    addQuestion: function(examKey, paperKey, qObj){
        var all = AIEP.getFacultyQ();
        var key = examKey + "_" + paperKey;
        if(!all[key]) all[key] = [];
        all[key].push(qObj);
        AIEP.saveFacultyQ(all);
    },
    deleteQuestion: function(examKey, paperKey, qId){
        var all = AIEP.getFacultyQ();
        var key = examKey + "_" + paperKey;
        if(!all[key]) return;
        all[key] = all[key].filter(function(q){ return q.id !== qId });
        AIEP.saveFacultyQ(all);
    },
    deleteAllQuestions: function(examKey, paperKey){
        var all = AIEP.getFacultyQ();
        var key = examKey + "_" + paperKey;
        delete all[key];
        AIEP.saveFacultyQ(all);
    },
    importBulkQ: function(examKey, paperKey, questionsArray){
        var all = AIEP.getFacultyQ();
        var key = examKey + "_" + paperKey;
        if(!all[key]) all[key] = [];
        var added = 0;
        for(var i=0;i<questionsArray.length;i++){
            var q = questionsArray[i];
            if(!q.question || !q.options || !q.options.A || !q.options.B) continue;
            all[key].push({
                id: "fq_" + AIEP._uid() + "_" + i,
                q: q.question,
                opts: {A:q.options.A, B:q.options.B, C:q.options.C||"", D:q.options.D||""},
                ans: (q.answer||"A").toUpperCase(),
                diff: q.difficulty || "medium",
                topic: q.topic || "",
                explain: q.explanation || "",
                date: new Date().toLocaleString()
            });
            added++;
        }
        AIEP.saveFacultyQ(all);
        return added;
    },

    // ---- TIER ----
    getTier: function(){
        return AIEP._local("x_tier", "free");
    },
    setTier: function(t){
        AIEP._local("x_tier", t);
    },

    // ---- CURRENT USER (session) ----
    getCurrentUser: function(){
        return AIEP._local("x_cur", null);
    },
    setCurrentUser: function(user){
        AIEP._local("x_cur", user);
    },
    clearCurrentUser: function(){
        localStorage.removeItem("x_cur");
    },

    // ---- CREDENTIALS ----
    getAdminCreds: function(){
        return AIEP._local("x_c", {u:"admin", p:"admin@2026"});
    },
    setAdminCreds: function(u, p){
        AIEP._local("x_c", {u:u, p:p});
        AIEP._cloudWrite("adminconfig", "creds", {username: u, updated: new Date().toISOString()});
    },
    getFacultyCreds: function(){
        return AIEP._local("f_creds", {u:"faculty", p:"faculty@2026"});
    },
    setFacultyCreds: function(u, p){
        AIEP._local("f_creds", {u:u, p:p});
        AIEP._cloudWrite("adminconfig", "facultycreds", {username: u, updated: new Date().toISOString()});
    },

    // ---- ACTIVITY LOG ----
    log: function(action){
        var arr = AIEP._local("x_l", []);
        arr.push({a: action, t: new Date().toLocaleString()});
        if(arr.length > 500) arr = arr.slice(-500);
        AIEP._local("x_l", arr);
        AIEP._cloudWrite("logs", AIEP._uid(), {
            action: action,
            time: new Date().toISOString()
        });
    },
    getLogs: function(){
        return AIEP._local("x_l", []);
    },

    // ---- SUBSCRIBE (real-time updates) ----
    subscribe: function(){
        if(!db || !dbReady) return;
        try{
            db.subscribeQuery(
                {results:{}, portalusers:{}, vouchers:{}, facultyq:{}, logs:{}, adminconfig:{}},
                function(resp){
                    if(resp.error){
                        console.warn("AIEP subscribe error:", resp.error);
                        dbReady = false;
                        AIEP._notify("connected", false);
                        return;
                    }
                    dbReady = true;
                    if(resp.data){
                        // Sync cloud data to localStorage
                        AIEP._syncCloudToLocal(resp.data);
                        AIEP._notify("data", resp.data);
                    }
                }
            );
        }catch(e){ console.warn("AIEP subscribe failed:", e) }
    },

    // ---- FULL BACKUP ----
    exportAll: function(){
        return {
            version: "11.0",
            exported: new Date().toISOString(),
            users: AIEP.getUsers(),
            results: AIEP.getResults(),
            vouchers: AIEP.getVouchers(),
            facultyQuestions: AIEP.getFacultyQ(),
            tier: AIEP.getTier(),
            adminCreds: AIEP.getAdminCreds(),
            facultyCreds: AIEP.getFacultyCreds(),
            logs: AIEP.getLogs()
        };
    },
    importAll: function(data){
        if(data.users) AIEP._local("x_u", data.users);
        if(data.results) AIEP._local("x_h", data.results);
        if(data.vouchers) AIEP._local("x_v", data.vouchers);
        if(data.facultyQuestions) AIEP._local("f_questions", data.facultyQuestions);
        if(data.tier) AIEP._local("x_tier", data.tier);
        if(data.adminCreds) AIEP._local("x_c", data.adminCreds);
        if(data.facultyCreds) AIEP._local("f_creds", data.facultyCreds);
        if(data.logs) AIEP._local("x_l", data.logs);
    },

    // ---- INTERNALS ----
    _uid: function(){
        return Date.now().toString(36) + Math.random().toString(36).substr(2,9);
    },
    _local: function(key, def){
        try{
            var s = localStorage.getItem(key);
            if(s === null || s === "null") return def;
            return JSON.parse(s);
        }catch(e){ return def }
    },
    _cloudWrite: function(collection, id, data){
        if(!db || !dbReady) return;
        try{
            var tx = db.tx;
            if(tx[collection]){
                db.transact(tx[collection][id].update(data));
            }
        }catch(e){ /* silently fail, localStorage is primary */ }
    },
    _syncCloudToLocal: function(cloudData){
        // Merge cloud users into local
        try{
            if(cloudData.portalusers){
                var cloudUsers = [];
                for(var k in cloudData.portalusers){
                    if(cloudData.portalusers.hasOwnProperty(k)){
                        cloudUsers.push(cloudData.portalusers[k]);
                    }
                }
                if(cloudUsers.length > 0){
                    var localUsers = AIEP._local("x_u", []);
                    var localEmails = {};
                    for(var i=0;i<localUsers.length;i++){
                        if(localUsers[i].email) localEmails[localUsers[i].email.toLowerCase()] = true;
                    }
                    for(var i=0;i<cloudUsers.length;i++){
                        if(cloudUsers[i].email && !localEmails[cloudUsers[i].email.toLowerCase()]){
                            localUsers.push({
                                id: k,
                                name: cloudUsers[i].name || "",
                                email: cloudUsers[i].email || "",
                                phone: cloudUsers[i].phone || "",
                                roll: cloudUsers[i].roll || "",
                                tier: cloudUsers[i].tier || "free",
                                joined: cloudUsers[i].joined || ""
                            });
                        }
                    }
                    AIEP._local("x_u", localUsers);
                }
            }

            // Merge cloud results
            if(cloudData.results){
                var cloudResults = [];
                for(var k in cloudData.results){
                    if(cloudData.results.hasOwnProperty(k)){
                        cloudResults.push(cloudData.results[k]);
                    }
                }
                if(cloudResults.length > 0){
                    var localResults = AIEP._local("x_h", []);
                    var localDates = {};
                    for(var i=0;i<localResults.length;i++){
                        localDates[localResults[i].date+"_"+localResults[i].name] = true;
                    }
                    var merged = false;
                    for(var i=0;i<cloudResults.length;i++){
                        var cr = cloudResults[i];
                        var ck = (cr.date||"")+"_"+(cr.name||"");
                        if(!localDates[ck]){
                            localResults.push(cr);
                            merged = true;
                        }
                    }
                    if(merged) AIEP._local("x_h", localResults);
                }
            }

            // Update vouchers from cloud (cloud wins for shared codes)
            if(cloudData.vouchers && Object.keys(cloudData.vouchers).length > 0){
                var localV = AIEP._local("x_v", {});
                for(var code in cloudData.vouchers){
                    if(cloudData.vouchers.hasOwnProperty(code)){
                        // Cloud version wins for used count
                        if(!localV[code]){
                            localV[code] = cloudData.vouchers[code];
                        }else{
                            localV[code].used = Math.max(
                                localV[code].used || 0,
                                cloudData.vouchers[code].used || 0
                            );
                        }
                    }
                }
                AIEP._local("x_v", localV);
            }
        }catch(e){ console.warn("Sync error:", e) }
    }
};

})();
