// ============================================================
// AIEP ADMIN PANEL — Users, Vouchers, Results, Questions
// ============================================================
(function(){
"use strict";

var EX = window.EXAMS || {};
var loggedIn = false;

// HELPERS
function dec(s){try{return decodeURIComponent(escape(atob(s)))}catch(e){return s}}
function G(k,d){try{var s=localStorage.getItem(k);return s?JSON.parse(s):d}catch(e){return d}}
function S(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

function toast(m,t){
    var d=document.createElement("div");
    d.style.cssText="position:fixed;top:18px;right:18px;padding:11px 20px;border-radius:10px;font-size:12px;font-weight:700;z-index:99999;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);max-width:340px;transition:opacity .3s";
    d.style.background=t==="error"?"#DC2626":t==="ok"?"#059669":"#1D4ED8";
    d.textContent=m;document.body.appendChild(d);
    setTimeout(function(){d.style.opacity="0"},2800);
    setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},3200);
}

// DATA ACCESS
function getCreds(){return G("x_c",{u:"admin",p:"admin@2026"})}
function setCreds(u,p){S("x_c",{u:u,p:p})}
function getUsers(){return G("x_u",[])}
function getHist(){return G("x_h",[])}
function saveHist(h){S("x_h",h)}
function getV(){return G("x_v",{"FREE2026":{desc:"Free Access",used:0,max:9999,tier:"ultimate"},"LAUNCH50":{desc:"Launch Promo",used:0,max:9999,tier:"starter"}})}
function saveV(v){S("x_v",v)}
function getFQ(){return G("f_questions",{})}

var TIERS={free:{name:"Free",color:"#6B7280"},starter:{name:"Starter",color:"#059669"},professional:{name:"Professional",color:"#1D4ED8"},ultimate:{name:"Ultimate",color:"#7C3AED"}};
function getTierBadge(t){var r=TIERS[t]||TIERS.free;return '<span class="badge" style="background:'+r.color+'20;color:'+r.color+'">'+r.name+'</span>'}

// INSTANTDB (optional)
var db=null,dbOK=false;
function loadCloud(){
    if(!window.APP_ID||window.APP_ID==="YOUR_APP_ID")return;
    var s=document.createElement("script");
    s.src="https://unpkg.com/@instantdb/core";
    s.onload=function(){try{db=instant.init({appId:window.APP_ID});dbOK=true;updateDB()}catch(e){}};
    s.onerror=function(){};
    document.head.appendChild(s);
}
function updateDB(){var el=document.getElementById("DB_STAT");if(!el)return;el.className="db-status "+(dbOK?"db-online":"db-offline");el.textContent=dbOK?"Cloud":"Local"}

// LOGIN
function doALogin(){
    var u=document.getElementById("AU").value.trim(),p=document.getElementById("AP").value.trim(),err=document.getElementById("AERR");
    err.classList.add("hide");
    if(!u||!p){err.textContent="Enter both.";err.classList.remove("hide");return}
    var c=getCreds();
    if(u===c.u&&p===c.p){
        loggedIn=true;
        document.getElementById("ANAM").textContent=c.u;
        document.getElementById("AU").value="";document.getElementById("AP").value="";
        document.getElementById("V_ALOGIN").classList.add("hide");
        document.getElementById("V_ADASH").classList.remove("hide");
        refreshOverview();
        toast("Welcome!","ok");
    }else{err.textContent="Invalid credentials.";err.classList.remove("hide")}
}

function doALogout(){
    loggedIn=false;
    document.getElementById("V_ADASH").classList.add("hide");
    document.getElementById("V_ALOGIN").classList.remove("hide");
    toast("Logged out","ok");
}

// OVERVIEW
function refreshOverview(){
    var keys=Object.keys(EX),te=keys.length,tp2=0,tq=0,catR={};
    for(var i=0;i<keys.length;i++){
        var ex=EX[keys[i]],pks=Object.keys(ex.papers);
        for(var j=0;j<pks.length;j++){tp2++;tq+=ex.papers[pks[j]].qs.length}
        var ck=ex.cat||"other";
        if(!catR[ck])catR[ck]={e:0,p:0,q:0};
        catR[ck].e++;
        for(var m=0;m<pks.length;m++){catR[ck].p++;catR[ck].q+=ex.papers[pks[m]].qs.length}
    }
    document.getElementById("ASTATS").innerHTML=
        '<div class="stat"><div class="num">'+te+'</div><div class="lbl">Exams</div></div>'+
        '<div class="stat"><div class="num">'+tp2+'</div><div class="lbl">Papers</div></div>'+
        '<div class="stat"><div class="num">'+tq.toLocaleString()+'</div><div class="lbl">MCQs</div></div>'+
        '<div class="stat"><div class="num">'+getUsers().length+'</div><div class="lbl">Users</div></div>'+
        '<div class="stat"><div class="num">'+getHist().length+'</div><div class="lbl">Attempts</div></div>'+
        '<div class="stat"><div class="num">'+Object.keys(getV()).length+'</div><div class="lbl">Vouchers</div></div>';

    var tb=document.getElementById("ACATTB");tb.innerHTML="";
    var ck=Object.keys(catR).sort();
    for(var c=0;c<ck.length;c++){
        var r=catR[ck[c]],tr=document.createElement("tr");
        tr.innerHTML='<td style="text-transform:capitalize;font-weight:700">'+ck[c]+'</td><td>'+r.e+'</td><td>'+r.p+'</td><td><span class="badge b-blue">'+r.q.toLocaleString()+'</span></td>';
        tb.appendChild(tr);
    }

    document.getElementById("SI_EXAMS").textContent=te;
    document.getElementById("SI_PAPERS").textContent=tp2;
    document.getElementById("SI_MCQS").textContent=tq.toLocaleString();
}

// USERS
function refreshUsers(){
    var users=getUsers(),tb=document.getElementById("AUSTB");
    document.getElementById("U_COUNT").textContent="("+users.length+" total)";
    tb.innerHTML="";
    if(!users.length){tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--mut);padding:20px">No users yet.</td></tr>';return}
    var sorted=users.slice().sort(function(a,b){return new Date(b.joined||0)-new Date(a.joined||0)});
    for(var i=0;i<sorted.length;i++){
        var u=sorted[i],tr=document.createElement("tr");
        tr.innerHTML='<td>'+(i+1)+'</td><td>'+u.name+'</td><td>'+u.email+'</td><td>'+(u.phone||'-')+'</td><td>'+(u.roll||'-')+'</td><td>'+getTierBadge(u.tier||'free')+'</td><td style="font-size:10px">'+(u.joined||'-')+'</td>';
        tb.appendChild(tr);
    }
}

// VOUCHERS
function refreshVouchers(){
    var v=getV(),tb=document.getElementById("AVTB");tb.innerHTML="";
    var keys=Object.keys(v);
    if(!keys.length){tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--mut);padding:20px">No vouchers.</td></tr>';return}
    for(var i=0;i<keys.length;i++){
        var k=keys[i],tr=document.createElement("tr");
        tr.innerHTML='<td><code style="font-weight:700">'+k+'</code></td><td>'+(v[k].desc||"")+'</td><td>'+getTierBadge(v[k].tier||"starter")+'</td><td><span class="badge b-gold">'+(v[k].used||0)+'</span></td><td>'+(v[k].max||100)+'</td><td><button class="del-btn" data-vk="'+k+'">Del</button></td>';
        tb.appendChild(tr);
    }
    tb.querySelectorAll(".del-btn").forEach(function(btn){
        btn.onclick=function(){var code=this.getAttribute("data-vk");var v2=getV();delete v2[code];saveV(v2);refreshVouchers();toast("Deleted","ok")}
    });
}

function addVoucher(){
    var code=document.getElementById("AV_CODE").value.trim().toUpperCase();
    var desc=document.getElementById("AV_DESC").value.trim();
    var max=parseInt(document.getElementById("AV_MAX").value)||100;
    var tier=document.getElementById("AV_TIER").value;
    if(!code){toast("Enter code","error");return}
    var v=getV();
    v[code]={desc:desc||"Voucher",used:0,max:max,tier:tier};
    saveV(v);
    refreshVouchers();
    toast("Voucher created!","ok");
    document.getElementById("AV_CODE").value="";
    document.getElementById("AV_DESC").value="";
    document.getElementById("AV_MAX").value="";
}

// HISTORY
function refreshHistory(){
    var hist=getHist(),tb=document.getElementById("AHTB");
    document.getElementById("H_COUNT").textContent="("+hist.length+" results)";
    var search=(document.getElementById("AH_SEARCH").value||"").toLowerCase();
    tb.innerHTML="";
    if(!hist.length){tb.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--mut);padding:20px">No results yet.</td></tr>';return}
    var sorted=hist.slice().sort(function(a,b){return new Date(b.date)-new Date(a.date)});
    var filtered=sorted;
    if(search){filtered=sorted.filter(function(h){return (h.name||"").toLowerCase().indexOf(search)!==-1||(h.email||"").toLowerCase().indexOf(search)!==-1||(h.exam||"").toLowerCase().indexOf(search)!==-1})}
    for(var i=0;i<Math.min(filtered.length,300);i++){
        var h=filtered[i],tr=document.createElement("tr");
        tr.innerHTML='<td>'+(i+1)+'</td><td style="font-size:10px">'+h.date+'</td><td>'+h.name+'</td><td style="font-size:10px">'+(h.email||'-')+'</td><td>'+h.exam+'</td><td style="font-size:10px">'+h.paper+'</td><td style="font-family:monospace">'+h.score+'/'+h.total+'</td><td><span class="badge '+(h.pct>=50?"b-green":"b-red")+'">'+h.pct+'%</span></td>';
        tb.appendChild(tr);
    }
}

function exportHistCSV(){
    var h=getHist();if(!h.length){toast("No history","error");return}
    var csv="Date,Name,Roll,Email,Exam,Paper,Score,Total,Percentage\n";
    for(var i=0;i<h.length;i++){csv+='"'+h[i].date+'","'+h[i].name+'","'+(h[i].roll||"")+'","'+(h[i].email||"")+'","'+h[i].exam+'","'+h[i].paper+'",'+h[i].score+','+h[i].total+','+h[i].pct+'\n'}
    var a=document.createElement("a");a.href=encodeURI("data:text/csv;charset=utf-8,"+csv);a.download="AIEP_Results.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("CSV exported!","ok");
}

function exportHistJSON(){
    var h=getHist();if(!h.length){toast("No history","error");return}
    var out=JSON.stringify(h,null,2);
    var blob=new Blob([out],{type:"application/json"});
    var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Results.json";document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("JSON exported!","ok");
}

// MANAGE QUESTIONS
function fillExamSelects(){
    var sel=document.getElementById("AM_EXAM");sel.innerHTML="";
    var keys=Object.keys(EX);
    for(var i=0;i<keys.length;i++){var opt=document.createElement("option");opt.value=keys[i];opt.textContent=EX[keys[i]].name;sel.appendChild(opt)}
    updatePaperSelect();
}

function updatePaperSelect(){
    var ev=document.getElementById("AM_EXAM").value,ps=document.getElementById("AM_PAPER");ps.innerHTML="";
    if(!EX[ev])return;
    var pks=Object.keys(EX[ev].papers);
    for(var i=0;i<pks.length;i++){var opt=document.createElement("option");opt.value=pks[i];opt.textContent=EX[ev].papers[pks[i]].title;ps.appendChild(opt)}
}

function loadManageQ(){
    var ev=document.getElementById("AM_EXAM").value,pv=document.getElementById("AM_PAPER").value;
    if(!EX[ev]||!EX[ev].papers[pv])return;
    var qs=EX[ev].papers[pv].qs;
    var search=(document.getElementById("AM_SEARCH").value||"").toLowerCase();
    var tb=document.getElementById("AMTB");tb.innerHTML="";
    var filtered=qs;
    if(search){filtered=qs.filter(function(q){try{return dec(q.t).toLowerCase().indexOf(search)!==-1}catch(e){return false}})}

    document.getElementById("AM_STATS").innerHTML='<div class="stat"><div class="num">'+qs.length+'</div><div class="lbl">Total</div></div><div class="stat"><div class="num">'+filtered.length+'</div><div class="lbl">Showing</div></div><div class="stat"><div class="num">'+(getFQ()[ev+"_"+pv]?getFQ()[ev+"_"+pv].length:0)+'</div><div class="lbl">Faculty Added</div></div>';

    var show=Math.min(filtered.length,200);
    for(var i=0;i<show;i++){
        var q=filtered[i],txt="";try{txt=dec(q.t)}catch(e){txt="(decode error)"}
        var ca="";try{ca=dec(q.a)}catch(e){ca="?"}
        var tr=document.createElement("tr");
        tr.innerHTML='<td>'+(i+1)+'</td><td style="max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+txt+'</td><td><span class="badge b-green">'+ca+'</span></td><td></td>';
        tb.appendChild(tr);
    }
    if(filtered.length>200){
        var tr=document.createElement("tr");
        tr.innerHTML='<td colspan="4" style="text-align:center;color:var(--mut);padding:12px">Showing 200 of '+filtered.length+'. Use search to filter.</td>';
        tb.appendChild(tr);
    }
}

// SETTINGS
function saveAdminCreds(){
    var u=document.getElementById("AS_USER").value.trim(),p=document.getElementById("AS_PASS").value.trim(),p2=document.getElementById("AS_PASS2").value.trim();
    if(!u||!p){toast("Enter both","error");return}
    if(p!==p2){toast("Passwords differ","error");return}
    if(p.length<6){toast("Min 6 chars","error");return}
    setCreds(u,p);
    toast("Credentials saved!","ok");
    document.getElementById("AS_USER").value="";document.getElementById("AS_PASS").value="";document.getElementById("AS_PASS2").value="";
}

// BACKUP
function exportFullBackup(){
    var data={
        version:"1.0",
        type:"admin_backup",
        exported:new Date().toISOString(),
        creds:getCreds(),
        users:getUsers(),
        results:getHist(),
        vouchers:getV(),
        facultyQuestions:getFQ()
    };
    var out=JSON.stringify(data,null,2);
    document.getElementById("AB_OUT").value=out;
    var blob=new Blob([out],{type:"application/json"});
    var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Full_Backup.json";document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("Full backup exported!","ok");
}

function restoreBackup(){
    var inp=document.createElement("input");inp.type="file";inp.accept=".json";
    inp.onchange=function(e){
        var f=e.target.files[0];if(!f)return;
        var r=new FileReader();
        r.onload=function(ev){
            try{
                var d=JSON.parse(ev.target.result);
                if(d.creds)setCreds(d.creds.u,d.creds.p);
                if(d.users)S("x_u",d.users);
                if(d.results)S("x_h",d.results);
                if(d.vouchers)S("x_v",d.vouchers);
                if(d.facultyQuestions)S("f_questions",d.facultyQuestions);
                refreshOverview();
                toast("Backup restored!","ok");
            }catch(err){toast("Invalid backup file","error")}
        };
        r.readAsText(f);
    };
    inp.click();
}

function exportFacultyQ(){
    var fq=getFQ();
    var out=JSON.stringify(fq,null,2);
    document.getElementById("AB_OUT").value=out;
    var blob=new Blob([out],{type:"application/json"});
    var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="AIEP_Faculty_Questions.json";document.body.appendChild(a);a.click();document.body.removeChild(a);
    toast("Faculty questions exported!","ok");
}

// TABS
function switchTab(tabId){
    var tabs=["T_OVERVIEW","T_USERS","T_VOUCHERS","T_HISTORY","T_MANAGE","T_SETTINGS","T_BACKUP"];
    for(var i=0;i<tabs.length;i++){var el=document.getElementById(tabs[i]);if(el)el.classList.toggle("hide",tabs[i]!==tabId)}
    var btns=document.querySelectorAll("#ATABS button");
    for(var j=0;j<btns.length;j++)btns[j].classList.toggle("on",btns[j].getAttribute("data-tab")===tabId);
    if(tabId==="T_OVERVIEW")refreshOverview();
    if(tabId==="T_USERS")refreshUsers();
    if(tabId==="T_VOUCHERS")refreshVouchers();
    if(tabId==="T_HISTORY")refreshHistory();
    if(tabId==="T_MANAGE")loadManageQ();
}

// BIND EVENTS
function bindEvents(){
    document.getElementById("BTN_ALOGIN").onclick=doALogin;
    document.getElementById("AP").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();doALogin()}});
    document.getElementById("AU").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();document.getElementById("AP").focus()}});
    document.getElementById("BTN_ALOGOUT").onclick=doALogout;

    document.getElementById("ATABS").addEventListener("click",function(e){var btn=e.target.closest("button[data-tab]");if(btn)switchTab(btn.getAttribute("data-tab"))});

    document.getElementById("BTN_AV_ADD").onclick=addVoucher;
    document.getElementById("BTN_AH_CSV").onclick=exportHistCSV;
    document.getElementById("BTN_AH_JSON").onclick=exportHistJSON;
    document.getElementById("BTN_AH_CLEAR").onclick=function(){if(!confirm("Clear ALL results?"))return;saveHist([]);refreshHistory();toast("Cleared","ok")};
    document.getElementById("AH_SEARCH").oninput=refreshHistory;

    document.getElementById("AM_EXAM").onchange=function(){updatePaperSelect();loadManageQ()};
    document.getElementById("AM_PAPER").onchange=loadManageQ;
    document.getElementById("AM_SEARCH").oninput=loadManageQ;

    document.getElementById("BTN_AS_SAVE").onclick=saveAdminCreds;
    document.getElementById("BTN_AB_EXP").onclick=exportFullBackup;
    document.getElementById("BTN_AB_IMP").onclick=restoreBackup;
    document.getElementById("BTN_AB_FACULTY").onclick=exportFacultyQ;
}

// INIT
window.onload=function(){
    if(G("x_theme","light")==="dark")document.body.classList.add("dark");
    fillExamSelects();
    bindEvents();
    loadCloud();
    // Check if APP_ID available from exams.js context
    if(typeof window.APP_ID==="undefined")window.APP_ID="52877744-72cc-404a-b68e-fb01f3e387ac";
    console.log("AIEP Admin v1.0: "+Object.keys(EX).length+" exams");
};
})();
