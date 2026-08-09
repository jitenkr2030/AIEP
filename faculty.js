// ============================================================
// AIEP FACULTY PANEL — Question Management System
// ============================================================
(function(){
"use strict";

var EX = window.EXAMS || {};
var TP = window.TOPICS || {};
var loggedIn = false;
var currentTab = "F_DASH";

// ---- HELPERS ----
function enc(s){return btoa(unescape(encodeURIComponent(s)))}
function dec(s){try{return decodeURIComponent(escape(atob(s)))}catch(e){return s}}
function G(k,d){try{var s=localStorage.getItem(k);return s?JSON.parse(s):d}catch(e){return d}}
function S(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9)}

function toast(m,t){
    var d=document.createElement("div");
    d.style.cssText="position:fixed;top:18px;right:18px;padding:11px 20px;border-radius:10px;font-size:12px;font-weight:700;z-index:99999;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);max-width:340px;transition:opacity .3s";
    d.style.background=t==="error"?"#DC2626":t==="ok"?"#059669":"#1D4ED8";
    d.textContent=m;document.body.appendChild(d);
    setTimeout(function(){d.style.opacity="0"},2800);
    setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},3200);
}

function showStatus(elId,msg,type){
    var el=document.getElementById(elId);
    if(!el)return;
    el.className="info-box "+(type==="error"?"info-red":type==="ok"?"info-green":"info-blue");
    el.innerHTML=msg;
    el.classList.remove("hide");
}

// ---- FACULTY CREDENTIALS ----
function getFCreds(){return G("f_creds",{u:"faculty",p:"faculty@2026"})}
function setFCreds(u,p){S("f_creds",{u:u,p:p})}

// ---- FACULTY QUESTIONS STORAGE ----
// Format: { "examKey_paperKey": [ {id,q,opts:{A,B,C,D},ans,topic,diff,explain,faculty,date}, ... ] }
function getFQ(){return G("f_questions",{})}
function saveFQ(q){S("f_questions",q)}

function getQsForPaper(examKey,paperKey){
    var all=getFQ();
    var key=examKey+"_"+paperKey;
    return all[key]||[];
}

function addQToPaper(examKey,paperKey,qObj){
    var all=getFQ();
    var key=examKey+"_"+paperKey;
    if(!all[key])all[key]=[];
    all[key].push(qObj);
    saveFQ(all);
    // Also inject into EXAMS object so student portal uses it
    injectToExams(examKey,paperKey,qObj);
}

function deleteQFromPaper(examKey,paperKey,qId){
    var all=getFQ();
    var key=examKey+"_"+paperKey;
    if(!all[key])return;
    all[key]=all[key].filter(function(q){return q.id!==qId});
    saveFQ(all);
    rebuildExamsForPaper(examKey,paperKey);
}

function deleteAllFromPaper(examKey,paperKey){
    var all=getFQ();
    var key=examKey+"_"+paperKey;
    delete all[key];
    saveFQ(all);
    rebuildExamsForPaper(examKey,paperKey);
}

function clearAllFacultyQ(){
    S("f_questions",{});
}

// ---- INJECT FACULTY QUESTIONS INTO EXAMS ----
// Faculty questions are stored as plain text. We encode them for the exam engine.
function injectToExams(examKey,paperKey,qObj){
    if(!EX[examKey]||!EX[examKey].papers[paperKey])return;
    var encoded={
        id:qObj.id,
        t:enc(qObj.q),
        o:{A:enc(qObj.opts.A),B:enc(qObj.opts.B),C:enc(qObj.opts.C),D:enc(qObj.opts.D)},
        a:enc(qObj.ans)
    };
    // Check if already exists
    var qs=EX[examKey].papers[paperKey].qs;
    var found=false;
    for(var i=0;i<qs.length;i++){if(qs[i].id===qObj.id){qs[i]=encoded;found=true;break}}
    if(!found)qs.push(encoded);
}

function rebuildExamsForPaper(examKey,paperKey){
    if(!EX[examKey]||!EX[examKey].papers[paperKey])return;
    // Get all faculty questions for this paper
    var fq=getQsForPaper(examKey,paperKey);
    // Keep original auto-generated questions and replace/augment with faculty
    // Strategy: faculty questions replace the first N auto questions, rest are auto
    var origQs=EX[examKey].papers[paperKey]._origQs||EX[examKey].papers[paperKey].qs;
    if(!EX[examKey].papers[paperKey]._origQs)EX[examKey].papers[paperKey]._origQs=origQs.slice();
    var newQs=[];
    // Add faculty questions first
    for(var i=0;i<fq.length;i++){
        newQs.push({id:fq[i].id,t:enc(fq[i].q),o:{A:enc(fq[i].opts.A),B:enc(fq[i].opts.B),C:enc(fq[i].opts.C),D:enc(fq[i].opts.D)},a:enc(fq[i].ans)});
    }
    // Fill remaining with auto-generated (up to 100 total)
    var remaining=Math.max(0,100-newQs.length);
    for(var i=0;i<Math.min(remaining,origQs.length);i++){
        // Avoid duplicates
        var exists=false;
        for(var j=0;j<newQs.length;j++){if(newQs[j].id===origQs[i].id){exists=true;break}}
        if(!exists)newQs.push(origQs[i]);
    }
    EX[examKey].papers[paperKey].qs=newQs;
}

// Inject all faculty questions on load
function injectAllFacultyQ(){
    var all=getFQ();
    var keys=Object.keys(all);
    for(var k=0;k<keys.length;k++){
        var parts=keys[k].split("_");
        if(parts.length<2)continue;
        // Rebuild exam key (handle keys like "ca_0_1" where exam is "ca" and paper is "0_1")
        // The key format is examKey_paperKey, but paperKey itself may contain underscores
        // We need to find the split point
        var examKey=parts[0];
        var paperKey=parts.slice(1).join("_");
        if(!EX[examKey]||!EX[examKey].papers[paperKey])continue;
        var qs=all[keys[k]];
        for(var i=0;i<qs.length;i++){
            injectToExams(examKey,paperKey,qs[i]);
        }
    }
}

// ---- LOGIN ----
function doFLogin(){
    var u=document.getElementById("FU").value.trim();
    var p=document.getElementById("FP").value.trim();
    var err=document.getElementById("FERR");
    err.classList.add("hide");
    if(!u||!p){err.textContent="Enter both fields.";err.classList.remove("hide");return}
    var c=getFCreds();
    if(u===c.u&&p===c.p){
        loggedIn=true;
        document.getElementById("FNAM").textContent=c.u;
        document.getElementById("FU").value="";
        document.getElementById("FP").value="";
        document.getElementById("V_FLOGIN").classList.add("hide");
        document.getElementById("V_FDASH").classList.remove("hide");
        refreshDashboard();
        toast("Welcome!","ok");
    }else{
        err.textContent="Invalid credentials.";
        err.classList.remove("hide");
    }
}

function doFLogout(){
    loggedIn=false;
    document.getElementById("V_FDASH").classList.add("hide");
    document.getElementById("V_FLOGIN").classList.remove("hide");
    toast("Logged out","ok");
}

// ---- POPULATE SELECTS ----
function fillExamSelects(){
    var ids=["FA_EXAM","FB_EXAM","FM_EXAM","FE_EXAM","FP_EXAM"];
    for(var s=0;s<ids.length;s++){
        var sel=document.getElementById(ids[s]);
        if(!sel)continue;
        sel.innerHTML="";
        var keys=Object.keys(EX);
        for(var i=0;i<keys.length;i++){
            var opt=document.createElement("option");
            opt.value=keys[i];
            opt.textContent=EX[keys[i]].name;
            sel.appendChild(opt);
        }
    }
    updateAllPaperSelects();
}

function updatePaperSelect(examSelId,paperSelId){
    var ev=document.getElementById(examSelId).value;
    var ps=document.getElementById(paperSelId);
    ps.innerHTML="";
    if(!EX[ev])return;
    var pks=Object.keys(EX[ev].papers);
    for(var i=0;i<pks.length;i++){
        var opt=document.createElement("option");
        opt.value=pks[i];
        opt.textContent=EX[ev].papers[pks[i]].title;
        ps.appendChild(opt);
    }
}

function updateAllPaperSelects(){
    updatePaperSelect("FA_EXAM","FA_PAPER");
    updatePaperSelect("FB_EXAM","FB_PAPER");
    updatePaperSelect("FM_EXAM","FM_PAPER");
    updatePaperSelect("FE_EXAM","FE_PAPER");
    updatePaperSelect("FP_EXAM","FP_PAPER");
}

// ---- DASHBOARD ----
function refreshDashboard(){
    var all=getFQ();
    var keys=Object.keys(all);
    var totalQ=0,totalPapers=0,byExam={};
    for(var k=0;k<keys.length;k++){
        var qs=all[keys[k]];
        totalQ+=qs.length;
        totalPapers++;
        var examName=keys[k].split("_")[0];
        var exObj=EX[examName];
        if(!byExam[examName])byExam[examName]={name:exObj?exObj.name:examName,papers:0,questions:0};
        byExam[examName].papers++;
        byExam[examName].questions+=qs.length;
    }
    document.getElementById("F_STATS").innerHTML=
        '<div class="stat"><div class="num">'+totalQ+'</div><div class="lbl">Your Questions</div></div>'+
        '<div class="stat"><div class="num">'+totalPapers+'</div><div class="lbl">Papers</div></div>'+
        '<div class="stat"><div class="num">'+Object.keys(byExam).length+'</div><div class="lbl">Exams</div></div>'+
        '<div class="stat"><div class="num">'+Object.keys(EX).length+'</div><div class="lbl">Total Exams</div></div>';

    var tb=document.getElementById("F_QSTAT");
    tb.innerHTML="";
    if(!keys.length){
        tb.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--mut);padding:20px">No questions yet. Go to "Add Questions" tab to start.</td></tr>';
        return;
    }
    for(var k=0;k<keys.length;k++){
        var qs=all[keys[k]];
        var parts=keys[k].split("_");
        var examKey=parts[0];
        var paperKey=parts.slice(1).join("_");
        var exObj=EX[examKey];
        var paperObj=exObj&&exObj.papers[paperKey];
        var examName=exObj?exObj.name:examKey;
        var paperName=paperObj?paperObj.title:paperKey;
        var diff={easy:0,medium:0,hard:0};
        for(var i=0;i<qs.length;i++){diff[qs[i].diff||"medium"]++}
        var tr=document.createElement("tr");
        tr.innerHTML='<td>'+examName+'</td><td>'+paperName+'</td><td><span class="badge b-blue">'+qs.length+'</span> <span style="font-size:10px;color:var(--mut)">(E:'+diff.easy+' M:'+diff.medium+' H:'+diff.hard+')</span></td><td>'+Math.round((diff.easy*100+diff.medium*60+diff.hard*30)/Math.max(1,qs.length))+'%</td><td><button class="del-btn" data-ek="'+examKey+'" data-pk="'+paperKey+'">Clear All</button></td>';
        tb.appendChild(tr);
    }
    // Bind delete buttons
    tb.querySelectorAll(".del-btn").forEach(function(btn){
        btn.onclick=function(){
            if(!confirm("Delete ALL questions in this paper?"))return;
            deleteAllFromPaper(this.getAttribute("data-ek"),this.getAttribute("data-pk"));
            refreshDashboard();
            toast("Deleted","ok");
        };
    });
}

// ---- ADD SINGLE QUESTION ----
function addSingleQ(){
    var examKey=document.getElementById("FA_EXAM").value;
    var paperKey=document.getElementById("FA_PAPER").value;
    var q=document.getElementById("FA_Q").value.trim();
    var a=document.getElementById("FA_A").value.trim();
    var b=document.getElementById("FA_B").value.trim();
    var c=document.getElementById("FA_C").value.trim();
    var d=document.getElementById("FA_D").value.trim();
    var ans=document.getElementById("FA_ANS").value;
    var diff=document.getElementById("FA_DIFF").value;
    var topic=document.getElementById("FA_TOPIC").value.trim();
    var explain=document.getElementById("FA_EXPLAIN").value.trim();

    if(!q){toast("Enter question","error");return}
    if(!a||!b){toast("Enter at least options A and B","error");return}

    var qObj={
        id:"fq_"+uid(),
        q:q,
        opts:{A:a,B:b,C:c||"(Not provided)",D:d||"(Not provided)"},
        ans:ans,
        diff:diff,
        topic:topic,
        explain:explain,
        faculty:getFCreds().u,
        date:new Date().toLocaleString()
    };

    addQToPaper(examKey,paperKey,qObj);
    showStatus("FA_STATUS",'&#10003; <strong>Question added!</strong> Total in this paper: '+getQsForPaper(examKey,paperKey).length,"ok");
    toast("Question added!","ok");

    // Clear fields but keep exam/paper selection
    document.getElementById("FA_Q").value="";
    document.getElementById("FA_A").value="";
    document.getElementById("FA_B").value="";
    document.getElementById("FA_C").value="";
    document.getElementById("FA_D").value="";
    document.getElementById("FA_TOPIC").value="";
    document.getElementById("FA_EXPLAIN").value="";
    document.getElementById("FA_Q").focus();
}

// ---- BULK IMPORT ----
function validateJSON(){
    var raw=document.getElementById("FB_JSON").value.trim();
    if(!raw){showStatus("FB_STATUS","Paste JSON data first.","error");return}
    try{
        var data=JSON.parse(raw);
        if(!Array.isArray(data)){showStatus("FB_STATUS","JSON must be an array [].","error");return}
        var errors=[];
        for(var i=0;i<data.length;i++){
            var q=data[i];
            if(!q.question)errors.push("Item "+(i+1)+": missing 'question'");
            if(!q.options||!q.options.A||!q.options.B)errors.push("Item "+(i+1)+": missing 'options.A' or 'options.B'");
            if(!q.answer||!["A","B","C","D"].indexOf(q.answer.toUpperCase())===-1)errors.push("Item "+(i+1)+": invalid 'answer'");
        }
        if(errors.length){
            showStatus("FB_STATUS","<strong>"+errors.length+" errors found:</strong><br>"+errors.slice(0,10).join("<br>")+(errors.length>10?"<br>...and "+(errors.length-10)+" more":""),"error");
        }else{
            showStatus("FB_STATUS","&#10003; <strong>Valid!</strong> "+data.length+" questions ready to import.","ok");
        }
    }catch(e){
        showStatus("FB_STATUS","<strong>JSON Parse Error:</strong> "+e.message,"error");
    }
}

function importBulkQ(){
    var examKey=document.getElementById("FB_EXAM").value;
    var paperKey=document.getElementById("FB_PAPER").value;
    var raw=document.getElementById("FB_JSON").value.trim();

    if(!raw){showStatus("FB_STATUS","Paste JSON data first.","error");return}

    var data;
    try{data=JSON.parse(raw)}catch(e){showStatus("FB_STATUS","<strong>JSON Error:</strong> "+e.message,"error");return}
    if(!Array.isArray(data)){showStatus("FB_STATUS","Must be an array.","error");return}
    if(data.length>500){showStatus("FB_STATUS","Max 500 questions per import.","error");return}

    var added=0,skipped=0;
    for(var i=0;i<data.length;i++){
        var q=data[i];
        if(!q.question||!q.options||!q.options.A||!q.options.B){skipped++;continue}
        var qObj={
            id:"fq_"+uid()+"_"+i,
            q:q.question,
            opts:{A:q.options.A||"",B:q.options.B||"",C:q.options.C||"",D:q.options.D||""},
            ans:(q.answer||"A").toUpperCase(),
            diff:q.difficulty||"medium",
            topic:q.topic||"",
            explain:q.explanation||"",
            faculty:getFCreds().u,
            date:new Date().toLocaleString()
        };
        addQToPaper(examKey,paperKey,qObj);
        added++;
    }

    showStatus("FB_STATUS",'&#10003; <strong>Imported '+added+' questions</strong>'+(skipped?' ('+skipped+' skipped due to errors)':'')+' into '+EX[examKey].name+' / '+paperKey,"ok");
    toast("Imported "+added+" questions!","ok");
    document.getElementById("FB_JSON").value="";
}

function downloadTemplate(){
    var template=[
        {question:"Which correctly describes Revenue Recognition under Ind AS 115?",options:{A:"Recognize when cash is received",B:"Recognize when performance obligation is satisfied",C:"Recognize only on cash basis",D:"Never recognize before delivery"},answer:"B",topic:"Revenue Recognition",difficulty:"medium",explanation:"Per Ind AS 115, revenue is recognized when performance obligation is satisfied."},
        {question:"The minimum paid-up capital for a public company under Companies Act 2013:",options:{A:"Rs 1 lakh",B:"Rs 5 lakh",C:"Rs 10 lakh",D:"Rs 50 lakh"},answer:"B",topic:"Companies Act 2013",difficulty:"easy",explanation:"Section 4(1) requires minimum Rs 5 lakh for public company."},
        {question:"Which of the following is NOT a qualifying asset under Ind AS 23?",options:{A:"Manufacturing plant",B:"Power generation facility",C:"Inventories produced in large quantities",D:"Intangible asset under development"},answer:"C",topic:"Borrowing Costs",difficulty:"hard",explanation:"Inventories routinely manufactured are not qualifying assets."}
    ];
    var blob=new Blob([JSON.stringify(template,null,2)],{type:"application/json"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="AIEP_Question_Template.json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("Template downloaded!","ok");
}

// File drop
function setupDropZone(){
    var zone=document.getElementById("DROP_ZONE");
    if(!zone)return;
    zone.addEventListener("dragover",function(e){e.preventDefault();zone.classList.add("drag-over")});
    zone.addEventListener("dragleave",function(){zone.classList.remove("drag-over")});
    zone.addEventListener("drop",function(e){
        e.preventDefault();zone.classList.remove("drag-over");
        var f=e.dataTransfer.files[0];
        if(!f)return;
        if(!f.name.endsWith(".json")){toast("Only .json files","error");return}
        var r=new FileReader();
        r.onload=function(ev){
            document.getElementById("FB_JSON").value=ev.target.result;
            showStatus("FB_STATUS",'File "'+f.name+'" loaded. Click Validate or Import.','info');
        };
        r.readAsText(f);
    });
    zone.addEventListener("click",function(){
        var inp=document.createElement("input");inp.type="file";inp.accept=".json";
        inp.onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){document.getElementById("FB_JSON").value=ev.target.result};r.readAsText(f)};
        inp.click();
    });
}

// ---- MANAGE ----
function loadManageQ(){
    var examKey=document.getElementById("FM_EXAM").value;
    var paperKey=document.getElementById("FM_PAPER").value;
    var qs=getQsForPaper(examKey,paperKey);
    var search=document.getElementById("FM_SEARCH").value.toLowerCase();
    var tb=document.getElementById("FM_TB");
    tb.innerHTML="";

    var filtered=qs;
    if(search){
        filtered=qs.filter(function(q){return q.q.toLowerCase().indexOf(search)!==-1||(q.topic||"").toLowerCase().indexOf(search)!==-1});
    }

    if(!filtered.length){
        tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--mut);padding:20px">No questions found.</td></tr>';
        return;
    }

    for(var i=0;i<filtered.length;i++){
        var q=filtered[i];
        var diffColor=q.diff==="hard"?"b-red":q.diff==="easy"?"b-green":"b-gold";
        var tr=document.createElement("tr");
        tr.innerHTML="<td>"+(i+1)+"</td>"+
            "<td style='max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>"+q.q+"</td>"+
            "<td><span class='badge b-green'>"+q.ans+"</span></td>"+
            "<td><span class='badge "+diffColor+"'>"+(q.diff||"medium")+"</span></td>"+
            "<td style='font-size:10px'>"+(q.topic||"-")+"</td>"+
            "<td><button class='edit-btn' data-ek='"+examKey+"' data-pk='"+paperKey+"' data-qid='"+q.id+"'>Edit</button> <button class='del-btn' data-ek='"+examKey+"' data-pk='"+paperKey+"' data-qid='"+q.id+"'>Del</button></td>";
        tb.appendChild(tr);
    }

    // Bind buttons
    tb.querySelectorAll(".del-btn").forEach(function(btn){
        btn.onclick=function(){
            if(!confirm("Delete this question?"))return;
            deleteQFromPaper(this.getAttribute("data-ek"),this.getAttribute("data-pk"),this.getAttribute("data-qid"));
            loadManageQ();
            toast("Deleted","ok");
        };
    });
    tb.querySelectorAll(".edit-btn").forEach(function(btn){
        btn.onclick=function(){
            editQuestion(this.getAttribute("data-ek"),this.getAttribute("data-pk"),this.getAttribute("data-qid"));
        };
    });
}

function editQuestion(examKey,paperKey,qId){
    var all=getFQ();
    var key=examKey+"_"+paperKey;
    var qs=all[key]||[];
    var q=null;
    for(var i=0;i<qs.length;i++){if(qs[i].id===qId){q=qs[i];break}}
    if(!q){toast("Question not found","error");return}

    // Switch to Add tab and populate
    switchTab("F_ADD");
    document.getElementById("FA_EXAM").value=examKey;
    updatePaperSelect("FA_EXAM","FA_PAPER");
    setTimeout(function(){
        document.getElementById("FA_PAPER").value=paperKey;
    },50);
    document.getElementById("FA_Q").value=q.q;
    document.getElementById("FA_A").value=q.opts.A;
    document.getElementById("FA_B").value=q.opts.B;
    document.getElementById("FA_C").value=q.opts.C||"";
    document.getElementById("FA_D").value=q.opts.D||"";
    document.getElementById("FA_ANS").value=q.ans;
    document.getElementById("FA_DIFF").value=q.diff||"medium";
    document.getElementById("FA_TOPIC").value=q.topic||"";
    document.getElementById("FA_EXPLAIN").value=q.explain||"";

    // Delete old, will be re-added on save
    deleteQFromPaper(examKey,paperKey,qId);
    showStatus("FA_STATUS",'&#9998; <strong>Editing question.</strong> Modify and click "Add Question" to save.','info');
    toast("Editing question","ok");
}

// ---- PREVIEW ----
function loadPreview(){
    var examKey=document.getElementById("FP_EXAM").value;
    var paperKey=document.getElementById("FP_PAPER").value;
    var qs=getQsForPaper(examKey,paperKey);
    var area=document.getElementById("FP_AREA");
    area.innerHTML="";

    if(!qs.length){
        area.innerHTML='<div class="info-box info-blue">No faculty questions in this paper yet. Auto-generated questions are also used.</div>';
        return;
    }

    var show=Math.min(qs.length,20);
    area.innerHTML='<div class="info-box info-teal">Showing '+show+' of '+qs.length+' faculty questions (student view)</div>';

    for(var i=0;i<show;i++){
        var q=qs[i];
        var div=document.createElement("div");
        div.className="q-preview fade-in";
        div.style.animationDelay=(i*0.05)+"s";
        var optsHtml="";
        var optKeys=["A","B","C","D"];
        for(var j=0;j<4;j++){
            var ok=optKeys[j]===q.ans;
            optsHtml+='<span class="'+(ok?"correct-opt":"wrong-opt")+'"><strong>'+optKeys[j]+')</strong> '+(q.opts[optKeys[j]]||"(empty)")+'</span>';
        }
        div.innerHTML='<span class="qnum">Q'+(i+1)+'</span> '+
            '<span style="font-size:10px;margin-left:8px" class="badge '+(q.diff==="hard"?"b-red":q.diff==="easy"?"b-green":"b-gold")+'">'+(q.diff||"medium")+'</span>'+
            (q.topic?' <span style="font-size:10px" class="badge b-blue">'+q.topic+'</span>':'')+
            '<br><br>'+q.q+
            '<div class="opts">'+optsHtml+'</div>'+
            (q.explain?'<div style="margin-top:8px;padding:8px;background:rgba(5,150,105,.05);border-radius:6px;font-size:11px;color:var(--grn)"><strong>Explanation:</strong> '+q.explain+'</div>':'');
        area.appendChild(div);
    }
}

// ---- EXPORT ----
function exportJSON(){
    var examKey=document.getElementById("FE_EXAM").value;
    var paperKey=document.getElementById("FE_PAPER").value;
    var qs=getQsForPaper(examKey,paperKey);
    if(!qs.length){toast("No questions to export","error");return}
    var out=JSON.stringify(qs,null,2);
    document.getElementById("FE_OUT").value=out;
    var blob=new Blob([out],{type:"application/json"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="AIEP_"+examKey+"_"+paperKey+".json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("JSON exported!","ok");
}

function exportCSV(){
    var examKey=document.getElementById("FE_EXAM").value;
    var paperKey=document.getElementById("FE_PAPER").value;
    var qs=getQsForPaper(examKey,paperKey);
    if(!qs.length){toast("No questions to export","error");return}
    var csv="No,Question,Option A,Option B,Option C,Option D,Correct Answer,Topic,Difficulty,Explanation\n";
    for(var i=0;i<qs.length;i++){
        var q=qs[i];
        csv+=(i+1)+',"'+q.q.replace(/"/g,'""')+'","'+(q.opts.A||"").replace(/"/g,'""')+'","'+(q.opts.B||"").replace(/"/g,'""')+'","'+(q.opts.C||"").replace(/"/g,'""')+'","'+(q.opts.D||"").replace(/"/g,'""')+'",'+q.ans+',"'+(q.topic||"")+'",'+(q.diff||"medium")+',"'+(q.explain||"").replace(/"/g,'""')+'"\n';
    }
    var a=document.createElement("a");
    a.href=encodeURI("data:text/csv;charset=utf-8,"+csv);
    a.download="AIEP_"+examKey+"_"+paperKey+".csv";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("CSV exported!","ok");
}

function exportAll(){
    var all=getFQ();
    var out=JSON.stringify(all,null,2);
    document.getElementById("FE_OUT").value=out;
    var blob=new Blob([out],{type:"application/json"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="AIEP_AllFacultyQuestions.json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("All questions exported!","ok");
}

// ---- SETTINGS ----
function saveFacultyCreds(){
    var u=document.getElementById("FS_USER").value.trim();
    var p=document.getElementById("FS_PASS").value.trim();
    var p2=document.getElementById("FS_PASS2").value.trim();
    if(!u||!p){toast("Enter both","error");return}
    if(p!==p2){toast("Passwords differ","error");return}
    if(p.length<6){toast("Min 6 chars","error");return}
    setFCreds(u,p);
    toast("Credentials saved!","ok");
    document.getElementById("FS_USER").value="";
    document.getElementById("FS_PASS").value="";
    document.getElementById("FS_PASS2").value="";
}

function fullBackup(){
    var data={version:"1.0",creds:getFCreds(),questions:getFQ(),exported:new Date().toISOString()};
    var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    var a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="AIEP_Faculty_Backup.json";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("Backup downloaded!","ok");
}

function restoreBackup(){
    var inp=document.createElement("input");
    inp.type="file";inp.accept=".json";
    inp.onchange=function(e){
        var f=e.target.files[0];if(!f)return;
        var r=new FileReader();
        r.onload=function(ev){
            try{
                var d=JSON.parse(ev.target.result);
                if(d.creds)setFCreds(d.creds.u,d.creds.p);
                if(d.questions)S("f_questions",d.questions);
                injectAllFacultyQ();
                refreshDashboard();
                toast("Restored!","ok");
            }catch(err){toast("Invalid backup file","error")}
        };
        r.readAsText(f);
    };
    inp.click();
}

// ---- TAB SWITCHING ----
function switchTab(tabId){
    currentTab=tabId;
    var tabs=["F_DASH","F_ADD","F_BULK","F_MANAGE","F_PREVIEW","F_EXPORT","F_SETTINGS"];
    for(var i=0;i<tabs.length;i++){
        var el=document.getElementById(tabs[i]);
        if(el)el.classList.toggle("hide",tabs[i]!==tabId);
    }
    var btns=document.querySelectorAll("#FTABS button");
    for(var j=0;j<btns.length;j++){
        btns[j].classList.toggle("on",btns[j].getAttribute("data-ftab")===tabId);
    }
    if(tabId==="F_DASH")refreshDashboard();
    if(tabId==="F_MANAGE")loadManageQ();
}

// ---- BIND EVENTS ----
function bindEvents(){
    // Login
    document.getElementById("BTN_FLOGIN").onclick=doFLogin;
    document.getElementById("FP").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();doFLogin()}});
    document.getElementById("FU").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();document.getElementById("FP").focus()}});
    document.getElementById("BTN_FLOGOUT").onclick=doFLogout;

    // Tabs
    document.getElementById("FTABS").addEventListener("click",function(e){
        var btn=e.target.closest("button[data-ftab]");
        if(!btn)return;
        switchTab(btn.getAttribute("data-ftab"));
    });

    // Paper selects
    ["FA_EXAM","FB_EXAM","FM_EXAM","FE_EXAM","FP_EXAM"].forEach(function(eid){
        var el=document.getElementById(eid);
        if(el)el.onchange=function(){
            var prefix=eid.split("_")[0];
            updatePaperSelect(eid,prefix+"_PAPER");
        };
    });

    // Add question
    document.getElementById("BTN_FA_ADD").onclick=addSingleQ;
    document.getElementById("BTN_FA_CLEAR").onclick=function(){
        ["FA_Q","FA_A","FA_B","FA_C","FA_D","FA_TOPIC","FA_EXPLAIN"].forEach(function(id){document.getElementById(id).value=""});
        document.getElementById("FA_STATUS").classList.add("hide");
    };
    document.getElementById("BTN_FA_SAVE_DRAFT").onclick=function(){
        S("f_draft",{q:document.getElementById("FA_Q").value,a:document.getElementById("FA_A").value,b:document.getElementById("FA_B").value,c:document.getElementById("FA_C").value,d:document.getElementById("FA_D").value,topic:document.getElementById("FA_TOPIC").value});
        toast("Draft saved!","ok");
    };

    // Bulk import
    document.getElementById("BTN_FB_IMPORT").onclick=importBulkQ;
    document.getElementById("BTN_FB_VALIDATE").onclick=validateJSON;
    document.getElementById("BTN_FB_TEMPLATE").onclick=downloadTemplate;
    document.getElementById("BTN_FB_CLEAR").onclick=function(){document.getElementById("FB_JSON").value="";document.getElementById("FB_STATUS").classList.add("hide")};

    // Manage
    document.getElementById("FM_SEARCH").oninput=loadManageQ;
    document.getElementById("BTN_FM_EXPORT_SEL").onclick=function(){
        var ek=document.getElementById("FM_EXAM").value,pk=document.getElementById("FM_PAPER").value;
        var qs=getQsForPaper(ek,pk);
        if(!qs.length){toast("No questions","error");return}
        var blob=new Blob([JSON.stringify(qs,null,2)],{type:"application/json"});
        var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_"+ek+"_"+pk+".json";
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        toast("Exported!","ok");
    };
    document.getElementById("BTN_FM_DEL_ALL").onclick=function(){
        var ek=document.getElementById("FM_EXAM").value,pk=document.getElementById("FM_PAPER").value;
        if(!confirm("Delete ALL faculty questions in this paper?"))return;
        deleteAllFromPaper(ek,pk);loadManageQ();toast("Deleted all","ok");
    };

    // Preview
    document.getElementById("BTN_FP_LOAD").onclick=loadPreview;

    // Export
    document.getElementById("BTN_FE_JSON").onclick=exportJSON;
    document.getElementById("BTN_FE_CSV").onclick=exportCSV;
    document.getElementById("BTN_FE_ALL").onclick=exportAll;

    // Settings
    document.getElementById("BTN_FS_SAVE").onclick=saveFacultyCreds;
    document.getElementById("BTN_FS_BACKUP").onclick=fullBackup;
    document.getElementById("BTN_FS_RESTORE").onclick=restoreBackup;
    document.getElementById("BTN_FS_RESET").onclick=function(){
        if(!confirm("Delete ALL faculty questions? This cannot be undone."))return;
        if(!confirm("Are you sure? All questions will be permanently deleted."))return;
        clearAllFacultyQ();
        refreshDashboard();
        toast("All faculty data cleared","ok");
    };
}

// ---- INIT ----
window.onload=function(){
    if(G("x_theme","light")==="dark")document.body.classList.add("dark");
    fillExamSelects();
    injectAllFacultyQ();
    bindEvents();
    setupDropZone();

    // Restore draft if exists
    var draft=G("f_draft",null);
    if(draft){
        if(draft.q)document.getElementById("FA_Q").value=draft.q;
        if(draft.a)document.getElementById("FA_A").value=draft.a;
        if(draft.b)document.getElementById("FA_B").value=draft.b;
        if(draft.c)document.getElementById("FA_C").value=draft.c;
        if(draft.d)document.getElementById("FA_D").value=draft.d;
        if(draft.topic)document.getElementById("FA_TOPIC").value=draft.topic;
    }

    // Update status badge
    var dbEl=document.getElementById("DB_STAT");
    if(dbEl){dbEl.className="db-status db-online";dbEl.textContent="Local"}

    var all=getFQ();
    var totalQ=0;
    var keys=Object.keys(all);
    for(var i=0;i<keys.length;i++)totalQ+=all[keys[i]].length;
    console.log("AIEP Faculty v1.0: "+totalQ+" questions across "+keys.length+" papers");
};
})();
