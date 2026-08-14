(function(){
"use strict";
var EX=window.EXAMS||{};
var loggedIn=false;

function dec(s){try{return decodeURIComponent(escape(atob(s)))}catch(e){return s}}
function toast(m,t){var d=document.createElement("div");d.style.cssText="position:fixed;top:18px;right:18px;padding:11px 20px;border-radius:10px;font-size:12px;font-weight:700;z-index:99999;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);max-width:340px;transition:opacity .3s";d.style.background=t==="error"?"#DC2626":t==="ok"?"#059669":"#1D4ED8";d.textContent=m;document.body.appendChild(d);setTimeout(function(){d.style.opacity="0"},2800);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},3200)}

var TIERS={free:{name:"Free",color:"#6B7280"},starter:{name:"Starter",color:"#059669"},professional:{name:"Professional",color:"#1D4ED8"},ultimate:{name:"Ultimate",color:"#7C3AED"}};
function getTierBadge(t){var r=TIERS[t]||TIERS.free;return '<span class="badge" style="background:'+r.color+'20;color:'+r.color+'">'+r.name+'</span>'}

// LOGIN
function doALogin(){
    var u=document.getElementById("AU").value.trim(),p=document.getElementById("AP").value.trim(),err=document.getElementById("AERR");err.classList.add("hide");
    if(!u||!p){err.textContent="Enter both.";err.classList.remove("hide");return}
    var c=AIEP.getAdminCreds();
    if(u===c.u&&p===c.p){loggedIn=true;document.getElementById("ANAM").textContent=c.u;document.getElementById("AU").value="";document.getElementById("AP").value="";document.getElementById("V_ALOGIN").classList.add("hide");document.getElementById("V_ADASH").classList.remove("hide");refreshOverview();toast("Welcome!","ok")}
    else{err.textContent="Invalid.";err.classList.remove("hide")}
}
function doALogout(){loggedIn=false;document.getElementById("V_ADASH").classList.add("hide");document.getElementById("V_ALOGIN").classList.remove("hide");toast("Logged out","ok")}

function updateDBBadge(){var el=document.getElementById("DB_STAT");if(!el)return;var ok=AIEP.isConnected();el.className="db-status "+(ok?"db-online":"db-offline");el.textContent=ok?"Cloud":"Local"}

// OVERVIEW
function refreshOverview(){
    var keys=Object.keys(EX),te=keys.length,tp2=0,tq=0,catR={};
    for(var i=0;i<keys.length;i++){var ex=EX[keys[i]],pks=Object.keys(ex.papers);for(var j=0;j<pks.length;j++){tp2++;tq+=ex.papers[pks[j]].qs.length}var ck=ex.cat||"other";if(!catR[ck])catR[ck]={e:0,p:0,q:0};catR[ck].e++;for(var m=0;m<pks.length;m++){catR[ck].p++;catR[ck].q+=ex.papers[pks[m]].qs.length}}
    document.getElementById("ASTATS").innerHTML='<div class="stat"><div class="num">'+te+'</div><div class="lbl">Exams</div></div><div class="stat"><div class="num">'+tp2+'</div><div class="lbl">Papers</div></div><div class="stat"><div class="num">'+tq.toLocaleString()+'</div><div class="lbl">MCQs</div></div><div class="stat"><div class="num">'+AIEP.getUsers().length+'</div><div class="lbl">Users</div></div><div class="stat"><div class="num">'+AIEP.getResults().length+'</div><div class="lbl">Attempts</div></div><div class="stat"><div class="num">'+Object.keys(AIEP.getVouchers()).length+'</div><div class="lbl">Vouchers</div></div>';
    var tb=document.getElementById("ACATTB");tb.innerHTML="";var ck=Object.keys(catR).sort();for(var c=0;c<ck.length;c++){var r=catR[ck[c]],tr=document.createElement("tr");tr.innerHTML='<td style="text-transform:capitalize;font-weight:700">'+ck[c]+'</td><td>'+r.e+'</td><td>'+r.p+'</td><td><span class="badge b-blue">'+r.q.toLocaleString()+'</span></td>';tb.appendChild(tr)}
    document.getElementById("SI_EXAMS").textContent=te;document.getElementById("SI_PAPERS").textContent=tp2;document.getElementById("SI_MCQS").textContent=tq.toLocaleString();
}

// USERS
function refreshUsers(){
    var users=AIEP.getUsers(),tb=document.getElementById("AUSTB");document.getElementById("U_COUNT").textContent="("+users.length+")";tb.innerHTML="";
    if(!users.length){tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--mut);padding:20px">No users.</td></tr>';return}
    var sorted=users.slice().sort(function(a,b){return new Date(b.joined||0)-new Date(a.joined||0)});
    for(var i=0;i<sorted.length;i++){var u=sorted[i],tr=document.createElement("tr");tr.innerHTML='<td>'+(i+1)+'</td><td>'+u.name+'</td><td>'+u.email+'</td><td>'+(u.phone||'-')+'</td><td>'+(u.roll||'-')+'</td><td>'+getTierBadge(u.tier||'free')+'</td><td style="font-size:10px">'+(u.joined||'-')+'</td>';tb.appendChild(tr)}
}

// VOUCHERS
function refreshVouchers(){
    var v=AIEP.getVouchers(),tb=document.getElementById("AVTB");tb.innerHTML="";var keys=Object.keys(v);
    if(!keys.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--mut);padding:20px">No vouchers.</td></tr>';return}
    for(var i=0;i<keys.length;i++){var k=keys[i],tr=document.createElement("tr");tr.innerHTML='<td><code style="font-weight:700">'+k+'</code></td><td>'+(v[k].desc||"")+'</td><td>'+getTierBadge(v[k].tier||"starter")+'</td><td><span class="badge b-gold">'+(v[k].used||0)+'</span></td><td>'+(v[k].max||100)+'</td><td><button class="del-btn" data-vk="'+k+'">Del</button></td>';tb.appendChild(tr)}
    tb.querySelectorAll(".del-btn").forEach(function(btn){btn.onclick=function(){AIEP.deleteVoucher(this.getAttribute("data-vk"));refreshVouchers();toast("Deleted","ok")}});
}
function addVoucher(){var code=document.getElementById("AV_CODE").value.trim().toUpperCase(),desc=document.getElementById("AV_DESC").value.trim(),max=parseInt(document.getElementById("AV_MAX").value)||100,tier=document.getElementById("AV_TIER").value;if(!code){toast("Enter code","error");return}AIEP.addVoucher(code,{desc:desc||"Voucher",used:0,max:max,tier:tier});refreshVouchers();toast("Created!","ok");document.getElementById("AV_CODE").value="";document.getElementById("AV_DESC").value="";document.getElementById("AV_MAX").value=""}

// HISTORY
function refreshHistory(){
    var hist=AIEP.getResults(),tb=document.getElementById("AHTB");document.getElementById("H_COUNT").textContent="("+hist.length+")";var sch=(document.getElementById("AH_SEARCH").value||"").toLowerCase();tb.innerHTML="";
    if(!hist.length){tb.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--mut);padding:20px">No results.</td></tr>';return}
    var sorted=hist.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)});
    if(sch)sorted=sorted.filter(function(h){return(h.name||"").toLowerCase().indexOf(sch)!==-1||(h.email||"").toLowerCase().indexOf(sch)!==-1||(h.exam||"").toLowerCase().indexOf(sch)!==-1});
    for(var i=0;i<Math.min(sorted.length,300);i++){var h=sorted[i],tr=document.createElement("tr");tr.innerHTML='<td>'+(i+1)+'</td><td style="font-size:10px">'+h.date+'</td><td>'+h.name+'</td><td style="font-size:10px">'+(h.email||'-')+'</td><td>'+h.exam+'</td><td style="font-size:10px">'+h.paper+'</td><td style="font-family:monospace">'+h.score+'/'+h.total+'</td><td><span class="badge '+(h.pct>=50?"b-green":"b-red")+'">'+h.pct+'%</span></td>';tb.appendChild(tr)}
}
function exportHistCSV(){var h=AIEP.getResults();if(!h.length){toast("Empty","error");return}var csv="Date,Name,Roll,Email,Exam,Paper,Score,Total,Percentage\n";for(var i=0;i<h.length;i++){csv+='"'+h[i].date+'","'+h[i].name+'","'+(h[i].roll||"")+'","'+(h[i].email||"")+'","'+h[i].exam+'","'+h[i].paper+'",'+h[i].score+','+h[i].total+','+h[i].pct+'\n'}var a=document.createElement("a");a.href=encodeURI("data:text/csv;charset=utf-8,"+csv);a.download="AIEP_Results.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("CSV!","ok")}
function exportHistJSON(){var h=AIEP.getResults();if(!h.length){toast("Empty","error");return}var blob=new Blob([JSON.stringify(h,null,2)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Results.json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("JSON!","ok")}

// MANAGE QUESTIONS
function fillExamSelects(){var sel=document.getElementById("AM_EXAM");sel.innerHTML="";var keys=Object.keys(EX);for(var i=0;i<keys.length;i++){var opt=document.createElement("option");opt.value=keys[i];opt.textContent=EX[keys[i]].name;sel.appendChild(opt)}updatePaperSelect()}
function updatePaperSelect(){var ev=document.getElementById("AM_EXAM").value,ps=document.getElementById("AM_PAPER");ps.innerHTML="";if(!EX[ev])return;var pks=Object.keys(EX[ev].papers);for(var i=0;i<pks.length;i++){var opt=document.createElement("option");opt.value=pks[i];opt.textContent=EX[ev].papers[pks[i]].title;ps.appendChild(opt)}}
function loadManageQ(){var ev=document.getElementById("AM_EXAM").value,pv=document.getElementById("AM_PAPER").value;if(!EX[ev]||!EX[ev].papers[pv])return;var qs=EX[ev].papers[pv].qs,sch=(document.getElementById("AM_SEARCH").value||"").toLowerCase(),tb=document.getElementById("AMTB");tb.innerHTML="";var filtered=sch?qs.filter(function(q){try{return dec(q.t).toLowerCase().indexOf(sch)!==-1}catch(e){return false}}):qs;document.getElementById("AM_STATS").innerHTML='<div class="stat"><div class="num">'+qs.length+'</div><div class="lbl">Total</div></div><div class="stat"><div class="num">'+filtered.length+'</div><div class="lbl">Showing</div></div><div class="stat"><div class="num">'+(AIEP.getFacultyQ()[ev+"_"+pv]?AIEP.getFacultyQ()[ev+"_"+pv].length:0)+'</div><div class="lbl">Faculty</div></div>';var show=Math.min(filtered.length,200);for(var i=0;i<show;i++){var q=filtered[i],txt="";try{txt=dec(q.t)}catch(e){txt="(error)"}var ca="";try{ca=dec(q.a)}catch(e){ca="?"}var tr=document.createElement("tr");tr.innerHTML='<td>'+(i+1)+'</td><td style="max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+txt+'</td><td><span class="badge b-green">'+ca+'</span></td><td></td>';tb.appendChild(tr)}if(filtered.length>200){var tr=document.createElement("tr");tr.innerHTML='<td colspan="4" style="text-align:center;color:var(--mut);padding:12px">200 of '+filtered.length+'. Use search.</td>';tb.appendChild(tr)}}

// SETTINGS
function saveAdminCreds(){var u=document.getElementById("AS_USER").value.trim(),p=document.getElementById("AS_PASS").value.trim(),p2=document.getElementById("AS_PASS2").value.trim();if(!u||!p){toast("Enter both","error");return}if(p!==p2){toast("Differ","error");return}if(p.length<6){toast("Min 6","error");return}AIEP.setAdminCreds(u,p);toast("Saved!","ok");document.getElementById("AS_USER").value="";document.getElementById("AS_PASS").value="";document.getElementById("AS_PASS2").value=""}

// BACKUP
function exportFullBackup(){var data=AIEP.exportAll();data.type="admin_backup";var out=JSON.stringify(data,null,2);document.getElementById("AB_OUT").value=out;var blob=new Blob([out],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Full_Backup.json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("Backup!","ok")}
function restoreBackup(){var inp=document.createElement("input");inp.type="file";inp.accept=".json";inp.onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){try{var d=JSON.parse(ev.target.result);AIEP.importAll(d);refreshOverview();toast("Restored!","ok")}catch(err){toast("Invalid file","error")}};r.readAsText(f)};inp.click()}
function exportFacultyQ(){var fq=AIEP.getFacultyQ();var out=JSON.stringify(fq,null,2);document.getElementById("AB_OUT").value=out;var blob=new Blob([out],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Faculty_Questions.json";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("Exported!","ok")}

// TABS
function switchTab(tabId){
    var tabs=["T_OVERVIEW","T_USERS","T_VOUCHERS","T_HISTORY","T_MANAGE","T_SETTINGS","T_BACKUP"];
    for(var i=0;i<tabs.length;i++){var el=document.getElementById(tabs[i]);if(el)el.classList.toggle("hide",tabs[i]!==tabId)}
    var btns=document.querySelectorAll("#ATABS button");for(var j=0;j<btns.length;j++)btns[j].classList.toggle("on",btns[j].getAttribute("data-tab")===tabId);
    if(tabId==="T_OVERVIEW")refreshOverview();if(tabId==="T_USERS")refreshUsers();if(tabId==="T_VOUCHERS")refreshVouchers();if(tabId==="T_HISTORY")refreshHistory();if(tabId==="T_MANAGE")loadManageQ();
}


// SYNC
function syncToCloud(){
    var status=document.getElementById("SYNC_STATUS");
    status.className="info-box info-blue";status.innerHTML='<span class="spinner"></span> Syncing all data to cloud...';status.classList.remove("hide");
    AIEP.syncAllToCloud(function(result){
        if(result.ok){
            var s=result.stats;
            status.className="info-box info-green";
            status.innerHTML="&#10003; <strong>Synced to cloud!</strong><br>Users: "+s.users+" | Results: "+s.results+" | Vouchers: "+s.vouchers+" | Questions: "+s.questions+" | Logs: "+s.logs;
        }else{
            status.className="info-box info-red";
            status.innerHTML="&#10007; Sync failed: "+result.msg;
        }
    });
}
function pullFromCloud(){
    var status=document.getElementById("SYNC_STATUS");
    status.className="info-box info-blue";status.innerHTML='<span class="spinner"></span> Pulling data from cloud...';status.classList.remove("hide");
    AIEP.pullAllFromCloud(function(result){
        if(result.ok){
            status.className="info-box info-green";
            status.innerHTML="&#10003; <strong>Pulled from cloud!</strong><br>Users: "+AIEP.getUsers().length+" | Results: "+AIEP.getResults().length+" | Vouchers: "+Object.keys(AIEP.getVouchers()).length;
            refreshOverview();
        }else{
            status.className="info-box info-red";
            status.innerHTML="&#10007; Pull failed: "+result.msg;
        }
    });
}

// EVENTS
function bindEvents(){
    document.getElementById("BTN_ALOGIN").onclick=doALogin;
    document.getElementById("AP").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();doALogin()}});
    document.getElementById("AU").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();document.getElementById("AP").focus()}});
    document.getElementById("BTN_ALOGOUT").onclick=doALogout;
    document.getElementById("ATABS").addEventListener("click",function(e){var btn=e.target.closest("button[data-tab]");if(btn)switchTab(btn.getAttribute("data-tab"))});
    document.getElementById("BTN_AV_ADD").onclick=addVoucher;
    document.getElementById("BTN_AH_CSV").onclick=exportHistCSV;
    document.getElementById("BTN_AH_JSON").onclick=exportHistJSON;
    document.getElementById("BTN_AH_CLEAR").onclick=function(){if(!confirm("Clear all?"))return;AIEP.clearResults();refreshHistory();toast("Cleared","ok")};
    document.getElementById("AH_SEARCH").oninput=refreshHistory;
    document.getElementById("AM_EXAM").onchange=function(){updatePaperSelect();loadManageQ()};
    document.getElementById("AM_PAPER").onchange=loadManageQ;
    document.getElementById("AM_SEARCH").oninput=loadManageQ;
    document.getElementById("BTN_AS_SAVE").onclick=saveAdminCreds;
    document.getElementById("BTN_AB_EXP").onclick=exportFullBackup;
    document.getElementById("BTN_AB_IMP").onclick=restoreBackup;
    document.getElementById("BTN_AB_FACULTY").onclick=exportFacultyQ;
    document.getElementById("BTN_SYNC_UP").onclick=syncToCloud;
    document.getElementById("BTN_SYNC_DOWN").onclick=pullFromCloud;
}

// INIT
window.onload=function(){
    if(localStorage.getItem("x_theme")==="dark")document.body.classList.add("dark");
    AIEP.init(function(ok){updateDBBadge();if(ok)AIEP.subscribe()});
    AIEP.on("connected",function(){updateDBBadge()});
    AIEP.on("data",function(){if(loggedIn)refreshOverview()});
    fillExamSelects();bindEvents();
    console.log("AIEP Admin v11.0");
};
})();
