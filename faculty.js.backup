(function(){
"use strict";
var EX=window.EXAMS||{};
var loggedIn=false;

function dec(s){try{return decodeURIComponent(escape(atob(s)))}catch(e){return s}}
function toast(m,t){var d=document.createElement("div");d.style.cssText="position:fixed;top:18px;right:18px;padding:11px 20px;border-radius:10px;font-size:12px;font-weight:700;z-index:99999;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);max-width:340px;transition:opacity .3s";d.style.background=t==="error"?"#DC2626":t==="ok"?"#059669":"#1D4ED8";d.textContent=m;document.body.appendChild(d);setTimeout(function(){d.style.opacity="0"},2800);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},3200)}
function showStatus(id,msg,type){var el=document.getElementById(id);if(!el)return;el.className="info-box "+(type==="error"?"info-red":type==="ok"?"info-green":"info-blue");el.innerHTML=msg;el.classList.remove("hide")}

// Data via AIEP
function getFQ(){return AIEP.getFacultyQ()}
function saveFQ(q){AIEP.saveFacultyQ(q)}
function getCreds(){return AIEP.getFacultyCreds()}
function setCreds(u,p){AIEP.setFacultyCreds(u,p)}

function getQsForPaper(ek,pk){var all=getFQ();return all[ek+"_"+pk]||[]}
function addQToPaper(ek,pk,qObj){AIEP.addQuestion(ek,pk,qObj)}
function deleteQFromPaper(ek,pk,qId){AIEP.deleteQuestion(ek,pk,qId)}
function deleteAllFromPaper(ek,pk){AIEP.deleteAllQuestions(ek,pk)}

function injectToExams(ek,pk,qObj){
    if(!EX[ek]||!EX[ek].papers[pk])return;
    var enc=function(s){return btoa(unescape(encodeURIComponent(s)))};
    var encoded={id:qObj.id,t:enc(qObj.q),o:{A:enc(qObj.opts.A),B:enc(qObj.opts.B),C:enc(qObj.opts.C),D:enc(qObj.opts.D)},a:enc(qObj.ans)};
    var qs=EX[ek].papers[pk].qs,found=false;
    for(var i=0;i<qs.length;i++){if(qs[i].id===qObj.id){qs[i]=encoded;found=true;break}}
    if(!found)qs.push(encoded);
}
function rebuildExamsForPaper(ek,pk){
    if(!EX[ek]||!EX[ek].papers[pk])return;
    var fq=getQsForPaper(ek,pk);
    var enc=function(s){return btoa(unescape(encodeURIComponent(s)))};
    var origQs=EX[ek].papers[pk]._origQs||EX[ek].papers[pk].qs;
    if(!EX[ek].papers[pk]._origQs)EX[ek].papers[pk]._origQs=origQs.slice();
    var newQs=[];
    for(var i=0;i<fq.length;i++){newQs.push({id:fq[i].id,t:enc(fq[i].q),o:{A:enc(fq[i].opts.A),B:enc(fq[i].opts.B),C:enc(fq[i].opts.C),D:enc(fq[i].opts.D)},a:enc(fq[i].ans)})}
    var rem=Math.max(0,100-newQs.length);
    for(var i=0;i<Math.min(rem,origQs.length);i++){var exists=false;for(var j=0;j<newQs.length;j++){if(newQs[j].id===origQs[i].id){exists=true;break}}if(!exists)newQs.push(origQs[i])}
    EX[ek].papers[pk].qs=newQs;
}
function injectAllFacultyQ(){
    var all=getFQ(),keys=Object.keys(all);
    for(var k=0;k<keys.length;k++){
        var parts=keys[k].split("_");
        var ek=parts[0],pk=parts.slice(1).join("_");
        if(!EX[ek]||!EX[ek].papers[pk])continue;
        var qs=all[keys[k]];
        for(var i=0;i<qs.length;i++){injectToExams(ek,pk,qs[i])}
    }
}

// LOGIN
function doFLogin(){
    var u=document.getElementById("FU").value.trim(),p=document.getElementById("FP").value.trim(),err=document.getElementById("FERR");
    err.classList.add("hide");
    if(!u||!p){err.textContent="Enter both.";err.classList.remove("hide");return}
    var c=getCreds();
    if(u===c.u&&p===c.p){loggedIn=true;document.getElementById("FNAM").textContent=c.u;document.getElementById("FU").value="";document.getElementById("FP").value="";document.getElementById("V_FLOGIN").classList.add("hide");document.getElementById("V_FDASH").classList.remove("hide");refreshDashboard();toast("Welcome!","ok")}
    else{err.textContent="Invalid.";err.classList.remove("hide")}
}
function doFLogout(){loggedIn=false;document.getElementById("V_FDASH").classList.add("hide");document.getElementById("V_FLOGIN").classList.remove("hide");toast("Logged out","ok")}

// SELECTS
function fillExamSelects(){var ids=["FA_EXAM","FB_EXAM","FM_EXAM","FE_EXAM","FP_EXAM"];for(var s=0;s<ids.length;s++){var sel=document.getElementById(ids[s]);if(!sel)continue;sel.innerHTML="";var keys=Object.keys(EX);for(var i=0;i<keys.length;i++){var opt=document.createElement("option");opt.value=keys[i];opt.textContent=EX[keys[i]].name;sel.appendChild(opt)}}updateAllPaperSelects()}
function updatePaperSelect(eid,pid){var ev=document.getElementById(eid).value,ps=document.getElementById(pid);ps.innerHTML="";if(!EX[ev])return;var pks=Object.keys(EX[ev].papers);for(var i=0;i<pks.length;i++){var opt=document.createElement("option");opt.value=pks[i];opt.textContent=EX[ev].papers[pks[i]].title;ps.appendChild(opt)}}
function updateAllPaperSelects(){updatePaperSelect("FA_EXAM","FA_PAPER");updatePaperSelect("FB_EXAM","FB_PAPER");updatePaperSelect("FM_EXAM","FM_PAPER");updatePaperSelect("FE_EXAM","FE_PAPER");updatePaperSelect("FP_EXAM","FP_PAPER")}

// DASHBOARD
function refreshDashboard(){
    var all=getFQ(),keys=Object.keys(all),totalQ=0,byExam={};
    for(var k=0;k<keys.length;k++){var qs=all[keys[k]];totalQ+=qs.length;var ek=keys[k].split("_")[0];if(!byExam[ek])byExam[ek]={name:EX[ek]?EX[ek].name:ek,papers:0,questions:0};byExam[ek].papers++;byExam[ek].questions+=qs.length}
    document.getElementById("F_STATS").innerHTML='<div class="stat"><div class="num">'+totalQ+'</div><div class="lbl">Your Questions</div></div><div class="stat"><div class="num">'+keys.length+'</div><div class="lbl">Papers</div></div><div class="stat"><div class="num">'+Object.keys(byExam).length+'</div><div class="lbl">Exams</div></div><div class="stat"><div class="num">'+Object.keys(EX).length+'</div><div class="lbl">Total Exams</div></div>';
    var tb=document.getElementById("F_QSTAT");tb.innerHTML="";
    if(!keys.length){tb.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--mut);padding:20px">No questions yet. Go to Add Questions tab.</td></tr>';return}
    for(var k=0;k<keys.length;k++){var qs=all[keys[k]],parts=keys[k].split("_"),ek=parts[0],pk=parts.slice(1).join("_"),exObj=EX[ek],pObj=exObj&&exObj.papers[pk];var diff={easy:0,medium:0,hard:0};for(var i=0;i<qs.length;i++){diff[qs[i].diff||"medium"]++}var tr=document.createElement("tr");tr.innerHTML='<td>'+(exObj?exObj.name:ek)+'</td><td>'+(pObj?pObj.title:pk)+'</td><td><span class="badge b-blue">'+qs.length+'</span></td><td>'+Math.round((diff.easy*100+diff.medium*60+diff.hard*30)/Math.max(1,qs.length))+'%</td><td><button class="del-btn" data-ek="'+ek+'" data-pk="'+pk+'">Clear</button></td>';tb.appendChild(tr)}
    tb.querySelectorAll(".del-btn").forEach(function(btn){btn.onclick=function(){if(!confirm("Delete ALL?"))return;deleteAllFromPaper(this.getAttribute("data-ek"),this.getAttribute("data-pk"));refreshDashboard();toast("Deleted","ok")}});
}

// ADD SINGLE
function addSingleQ(){
    var ek=document.getElementById("FA_EXAM").value,pk=document.getElementById("FA_PAPER").value,q=document.getElementById("FA_Q").value.trim(),a=document.getElementById("FA_A").value.trim(),b=document.getElementById("FA_B").value.trim(),c=document.getElementById("FA_C").value.trim(),d=document.getElementById("FA_D").value.trim(),ans=document.getElementById("FA_ANS").value,diff=document.getElementById("FA_DIFF").value,topic=document.getElementById("FA_TOPIC").value.trim(),explain=document.getElementById("FA_EXPLAIN").value.trim();
    if(!q){toast("Enter question","error");return}if(!a||!b){toast("Enter A and B","error");return}
    var qObj={id:"fq_"+AIEP._uid(),q:q,opts:{A:a,B:b,C:c||"(Not provided)",D:d||"(Not provided)"},ans:ans,diff:diff,topic:topic,explain:explain,date:new Date().toLocaleString()};
    addQToPaper(ek,pk,qObj);
    showStatus("FA_STATUS",'&#10003; <strong>Added!</strong> Total: '+getQsForPaper(ek,pk).length,"ok");toast("Added!","ok");
    ["FA_Q","FA_A","FA_B","FA_C","FA_D","FA_TOPIC","FA_EXPLAIN"].forEach(function(id){document.getElementById(id).value=""});
    document.getElementById("FA_Q").focus();
}

// BULK IMPORT
function validateJSON(){
    var raw=document.getElementById("FB_JSON").value.trim();
    if(!raw){showStatus("FB_STATUS","Paste JSON first.","error");return}
    try{var data=JSON.parse(raw);if(!Array.isArray(data)){showStatus("FB_STATUS","Must be array.","error");return}var errs=[];for(var i=0;i<data.length;i++){var q=data[i];if(!q.question)errs.push("Item "+(i+1)+": no question");if(!q.options||!q.options.A)errs.push("Item "+(i+1)+": no options")}if(errs.length)showStatus("FB_STATUS","<strong>"+errs.length+" errors:</strong><br>"+errs.slice(0,10).join("<br>"),"error");else showStatus("FB_STATUS","&#10003; Valid! "+data.length+" questions.","ok")}
    catch(e){showStatus("FB_STATUS","JSON Error: "+e.message,"error")}
}
function importBulkQ(){
    var ek=document.getElementById("FB_EXAM").value,pk=document.getElementById("FB_PAPER").value,raw=document.getElementById("FB_JSON").value.trim();
    if(!raw){showStatus("FB_STATUS","Paste JSON first.","error");return}
    var data;try{data=JSON.parse(raw)}catch(e){showStatus("FB_STATUS","JSON Error: "+e.message,"error");return}
    if(!Array.isArray(data)){showStatus("FB_STATUS","Must be array.","error");return}
    var added=AIEP.importBulkQ(ek,pk,data);
    showStatus("FB_STATUS",'&#10003; <strong>Imported '+added+'</strong> into '+EX[ek].name+" / "+pk,"ok");toast("Imported "+added+"!","ok");
    document.getElementById("FB_JSON").value="";
}
function downloadTemplate(){
    var template=[{question:"Which describes Revenue Recognition under Ind AS 115?",options:{A:"When cash received",B:"When performance obligation satisfied",C:"Cash basis only",D:"Never before delivery"},answer:"B",topic:"Revenue Recognition",difficulty:"medium",explanation:"Ind AS 115: 5-step model."},{question:"Minimum paid-up capital for public company?",options:{A:"Rs 1 lakh",B:"Rs 5 lakh",C:"Rs 10 lakh",D:"Rs 50 lakh"},answer:"B",topic:"Companies Act",difficulty:"easy",explanation:"Section 4(1)."}];
    var blob=new Blob([JSON.stringify(template,null,2)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Question_Template.json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("Template downloaded!","ok");
}
function setupDropZone(){
    var zone=document.getElementById("DROP_ZONE");if(!zone)return;
    zone.addEventListener("dragover",function(e){e.preventDefault();zone.classList.add("drag-over")});
    zone.addEventListener("dragleave",function(){zone.classList.remove("drag-over")});
    zone.addEventListener("drop",function(e){e.preventDefault();zone.classList.remove("drag-over");var f=e.dataTransfer.files[0];if(!f)return;if(!f.name.endsWith(".json")){toast("Only .json","error");return}var r=new FileReader();r.onload=function(ev){document.getElementById("FB_JSON").value=ev.target.result};r.readAsText(f)});
    zone.addEventListener("click",function(){var inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){document.getElementById("FB_JSON").value=ev.target.result};r.readAsText(f)};inp.click()});
}

// MANAGE
function loadManageQ(){
    var ek=document.getElementById("FM_EXAM").value,pk=document.getElementById("FM_PAPER").value,qs=getQsForPaper(ek,pk),sch=document.getElementById("FM_SEARCH").value.toLowerCase(),tb=document.getElementById("FM_TB");tb.innerHTML="";
    var filtered=sch?qs.filter(function(q){return q.q.toLowerCase().indexOf(sch)!==-1||(q.topic||"").toLowerCase().indexOf(sch)!==-1}):qs;
    if(!filtered.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--mut);padding:20px">No questions.</td></tr>';return}
    for(var i=0;i<filtered.length;i++){var q=filtered[i],dc=q.diff==="hard"?"b-red":q.diff==="easy"?"b-green":"b-gold";var tr=document.createElement("tr");tr.innerHTML="<td>"+(i+1)+"</td><td style='max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>"+q.q+"</td><td><span class='badge b-green'>"+q.ans+"</span></td><td><span class='badge "+dc+"'>"+(q.diff||"medium")+"</span></td><td style='font-size:10px'>"+(q.topic||"-")+"</td><td><button class='edit-btn' data-ek='"+ek+"' data-pk='"+pk+"' data-qid='"+q.id+"'>Edit</button> <button class='del-btn' data-ek='"+ek+"' data-pk='"+pk+"' data-qid='"+q.id+"'>Del</button></td>";tb.appendChild(tr)}
    tb.querySelectorAll(".del-btn").forEach(function(btn){btn.onclick=function(){if(!confirm("Delete?"))return;deleteQFromPaper(this.getAttribute("data-ek"),this.getAttribute("data-pk"),this.getAttribute("data-qid"));loadManageQ();toast("Deleted","ok")}});
    tb.querySelectorAll(".edit-btn").forEach(function(btn){btn.onclick=function(){
        var ek=this.getAttribute("data-ek"),pk=this.getAttribute("data-pk"),qid=this.getAttribute("data-qid");
        var all=getFQ(),qs=all[ek+"_"+pk]||[],q=null;for(var i=0;i<qs.length;i++){if(qs[i].id===qid){q=qs[i];break}}
        if(!q){toast("Not found","error");return}
        switchTab("F_ADD");document.getElementById("FA_EXAM").value=ek;updatePaperSelect("FA_EXAM","FA_PAPER");
        setTimeout(function(){document.getElementById("FA_PAPER").value=pk},50);
        document.getElementById("FA_Q").value=q.q;document.getElementById("FA_A").value=q.opts.A;document.getElementById("FA_B").value=q.opts.B;document.getElementById("FA_C").value=q.opts.C||"";document.getElementById("FA_D").value=q.opts.D||"";document.getElementById("FA_ANS").value=q.ans;document.getElementById("FA_DIFF").value=q.diff||"medium";document.getElementById("FA_TOPIC").value=q.topic||"";document.getElementById("FA_EXPLAIN").value=q.explain||"";
        deleteQFromPaper(ek,pk,qid);
        showStatus("FA_STATUS",'&#9998; Editing. Modify and click Add to save.',"info");toast("Editing","ok");
    }});
}

// PREVIEW
function loadPreview(){
    var ek=document.getElementById("FP_EXAM").value,pk=document.getElementById("FP_PAPER").value,qs=getQsForPaper(ek,pk),area=document.getElementById("FP_AREA");area.innerHTML="";
    if(!qs.length){area.innerHTML='<div class="info-box info-blue">No faculty questions yet.</div>';return}
    var show=Math.min(qs.length,20);area.innerHTML='<div class="info-box info-teal">Showing '+show+' of '+qs.length+'</div>';
    for(var i=0;i<show;i++){var q=qs[i],div=document.createElement("div");div.className="q-preview fade-in";div.style.animationDelay=(i*0.05)+"s";var oh="";var oK=["A","B","C","D"];for(var j=0;j<4;j++){var ok=oK[j]===q.ans;oh+='<span class="'+(ok?"correct-opt":"wrong-opt")+'"><strong>'+oK[j]+')</strong> '+(q.opts[oK[j]]||"(empty)")+'</span>'}div.innerHTML='<span class="qnum">Q'+(i+1)+'</span> <span style="font-size:10px" class="badge '+(q.diff==="hard"?"b-red":q.diff==="easy"?"b-green":"b-gold")+'">'+(q.diff||"medium")+'</span>'+(q.topic?' <span style="font-size:10px" class="badge b-blue">'+q.topic+'</span>':'')+'<br><br>'+q.q+'<div class="opts">'+oh+'</div>'+(q.explain?'<div style="margin-top:8px;padding:8px;background:rgba(5,150,105,.05);border-radius:6px;font-size:11px;color:var(--grn)"><strong>Explanation:</strong> '+q.explain+'</div>':'');area.appendChild(div)}
}

// EXPORT
function exportJSON(){var ek=document.getElementById("FE_EXAM").value,pk=document.getElementById("FE_PAPER").value,qs=getQsForPaper(ek,pk);if(!qs.length){toast("No questions","error");return}var out=JSON.stringify(qs,null,2);document.getElementById("FE_OUT").value=out;var blob=new Blob([out],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_"+ek+"_"+pk+".json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("JSON exported!","ok")}
function exportCSV(){var ek=document.getElementById("FE_EXAM").value,pk=document.getElementById("FE_PAPER").value,qs=getQsForPaper(ek,pk);if(!qs.length){toast("No questions","error");return}var csv="No,Question,A,B,C,D,Answer,Topic,Difficulty,Explanation\n";for(var i=0;i<qs.length;i++){var q=qs[i];csv+=(i+1)+',"'+q.q.replace(/"/g,'""')+'","'+(q.opts.A||"").replace(/"/g,'""')+'","'+(q.opts.B||"").replace(/"/g,'""')+'","'+(q.opts.C||"").replace(/"/g,'""')+'","'+(q.opts.D||"").replace(/"/g,'""')+'",'+q.ans+',"'+(q.topic||"")+'",'+(q.diff||"medium")+',"'+(q.explain||"").replace(/"/g,'""')+'"\n'}var a=document.createElement("a");a.href=encodeURI("data:text/csv;charset=utf-8,"+csv);a.download="AIEP_"+ek+"_"+pk+".csv";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("CSV exported!","ok")}
function exportAll(){var all=getFQ();var out=JSON.stringify(all,null,2);document.getElementById("FE_OUT").value=out;var blob=new Blob([out],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_AllFacultyQ.json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("All exported!","ok")}

// SETTINGS
function saveFacultyCreds(){var u=document.getElementById("FS_USER").value.trim(),p=document.getElementById("FS_PASS").value.trim(),p2=document.getElementById("FS_PASS2").value.trim();if(!u||!p){toast("Enter both","error");return}if(p!==p2){toast("Differ","error");return}if(p.length<6){toast("Min 6","error");return}setCreds(u,p);toast("Saved!","ok")}
function fullBackup(){var data=AIEP.exportAll();data.type="faculty_backup";var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Faculty_Backup.json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("Backup!","ok")}
function restoreBackup(){var inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){try{var d=JSON.parse(ev.target.result);AIEP.importAll(d);injectAllFacultyQ();refreshDashboard();toast("Restored!","ok")}catch(err){toast("Invalid file","error")}};r.readAsText(f)};inp.click()}

// TABS
function switchTab(tabId){
    var tabs=["F_DASH","F_ADD","F_BULK","F_MANAGE","F_PREVIEW","F_EXPORT","F_SETTINGS"];
    for(var i=0;i<tabs.length;i++){var el=document.getElementById(tabs[i]);if(el)el.classList.toggle("hide",tabs[i]!==tabId)}
    var btns=document.querySelectorAll("#FTABS button");
    for(var j=0;j<btns.length;j++)btns[j].classList.toggle("on",btns[j].getAttribute("data-ftab")===tabId);
    if(tabId==="F_DASH")refreshDashboard();
    if(tabId==="F_MANAGE")loadManageQ();
}

// EVENTS
function bindEvents(){
    document.getElementById("BTN_FLOGIN").onclick=doFLogin;
    document.getElementById("FP").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();doFLogin()}});
    document.getElementById("FU").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();document.getElementById("FP").focus()}});
    document.getElementById("BTN_FLOGOUT").onclick=doFLogout;
    document.getElementById("FTABS").addEventListener("click",function(e){var btn=e.target.closest("button[data-ftab]");if(btn)switchTab(btn.getAttribute("data-ftab"))});
    ["FA_EXAM","FB_EXAM","FM_EXAM","FE_EXAM","FP_EXAM"].forEach(function(eid){var el=document.getElementById(eid);if(el)el.onchange=function(){var p=eid.split("_")[0];updatePaperSelect(eid,p+"_PAPER")}});
    document.getElementById("BTN_FA_ADD").onclick=addSingleQ;
    document.getElementById("BTN_FA_CLEAR").onclick=function(){["FA_Q","FA_A","FA_B","FA_C","FA_D","FA_TOPIC","FA_EXPLAIN"].forEach(function(id){document.getElementById(id).value=""});document.getElementById("FA_STATUS").classList.add("hide")};
    document.getElementById("BTN_FA_SAVE_DRAFT").onclick=function(){localStorage.setItem("f_draft",JSON.stringify({q:document.getElementById("FA_Q").value,a:document.getElementById("FA_A").value,b:document.getElementById("FA_B").value,c:document.getElementById("FA_C").value,d:document.getElementById("FA_D").value,topic:document.getElementById("FA_TOPIC").value}));toast("Draft saved!","ok")};
    document.getElementById("BTN_FB_IMPORT").onclick=importBulkQ;
    document.getElementById("BTN_FB_VALIDATE").onclick=validateJSON;
    document.getElementById("BTN_FB_TEMPLATE").onclick=downloadTemplate;
    document.getElementById("BTN_FB_CLEAR").onclick=function(){document.getElementById("FB_JSON").value="";document.getElementById("FB_STATUS").classList.add("hide")};
    document.getElementById("FM_SEARCH").oninput=loadManageQ;
    document.getElementById("BTN_FM_EXPORT_SEL").onclick=function(){var ek=document.getElementById("FM_EXAM").value,pk=document.getElementById("FM_PAPER").value,qs=getQsForPaper(ek,pk);if(!qs.length){toast("Empty","error");return}var blob=new Blob([JSON.stringify(qs,null,2)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_"+ek+"_"+pk+".json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("Exported!","ok")};
    document.getElementById("BTN_FM_DEL_ALL").onclick=function(){var ek=document.getElementById("FM_EXAM").value,pk=document.getElementById("FM_PAPER").value;if(!confirm("Delete all?"))return;deleteAllFromPaper(ek,pk);loadManageQ();toast("Deleted","ok")};
    document.getElementById("BTN_FP_LOAD").onclick=loadPreview;
    document.getElementById("BTN_FE_JSON").onclick=exportJSON;
    document.getElementById("BTN_FE_CSV").onclick=exportCSV;
    document.getElementById("BTN_FE_ALL").onclick=exportAll;
    document.getElementById("BTN_FS_SAVE").onclick=saveFacultyCreds;
    document.getElementById("BTN_FS_BACKUP").onclick=fullBackup;
    document.getElementById("BTN_FS_RESTORE").onclick=restoreBackup;
    document.getElementById("BTN_FS_RESET").onclick=function(){if(!confirm("Delete ALL faculty questions?"))return;if(!confirm("Are you sure?"))return;AIEP.saveFacultyQ({});refreshDashboard();toast("Cleared","ok")};
}

// INIT
window.onload=function(){
    if(localStorage.getItem("x_theme")==="dark")document.body.classList.add("dark");
    AIEP.init(function(ok){document.getElementById("DB_STAT").className="db-status "+(ok?"db-online":"db-offline");document.getElementById("DB_STAT").textContent=ok?"Cloud":"Local"});
    fillExamSelects();injectAllFacultyQ();bindEvents();setupDropZone();
    var draft=localStorage.getItem("f_draft");
    if(draft){try{var d=JSON.parse(draft);if(d.q)document.getElementById("FA_Q").value=d.q;if(d.a)document.getElementById("FA_A").value=d.a;if(d.b)document.getElementById("FA_B").value=d.b;if(d.c)document.getElementById("FA_C").value=d.c;if(d.d)document.getElementById("FA_D").value=d.d;if(d.topic)document.getElementById("FA_TOPIC").value=d.topic}catch(e){}}
    console.log("AIEP Faculty v11.0");
};
})();
