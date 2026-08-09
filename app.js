// ============================================================
// AIEP STUDENT ENGINE v11 — uses AIEP (db.js) for all data
// ============================================================
(function(){
"use strict";

var loggedInUser = null;
var bank = null, ans = {}, marks = {}, idx = 0, tmr = null;
var sScore = 0, sPct = 0, sTotal = 0, sWrong = 0, sSkip = 0;
var sName = "", sRoll = "", sEmail = "", sPhone = "";
var catName = "", paperTitle = "", examKey = "", paperKey = "";
var tabWarn = 0, submitState = 0, authMode = "login";

var EX = window.EXAMS || {};
var TIERS = {free:{name:"Free",color:"#6B7280"},starter:{name:"Starter",color:"#059669"},professional:{name:"Professional",color:"#1D4ED8"},ultimate:{name:"Ultimate",color:"#7C3AED"}};
function getTierBadge(t){var r=TIERS[t]||TIERS.free;return '<span class="badge" style="background:'+r.color+'20;color:'+r.color+'">'+r.name+'</span>'}

function enc(s){return btoa(unescape(encodeURIComponent(s)))}
function dec(s){try{return decodeURIComponent(escape(atob(s)))}catch(e){return s}}

function toast(m,t){var d=document.createElement("div");d.style.cssText="position:fixed;top:18px;right:18px;padding:11px 20px;border-radius:10px;font-size:12px;font-weight:700;z-index:99999;color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.2);max-width:320px;transition:opacity .3s,transform .3s";d.style.background=t==="error"?"#DC2626":t==="ok"?"#059669":"#1D4ED8";d.textContent=m;document.body.appendChild(d);setTimeout(function(){d.style.opacity="0";d.style.transform="translateY(-10px)"},2800);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},3200)}

function updateDBBadge(){
    var el=document.getElementById("DB_STATUS");
    if(!el)return;
    var ok=AIEP.isConnected();
    el.className="db-status "+(ok?"db-online":"db-offline");
    el.textContent=ok?"Cloud":"Local";
}

// ---- AUTH ----
function doSignup(){
    var name=document.getElementById("AUTH_NAME").value.trim();
    var email=document.getElementById("AUTH_EMAIL").value.trim();
    var pass=document.getElementById("AUTH_PASS").value.trim();
    var err=document.getElementById("AUTH_ERR");
    err.classList.add("hide");
    if(!name){err.textContent="Enter your name.";err.classList.remove("hide");return}
    if(!email||email.indexOf("@")===-1){err.textContent="Enter valid email.";err.classList.remove("hide");return}
    if(!pass||pass.length<6){err.textContent="Min 6 characters.";err.classList.remove("hide");return}
    var users=AIEP.getUsers();
    for(var i=0;i<users.length;i++){
        if(users[i].email&&users[i].email.toLowerCase()===email.toLowerCase()){
            err.textContent="Already registered. Try login.";err.classList.remove("hide");return;
        }
    }
    var nu={id:AIEP._uid(),name:name,email:email,pass:pass,phone:"",roll:"",tier:"free"};
    AIEP.saveUser(nu);
    loggedInUser={name:name,email:email,tier:"free"};
    AIEP.setCurrentUser(loggedInUser);
    AIEP.log("Signup: "+name+" ("+email+")");
    toast("Welcome, "+name+"!","ok");
    goHome();
}

function doLogin(){
    var email=document.getElementById("AUTH_EMAIL").value.trim();
    var pass=document.getElementById("AUTH_PASS").value.trim();
    var err=document.getElementById("AUTH_ERR");
    err.classList.add("hide");
    if(!email||!pass){err.textContent="Enter email and password.";err.classList.remove("hide");return}
    var users=AIEP.getUsers();
    for(var i=0;i<users.length;i++){
        if(users[i].email&&users[i].email.toLowerCase()===email.toLowerCase()&&users[i].pass===pass){
            loggedInUser={name:users[i].name,email:users[i].email,tier:users[i].tier||"free"};
            AIEP.setCurrentUser(loggedInUser);
            AIEP.log("Login: "+users[i].name);
            toast("Welcome back, "+users[i].name+"!","ok");
            goHome();return;
        }
    }
    err.textContent="Invalid. Click Sign Up if new.";err.classList.remove("hide");
}

function doLogout(){
    loggedInUser=null;
    AIEP.clearCurrentUser();
    toast("Logged out","ok");
    goHome();
}

function checkSavedLogin(){
    var saved=AIEP.getCurrentUser();
    if(saved&&saved.email) loggedInUser=saved;
}

function updateAuthUI(){
    var btn=document.getElementById("NAV_AUTH_BTN");
    var status=document.getElementById("AUTH_STATUS");
    if(loggedInUser&&loggedInUser.email){
        var nm=loggedInUser.name||loggedInUser.email.split("@")[0];
        btn.textContent=nm;btn.style.background="var(--grn)";btn.style.color="#fff";btn.style.borderColor="var(--grn)";btn.onclick=doLogout;
        if(status){status.innerHTML='<div class="info-box info-green">&#10003; Logged in as <strong>'+loggedInUser.email+'</strong> | '+getTierBadge(loggedInUser.tier||"free")+' | <span id="DO_LOGOUT" style="cursor:pointer;text-decoration:underline;color:var(--pri)">Logout</span></div>';status.classList.remove("hide");setTimeout(function(){var lo=document.getElementById("DO_LOGOUT");if(lo)lo.onclick=doLogout},50)}
        if(loggedInUser.name)document.getElementById("F_NAME").value=loggedInUser.name;
        if(loggedInUser.email)document.getElementById("F_EMAIL").value=loggedInUser.email;
    }else{
        btn.textContent="Login";btn.style.background="none";btn.style.color="var(--txt)";btn.style.borderColor="var(--bor)";btn.onclick=function(){showV("V_AUTH")};
        if(status){status.innerHTML='<div class="info-box info-blue">Save results? <a href="#" id="GOTO_AUTH" style="color:var(--pri);font-weight:700">Login or Sign Up</a></div>';status.classList.remove("hide");setTimeout(function(){var ga=document.getElementById("GOTO_AUTH");if(ga)ga.onclick=function(e){e.preventDefault();showV("V_AUTH")}},50)}
    }
}

// ---- VIEWS ----
var VIEWS=["V_HOME","V_AUTH","V_PRICING","V_PRIVACY","V_TERMS","V_DISCLAIMER","V_ABOUT","V_EXAM","V_RESULT"];
function hideAll(){for(var i=0;i<VIEWS.length;i++){var el=document.getElementById(VIEWS[i]);if(el)el.classList.add("hide")}}
function showV(id){hideAll();document.getElementById(id).classList.remove("hide")}
function goHome(){showV("V_HOME");document.getElementById("REGFORM").classList.add("hide");document.getElementById("EXGRD").classList.remove("hide");document.getElementById("CATBAR").classList.remove("hide");renderCards("all");updateAuthUI()}
function togTheme(){document.body.classList.toggle("dark");localStorage.setItem("x_theme",document.body.classList.contains("dark")?"dark":"light")}

// ---- CARDS ----
function buildCats(){var bar=document.getElementById("CATBAR");var cats=["all","professional","medical","engineering","civil","ssc","banking","law","defence","management","teaching","gate","entrance"];var labels=["All","Professional","Medical","Engineering","Civil","SSC/Railway","Banking","Law","Defence","Management","Teaching","GATE","Entrance"];bar.innerHTML="";for(var i=0;i<cats.length;i++){var b=document.createElement("button");b.className="cat-btn"+(cats[i]==="all"?" on":"");b.textContent=labels[i];b.setAttribute("data-cat",cats[i]);bar.appendChild(b)}}
function renderCards(cat){var grid=document.getElementById("EXGRD");grid.innerHTML="";var keys=Object.keys(EX);var count=0;for(var i=0;i<keys.length;i++){var k=keys[i],ex=EX[k];if(cat!=="all"&&ex.cat!==cat)continue;count++;var np=Object.keys(ex.papers).length,hasFree=false,pks=Object.keys(ex.papers);for(var j=0;j<pks.length;j++)if(ex.papers[pks[j]].free)hasFree=true;var totalQ=0;for(var j=0;j<pks.length;j++)totalQ+=ex.papers[pks[j]].qs.length;var card=document.createElement("div");card.className="exam-card fade-in";card.style.animationDelay=(count*0.02)+"s";card.innerHTML=(hasFree?'<div class="free-badge">FREE</div>':'<div class="prem-badge">PREMIUM</div>')+'<span class="icon">'+ex.icon+'</span><h4>'+ex.name+'</h4><p>'+ex.desc+'</p><span class="tag '+ex.tc+'">'+ex.tag+' \u00b7 '+np+' \u00b7 '+totalQ+'Q</span>';card.setAttribute("data-exam",k);grid.appendChild(card)}if(!count)grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><p>No exams.</p></div>'}

function selectExam(k){
    examKey=k;var ex=EX[k];
    document.getElementById("SELTIT").textContent=ex.name;document.getElementById("SELDES").textContent=ex.desc;document.getElementById("BEXAM").textContent=ex.name;
    var pks=Object.keys(ex.papers),totalQ=0,freeCount=0;for(var i=0;i<pks.length;i++){totalQ+=ex.papers[pks[i]].qs.length;if(ex.papers[pks[i]].free)freeCount++}
    document.getElementById("PAPERSUM").innerHTML='<span class="ps-item"><strong>'+pks.length+'</strong> Papers</span><span class="ps-item"><strong>'+totalQ+'</strong> MCQs</span><span class="ps-item"><strong>'+freeCount+'</strong> Free</span>';document.getElementById("PAPERSUM").classList.remove("hide");
    var tier=AIEP.getTier(),tierEl=document.getElementById("TIERMSG");
    if(tier==="free"&&freeCount===0){tierEl.innerHTML='<div class="info-box info-purple">Requires paid plan. <a href="#" id="GOTO_PRICING" style="color:var(--pri);font-weight:700">View Plans</a></div>';tierEl.classList.remove("hide")}
    else if(tier==="free"&&freeCount<pks.length){tierEl.innerHTML='<div class="info-box info-purple">'+freeCount+'/'+pks.length+' free. <a href="#" id="GOTO_PRICING" style="color:var(--pri);font-weight:700">Upgrade</a></div>';tierEl.classList.remove("hide")}
    else{tierEl.classList.add("hide")}
    var sel=document.getElementById("F_PAPER");sel.innerHTML="";
    var hasLevels=false;for(var i=0;i<pks.length;i++){if(ex.papers[pks[i]].level){hasLevels=true;break}}
    if(hasLevels){var lo=[],lm={};for(var i=0;i<pks.length;i++){var p=ex.papers[pks[i]],lvl=p.level||"General";if(!lm[lvl]){lm[lvl]=[];lo.push(lvl)}lm[lvl].push({key:pks[i],paper:p})}for(var l=0;l<lo.length;l++){var grp=document.createElement("optgroup");grp.label=lo[l];var pp=lm[lo[l]];for(var j=0;j<pp.length;j++){var opt=document.createElement("option");opt.value=pp[j].key;opt.textContent=pp[j].paper.title+" ("+pp[j].paper.qs.length+"Q, "+pp[j].paper.dur+"min)"+(pp[j].paper.free?" \u2014 FREE":"");grp.appendChild(opt)}sel.appendChild(grp)}}
    else{for(var i=0;i<pks.length;i++){var pk=pks[i],p=ex.papers[pk],opt=document.createElement("option");opt.value=pk;opt.textContent=p.title+" ("+p.qs.length+"Q, "+p.dur+"min)"+(p.free?" \u2014 FREE":"");sel.appendChild(opt)}}
    document.getElementById("EXGRD").classList.add("hide");document.getElementById("CATBAR").classList.add("hide");document.getElementById("REGFORM").classList.remove("hide");
    updateAuthUI();setTimeout(function(){var pl=document.getElementById("GOTO_PRICING");if(pl)pl.onclick=function(e){e.preventDefault();showPricing()}},100);
}

function showPricing(){
    var tier=AIEP.getTier();document.getElementById("CUR_TIER").innerHTML="Current: <strong>"+(TIERS[tier]||TIERS.free).name+"</strong> "+getTierBadge(tier);
    var grid=document.getElementById("PRICING_CARDS");
    var plans=[{key:"free",icon:"&#127873;",name:"Free",price:"\u20B90",period:"forever",desc:"Start practicing",f:false,feat:[["Free papers","&#10003;"],["100 MCQs/paper","&#10003;"],["Instant scoring","&#10003;"],["Solutions","&#10003;"],["Premium papers","&#10007;"],["Certificate","&#10007;"]]},{key:"starter",icon:"&#128640;",name:"Starter",price:"\u20B9499",period:"one-time",desc:"Competitive exams",f:false,feat:[["Everything Free","&#10003;"],["All competitive","&#10003;"],["Certificate","&#10003;"],["Analytics","&#10003;"],["Professional","&#10007;"],["Priority","&#10007;"]]},{key:"professional",icon:"&#127942;",name:"Professional",price:"\u20B91,499",period:"one-time",desc:"Full access",f:true,feat:[["Everything Starter","&#10003;"],["All professional","&#10003;"],["CA CS CMA CFA","&#10003;"],["100+ papers","&#10003;"],["CSV export","&#10003;"],["Priority","&#10003;"]]},{key:"ultimate",icon:"&#128142;",name:"Ultimate",price:"\u20B92,999",period:"one-time",desc:"Institutional",f:false,feat:[["Everything Pro","&#10003;"],["Bulk access","&#10003;"],["Custom vouchers","&#10003;"],["WhatsApp","&#10003;"],["Early access","&#10003;"],["White-label","&#10003;"]]}];
    grid.innerHTML="";for(var i=0;i<plans.length;i++){var p=plans[i],isActive=(tier===p.key),card=document.createElement("div");card.className="price-card fade-in"+(p.f?" featured":"");card.style.animationDelay=(i*0.1)+"s";var fh="";for(var f=0;f<p.feat.length;f++){var isC=p.feat[f][1]==="&#10003;";fh+='<li>'+(isC?'<span class="check">&#10003;</span>':'<span class="cross">&#10007;</span>')+p.feat[f][0]+'</li>'}card.innerHTML='<div class="plan-icon">'+p.icon+'</div><h3>'+p.name+'</h3><div class="plan-desc">'+p.desc+'</div><div class="price">'+p.price+'<span>/'+p.period+'</span></div><ul class="price-features">'+fh+'</ul>'+(isActive?'<button class="btn btn-full btn-green" disabled>&#10003; Current</button>':'<button class="btn btn-full btn-outline" data-tier="'+p.key+'">'+(p.key==="free"?"Start Free":"Activate")+'</button>');grid.appendChild(card)}
    showV("V_PRICING");
}

// ---- EXAM ENGINE ----
function doStartExam(){
    sName=document.getElementById("F_NAME").value.trim();sRoll=document.getElementById("F_ROLL").value.trim();sEmail=document.getElementById("F_EMAIL").value.trim();sPhone=document.getElementById("F_PHONE").value.trim();paperKey=document.getElementById("F_PAPER").value;
    if(!sName||!sRoll||!sEmail){toast("Fill name, roll, email","error");return}
    if(!EX[examKey]||!EX[examKey].papers[paperKey]){toast("Select paper","error");return}
    var paper=EX[examKey].papers[paperKey];
    AIEP.saveUser({name:sName,email:sEmail,phone:sPhone,roll:sRoll});
    AIEP.log("Exam: "+sName+" - "+EX[examKey].name);
    var tier=AIEP.getTier();
    if(!paper.free){
        if(tier==="professional"||tier==="ultimate"){}
        else{var vc=document.getElementById("F_VOUCHER").value.trim().toUpperCase();if(!vc){toast("Enter voucher or upgrade","error");return}var res=AIEP.useVoucher(vc);if(res.ok){AIEP.setTier(res.tier||"starter");toast("Voucher: "+res.desc,"ok")}else{toast(res.msg,"error");return}}
    }
    bank=paper;catName=EX[examKey].name;paperTitle=paper.title;ans={};marks={};idx=0;sTotal=paper.qs.length;tabWarn=0;submitState=0;
    document.getElementById("EXTITLE").textContent=catName+" \u2014 "+paperTitle;document.getElementById("WLBL").textContent="";
    showV("V_EXAM");buildPal();loadQ(0);startTmr(paper.dur*60);
}

function buildPal(){var g=document.getElementById("PAL");g.innerHTML="";for(var i=0;i<bank.qs.length;i++){var b=document.createElement("button");b.textContent=i+1;b.id="PB"+i;b.setAttribute("data-idx",i);g.appendChild(b)}}
function loadQ(i){idx=i;var q=bank.qs[i],sel=ans[q.id]||"";document.getElementById("QCTR").textContent="Q"+(i+1)+"/"+bank.qs.length;document.getElementById("PBAR").style.width=Math.round(((i+1)/bank.qs.length)*100)+"%";var html='<div class="q-title"><span class="qnum">Q'+(i+1)+'</span> of '+bank.qs.length+'<br><br>'+dec(q.t)+'</div><div class="opts">';var opts=["A","B","C","D"];for(var j=0;j<4;j++){var o=opts[j],chk=sel===o?" checked":"",cls=sel===o?" selected":"";html+='<label class="opt'+cls+'"><input type="radio" name="OPT" value="'+o+'"'+chk+'> <strong>'+o+')</strong> '+dec(q.o[o])+'</label>'}html+='</div>';document.getElementById("QBOX").innerHTML=html;var radios=document.querySelectorAll('#QBOX input[type="radio"]');for(var r=0;r<radios.length;r++){radios[r].addEventListener("change",function(){ans[bank.qs[idx].id]=this.value;var aa=document.querySelectorAll('#QBOX .opt');for(var o=0;o<aa.length;o++)aa[o].classList.remove("selected");this.parentElement.classList.add("selected");updatePal()})}updatePal();resetSubmitBtn()}
function updatePal(){for(var i=0;i<bank.qs.length;i++){var b=document.getElementById("PB"+i);if(!b)continue;b.className="";if(ans[bank.qs[i].id])b.className="done";if(marks[bank.qs[i].id])b.className+=" mrk";if(i===idx)b.className+=" cur"}var a=0;for(var i=0;i<bank.qs.length;i++){if(ans[bank.qs[i].id])a++}document.getElementById("SUB_INFO").textContent="Answered: "+a+"/"+bank.qs.length+" | Remaining: "+(bank.qs.length-a)}
function startTmr(sec){if(tmr)clearInterval(tmr);var el=document.getElementById("TIMER"),rem=sec;tmr=setInterval(function(){if(rem<0)return;var m=Math.floor(rem/60),s=rem%60;el.textContent=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;el.style.background=rem<=60?"#DC2626":rem<=300?"#D97706":"#111827";rem--;if(rem<0){clearInterval(tmr);tmr=null;doSubmit()}},1000)}
function resetSubmitBtn(){submitState=0;var btn=document.getElementById("BTN_SUBMIT");btn.innerHTML="&#10003; Final Submit";btn.style.background="var(--red)";btn.style.fontSize="15px";btn.style.padding="14px 20px"}
function handleSubmit(){if(submitState===0){submitState=1;var btn=document.getElementById("BTN_SUBMIT"),a=0;for(var i=0;i<bank.qs.length;i++){if(ans[bank.qs[i].id])a++}btn.innerHTML="CONFIRM ("+a+"/"+bank.qs.length+") \u2014 Tap Again";btn.style.background="#F59E0B";btn.style.fontSize="13px";setTimeout(function(){if(submitState===1)resetSubmitBtn()},6000)}else{submitState=0;doSubmit()}}
function doSubmit(){try{if(tmr){clearInterval(tmr);tmr=null}sTotal=bank.qs.length;sScore=0;sWrong=0;sSkip=0;for(var i=0;i<sTotal;i++){var ua=ans[bank.qs[i].id]||"",ca=dec(bank.qs[i].a);if(ua==="")sSkip++;else if(ua===ca)sScore++;else sWrong++}sPct=sTotal>0?Math.round((sScore/sTotal)*100):0;var attempted=sTotal-sSkip,accuracy=attempted>0?Math.round((sScore/attempted)*100):0;
AIEP.saveResult({date:new Date().toLocaleString(),name:sName,roll:sRoll,email:sEmail,exam:catName,paper:paperTitle,score:sScore,total:sTotal,pct:sPct});
AIEP.log("Result: "+sName+"="+sPct+"%");
showV("V_RESULT");document.getElementById("RN").textContent=sName;document.getElementById("RR").textContent=sRoll;document.getElementById("RE").textContent=catName;document.getElementById("RP").textContent=paperTitle;document.getElementById("RSCORE").textContent=sScore+"/"+sTotal+" ("+sPct+"%)";document.getElementById("RCOR").textContent=sScore;document.getElementById("RWRO").textContent=sWrong;document.getElementById("RSKP").textContent=sSkip;document.getElementById("RACC").textContent=accuracy+"%";var rm=document.getElementById("RREM");if(sPct>=80){rm.textContent="Outstanding!";rm.style.color="var(--grn)"}else if(sPct>=60){rm.textContent="Good!";rm.style.color="var(--pri)"}else if(sPct>=40){rm.textContent="Average.";rm.style.color="var(--gold)"}else{rm.textContent="Below passing.";rm.style.color="var(--red)"}document.getElementById("CCV").classList.add("hide");document.getElementById("SBOX").classList.add("hide");buildSols()}catch(e){showV("V_RESULT");document.getElementById("RSCORE").textContent="Error: "+e.message}}

function buildSols(){var tb=document.getElementById("STB");tb.innerHTML="";for(var i=0;i<bank.qs.length;i++){var q=bank.qs[i],ua=ans[q.id]||"Skipped",ca=dec(q.a),ok=(ua===ca);var tr=document.createElement("tr");tr.innerHTML="<td>"+(i+1)+"</td><td style='max-width:400px'>"+dec(q.t)+"</td><td class='"+(ok?"sol-correct":"sol-wrong")+"'>"+ua+"</td><td class='sol-correct'>"+ca+"</td>";tb.appendChild(tr)}}

function dlCert(){if(sPct<40){toast("Need 40%+","error");return}var cv=document.getElementById("CCV"),ctx=cv.getContext("2d"),W=1056,H=816;cv.width=W;cv.height=H;ctx.fillStyle="#FFFDF7";ctx.fillRect(0,0,W,H);ctx.strokeStyle="#1D4ED8";ctx.lineWidth=6;ctx.strokeRect(15,15,W-30,H-30);ctx.strokeStyle="#3B82F6";ctx.lineWidth=2;ctx.strokeRect(25,25,W-50,H-50);ctx.textAlign="center";ctx.fillStyle="#1D4ED8";ctx.font="bold 13px sans-serif";ctx.fillText("ALL INDIA EXAMINATION AUTHORITY",W/2,68);ctx.fillStyle="#111827";ctx.font="bold 30px sans-serif";ctx.fillText("CERTIFICATE OF ACHIEVEMENT",W/2,140);ctx.fillStyle="#6B7280";ctx.font="italic 15px sans-serif";ctx.fillText("This is to certify that",W/2,210);ctx.fillStyle="#1D4ED8";ctx.font="bold 38px sans-serif";ctx.fillText(sName.toUpperCase(),W/2,280);ctx.fillStyle="#374151";ctx.font="15px sans-serif";ctx.fillText("has successfully completed",W/2,340);ctx.fillStyle="#1D4ED8";ctx.font="bold 20px sans-serif";ctx.fillText(catName,W/2,380);ctx.font="bold 16px sans-serif";ctx.fillText(paperTitle,W/2,410);ctx.fillStyle="#F0F7FF";ctx.fillRect(W/2-140,435,280,80);ctx.strokeStyle="#1D4ED8";ctx.lineWidth=2;ctx.strokeRect(W/2-140,435,280,80);ctx.fillStyle="#1D4ED8";ctx.font="bold 13px sans-serif";ctx.fillText("SCORE",W/2,460);ctx.font="bold 26px monospace";ctx.fillText(sScore+"/"+sTotal+" ("+sPct+"%)",W/2,498);var grade=sPct>=80?"DISTINCTION":sPct>=60?"FIRST CLASS":sPct>=40?"PASS":"NEEDS IMPROVEMENT";ctx.fillStyle=sPct>=80?"#059669":sPct>=60?"#1D4ED8":sPct>=40?"#D97706":"#DC2626";ctx.font="bold 18px sans-serif";ctx.fillText("Grade: "+grade,W/2,555);ctx.fillStyle="#6B7280";ctx.font="12px sans-serif";ctx.fillText("Roll: "+sRoll+" | Date: "+new Date().toLocaleDateString("en-IN"),W/2,595);cv.classList.remove("hide");var a=document.createElement("a");a.download="Certificate_"+sRoll+".png";a.href=cv.toDataURL("image/png");document.body.appendChild(a);a.click();document.body.removeChild(a);toast("Certificate!","ok")}

function dlCSV(){var csv="Q.No,Question,Your Answer,Correct,Status\n";for(var i=0;i<bank.qs.length;i++){var ua=ans[bank.qs[i].id]||"Skipped",ca=dec(bank.qs[i].a);csv+=(i+1)+',"'+dec(bank.qs[i].t).replace(/"/g,'""')+'",'+ua+","+ca+","+(ua===ca?"Correct":"Incorrect")+"\n"}var a=document.createElement("a");a.href=encodeURI("data:text/csv;charset=utf-8,"+csv);a.download="Results_"+sRoll+".csv";document.body.appendChild(a);a.click();document.body.removeChild(a);toast("CSV","ok")}

function updateAboutStats(){var keys=Object.keys(EX),tp2=0;for(var i=0;i<keys.length;i++){var pks=Object.keys(EX[keys[i]].papers);for(var j=0;j<pks.length;j++)tp2+=EX[keys[i]].papers[pks[j]].qs.length}var e1=document.getElementById("AB_EXAMS");if(e1)e1.textContent=keys.length;var e2=document.getElementById("AB_PAPERS");if(e2)e2.textContent=Object.keys(EX).reduce(function(a,k){return a+Object.keys(EX[k]).papers.length},0);var e3=document.getElementById("AB_MCQS");if(e3)e3.textContent=tp2.toLocaleString();var e4=document.getElementById("AB_USERS");if(e4)e4.textContent=AIEP.getUsers().length}

// SECURITY
document.addEventListener("contextmenu",function(e){e.preventDefault()});
document.addEventListener("visibilitychange",function(){if(document.hidden&&!document.getElementById("V_EXAM").classList.contains("hide")){tabWarn++;document.getElementById("WLBL").textContent="Tab Switch: "+tabWarn+"/3";if(tabWarn>=3){toast("Auto-submitting!","error");doSubmit()}else{toast("Warning "+tabWarn+"/3","error")}}});

// ---- EVENTS ----
function bindEvents(){
document.getElementById("NAV_HOME").onclick=goHome;
document.getElementById("NAV_PRICING").onclick=showPricing;
document.getElementById("NAV_AUTH_BTN").onclick=function(){if(loggedInUser)doLogout();else showV("V_AUTH")};
document.getElementById("NAV_THEME").onclick=togTheme;
document.getElementById("TAB_LOGIN").onclick=function(){authMode="login";document.getElementById("AUTH_TITLE").textContent="Login to Your Account";document.getElementById("AUTH_NAME_WRAP").classList.add("hide");document.getElementById("BTN_AUTH_SUBMIT").innerHTML="&#128274; Login";document.getElementById("TAB_LOGIN").className="btn btn-sm btn-outline";document.getElementById("TAB_SIGNUP").className="btn btn-sm btn-gray";document.getElementById("AUTH_ERR").classList.add("hide")};
document.getElementById("TAB_SIGNUP").onclick=function(){authMode="signup";document.getElementById("AUTH_TITLE").textContent="Create Account";document.getElementById("AUTH_NAME_WRAP").classList.remove("hide");document.getElementById("BTN_AUTH_SUBMIT").innerHTML="&#10003; Create Account";document.getElementById("TAB_SIGNUP").className="btn btn-sm btn-outline";document.getElementById("TAB_LOGIN").className="btn btn-sm btn-gray";document.getElementById("AUTH_ERR").classList.add("hide")};
document.getElementById("BTN_AUTH_SUBMIT").onclick=function(){if(authMode==="signup")doSignup();else doLogin()};
document.getElementById("AUTH_PASS").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();if(authMode==="signup")doSignup();else doLogin()}});
document.getElementById("AUTH_EMAIL").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();document.getElementById("AUTH_PASS").focus()}});
["NAV_HOME_AU","NAV_HOME_P","NAV_HOME_PRIV","NAV_HOME_TERM","NAV_HOME_DISC","NAV_HOME_AB"].forEach(function(id){var el=document.getElementById(id);if(el)el.onclick=goHome});
["NAV_THEME_AU","NAV_THEME_P","NAV_THEME_PRIV","NAV_THEME_TERM","NAV_THEME_DISC","NAV_THEME_AB"].forEach(function(id){var el=document.getElementById(id);if(el)el.onclick=togTheme});
var pp=document.getElementById("NAV_PRICING_AB");if(pp)pp.onclick=showPricing;
document.getElementById("LNK_PRIV").onclick=function(e){e.preventDefault();showV("V_PRIVACY")};
document.getElementById("LNK_TERM").onclick=function(e){e.preventDefault();showV("V_TERMS")};
document.getElementById("LNK_DISC").onclick=function(e){e.preventDefault();showV("V_DISCLAIMER")};
document.getElementById("LNK_ABOUT").onclick=function(e){e.preventDefault();updateAboutStats();showV("V_ABOUT")};
document.getElementById("BACK_BTN").onclick=function(){document.getElementById("REGFORM").classList.add("hide");document.getElementById("PAPERSUM").classList.add("hide");document.getElementById("TIERMSG").classList.add("hide");document.getElementById("AUTH_STATUS").classList.add("hide");document.getElementById("EXGRD").classList.remove("hide");document.getElementById("CATBAR").classList.remove("hide")};
document.getElementById("CATBAR").addEventListener("click",function(e){var btn=e.target.closest(".cat-btn");if(!btn)return;var cat=btn.getAttribute("data-cat");var btns=document.querySelectorAll("#CATBAR .cat-btn");for(var i=0;i<btns.length;i++)btns[i].classList.toggle("on",btns[i]===btn);renderCards(cat)});
document.getElementById("EXGRD").addEventListener("click",function(e){var card=e.target.closest(".exam-card");if(!card)return;selectExam(card.getAttribute("data-exam"))});
document.getElementById("BTN_START").onclick=doStartExam;
document.getElementById("F_PAPER").onchange=function(){if(!examKey)return;var pv=this.value,p=EX[examKey].papers[pv];document.getElementById("F_VOUCHER").placeholder=(p&&p.free)?"Free paper":"Enter voucher code";if(p&&p.free)document.getElementById("F_VOUCHER").value=""};
document.getElementById("BTN_PREV").onclick=function(){if(idx>0)loadQ(idx-1)};
document.getElementById("BTN_NEXT").onclick=function(){if(idx<bank.qs.length-1)loadQ(idx+1)};
document.getElementById("BTN_MARK").onclick=function(){var qid=bank.qs[idx].id;marks[qid]=!marks[qid];updatePal();toast(marks[qid]?"Marked":"Unmarked","ok")};
document.getElementById("BTN_SUBMIT").addEventListener("click",function(e){e.preventDefault();e.stopPropagation();handleSubmit()});
document.getElementById("PAL").addEventListener("click",function(e){var btn=e.target.closest("button[data-idx]");if(!btn)return;loadQ(parseInt(btn.getAttribute("data-idx")))});
document.getElementById("BTN_CERT").onclick=dlCert;document.getElementById("BTN_CSV2").onclick=dlCSV;
document.getElementById("BTN_SOL").onclick=function(){document.getElementById("SBOX").classList.toggle("hide")};
document.getElementById("BTN_HOME2").onclick=goHome;
document.getElementById("PRICING_CARDS").addEventListener("click",function(e){var btn=e.target.closest("button[data-tier]");if(!btn)return;var tier=btn.getAttribute("data-tier");if(tier==="free"){AIEP.setTier("free");toast("Free plan!","ok");showPricing();return}var code=prompt("Enter voucher for "+(TIERS[tier]||{}).name+":");if(!code)return;code=code.trim().toUpperCase();var res=AIEP.useVoucher(code);if(res.ok){AIEP.setTier(res.tier||tier);toast("Activated!","ok");showPricing()}else{toast(res.msg,"error")}})}

// ---- INIT ----

function injectAllFacultyQ(){
    var fq = AIEP.getFacultyQ();
    var keys = Object.keys(fq);
    for(var k = 0; k < keys.length; k++){
        var key = keys[k];
        var parts = key.split("_");
        // Find the exam key and paper key
        // Keys are like: ca_foundation_accounting, ca_inter_accounting, etc.
        var examKey = null, paperKey = null;
        var exKeys = Object.keys(EX);
        for(var e = 0; e < exKeys.length; e++){
            if(key.startsWith(exKeys[e] + "_")){
                examKey = exKeys[e];
                paperKey = key.substring(exKeys[e].length + 1);
                break;
            }
        }
        if(!examKey || !EX[examKey] || !EX[examKey].papers[paperKey]) continue;

        var qs = fq[key];
        var enc = function(s){return btoa(unescape(encodeURIComponent(s)))};
        var newQs = [];
        for(var i = 0; i < qs.length; i++){
            newQs.push({
                id: qs[i].id,
                t: enc(qs[i].q),
                o: {A: enc(qs[i].opts.A), B: enc(qs[i].opts.B), C: enc(qs[i].opts.C||"") , D: enc(qs[i].opts.D||"")},
                a: enc(qs[i].ans)
            });
        }
        if(newQs.length > 0){
            EX[examKey].papers[paperKey].qs = newQs;
            console.log("AIEP: Injected " + newQs.length + " Qs into " + examKey + "." + paperKey);
        }
    }
}

window.onload = function(){
    if(localStorage.getItem("x_theme")==="dark") document.body.classList.add("dark");
    buildCats(); renderCards("all"); checkSavedLogin(); bindEvents(); updateAuthUI(); updateAboutStats();

    // Initialize AIEP database
    AIEP.init(function(connected){
        updateDBBadge();
        if(connected){
            AIEP.subscribe();
            AIEP.on("connected", function(){ updateDBBadge(); });
            AIEP.on("data", function(){
                updateAboutStats();
                injectAllFacultyQ();
            });
            // Also inject after a short delay to catch already-loaded data
            setTimeout(injectAllFacultyQ, 3000);
        }
        updateDBBadge();
        if(connected){
            AIEP.subscribe();
            // Listen for real-time updates
            AIEP.on("connected", function(){ updateDBBadge(); });
            AIEP.on("data", function(){ updateAboutStats(); });
        }
    });

    console.log("AIEP Student v11.0: "+Object.keys(EX).length+" exams");
};
})();
