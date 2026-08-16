// ============================================================
// AIEP SECURITY MODULE - Anti-Cheating & Platform Security
// ============================================================
(function(){

// ---- CONFIG ----
var SEC={maxTabWarnings:3,loginAttempts:{},maxLoginAttempts:5,lockoutMinutes:15,sessionTimeout:120,examActive:false};

// ---- 1. PASSWORD HASHING (SHA-256) ----
function sha256(str){
  function r(n,x){return(x>>>n)|(x<<(32-n))}
  var K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  var H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  var i,j,t1,t2,W=[];
  str=unescape(encodeURIComponent(str));
  var l=str.length*8;
  str+=String.fromCharCode(0x80);
  while(str.length%64!==56)str+=String.fromCharCode(0);
  for(i=0;i<str.length;i++){
    var b=i>>2;
    W[b]=(W[b]||0)|(str.charCodeAt(i)<<((3-(i%4))*8));
  }
  W.push(0);W.push(l);
  for(j=0;j<W.length;j+=16){
    var w=W.slice(j,j+16);
    for(i=16;i<64;i++){
      var s0=r(7,w[i-15])^r(18,w[i-15])>>>(3);
      var s1=r(17,w[i-2])^r(19,w[i-2])>>>(10);
      w[i]=((w[i-16]|0)+s0+(w[i-7]|0)+s1)|0;
    }
    var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for(i=0;i<64;i++){
      var S1=r(6,e)^r(11,e)^r(25,e);
      var ch=(e&f)^(~e&g);
      t1=(h+S1+ch+K[i]+w[i])|0;
      var S0=r(2,a)^r(13,a)^r(22,a);
      var maj=(a&b)^(a&c)^(b&c);
      t2=(S0+maj)|0;
      h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;
    }
    H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;
    H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0;
  }
  var hex="";
  for(i=0;i<8;i++){var s=(H[i]>>>0).toString(16);while(s.length<8)s="0"+s;hex+=s;}
  return hex;
}

// ---- 2. ANTI-CHEATING: Disable Right Click ----
function disableRightClick(){
  document.addEventListener("contextmenu",function(e){
    if(SEC.examActive){e.preventDefault();toast("Right click disabled during exam","error");return false;}
  });
}

// ---- 3. ANTI-CHEATING: Disable Copy/Paste/Cut ----
function disableCopyPaste(){
  document.addEventListener("copy",function(e){if(SEC.examActive){e.preventDefault();toast("Copy disabled","error")}});
  document.addEventListener("paste",function(e){if(SEC.examActive){e.preventDefault();toast("Paste disabled","error")}});
  document.addEventListener("cut",function(e){if(SEC.examActive){e.preventDefault();toast("Cut disabled","error")}});
}

// ---- 4. ANTI-CHEATING: Disable Keyboard Shortcuts ----
function disableShortcuts(){
  document.addEventListener("keydown",function(e){
    if(!SEC.examActive)return;
    if(e.key==="F12"){e.preventDefault();return false;}
    if(e.ctrlKey&&e.shiftKey&&(e.key==="I"||e.key==="i"||e.key==="J"||e.key==="j"||e.key==="C"||e.key==="c")){e.preventDefault();return false;}
    if(e.ctrlKey&&(e.key==="u"||e.key==="U"||e.key==="s"||e.key==="S"||e.key==="h"||e.key==="H"||e.key==="a"||e.key==="A")){e.preventDefault();return false;}
    if(e.key==="PrintScreen"){e.preventDefault();toast("Screenshots not allowed","error");return false;}
    if(e.altKey&&e.key==="Tab"){e.preventDefault();return false;}
  });
}

// ---- 5. ANTI-CHEATING: Disable Text Selection ----
function disableSelection(){
  document.addEventListener("selectstart",function(e){
    if(SEC.examActive&&!e.target.matches("input,textarea")){e.preventDefault();return false;}
  });
}

// ---- 6. ANTI-CHEATING: Fullscreen Enforcement ----
function enforceFullscreen(){
  if(!document.fullscreenElement){
    try{document.documentElement.requestFullscreen().catch(function(){})}catch(e){}
  }
}

function exitFullscreen(){
  if(document.fullscreenElement){
    try{document.exitFullscreen().catch(function(){})}catch(e){}
  }
}

// ---- 7. ANTI-CHEATING: DevTools Detection ----
var devToolsOpen=false;
function detectDevTools(){
  setInterval(function(){
    if(!SEC.examActive)return;
    var threshold=160;
    if(window.outerWidth-window.innerWidth>threshold||window.outerHeight-window.innerHeight>threshold){
      if(!devToolsOpen){
        devToolsOpen=true;
        toast("DevTools detected! Auto-submitting.","error");
        setTimeout(function(){if(typeof doSubmit==="function")doSubmit()},2000);
      }
    }else{devToolsOpen=false;}
  },1000);
}

// ---- 8. ANTI-CHEATING: Disable Browser Back ----
function disableBack(){
  if(SEC.examActive){
    history.pushState(null,"","#exam");
    window.onpopstate=function(){history.pushState(null,"","#exam")};
  }
}

function enableBack(){
  window.onpopstate=null;
}

// ---- 9. ANTI-CHEATING: Randomize Questions ----
function shuffleArray(arr){
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=a[i];a[i]=a[j];a[j]=t;
  }
  return a;
}

function shuffleOptions(q){
  var keys=["A","B","C","D"];
  var vals=keys.map(function(k){return q.o[k]});
  var correctVal=q.o[q.a?"A":"A"];
  var correctDecoded=decodeURIComponent(atob(q.a));
  var correctOrigKey=correctDecoded;
  var origOpts={};
  keys.forEach(function(k,i){origOpts[k]=vals[i]});
  var indices=[0,1,2,3];
  for(var i=indices.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=indices[i];indices[i]=indices[j];indices[j]=t;
  }
  var newOpts={};
  var newCorrectKey="";
  for(var i=0;i<4;i++){
    var newKey=keys[i];
    var origKey=keys[indices[i]];
    newOpts[newKey]=origOpts[origKey];
    if(origKey===correctOrigKey)newCorrectKey=newKey;
  }
  return {t:q.t,o:newOpts,a:btoa(unescape(encodeURIComponent(newCorrectKey))),id:q.id};
}

function randomizeExam(paper){
  var qs=shuffleArray(paper.qs);
  for(var i=0;i<qs.length;i++){
    try{qs[i]=shuffleOptions(qs[i])}catch(e){}
  }
  return {title:paper.title,dur:paper.dur,qs:qs,free:paper.free};
}

// ---- 10. PLATFORM SECURITY: Input Sanitization ----
function sanitize(str){
  if(typeof str!=="string")return str;
  return str.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

// ---- 11. PLATFORM SECURITY: Rate Limiting ----
function checkRateLimit(identifier){
  var now=Date.now();
  var attempts=SEC.loginAttempts[identifier];
  if(!attempts){SEC.loginAttempts[identifier]={count:0,firstAttempt:now};return{ok:true}};
  if(now-attempts.firstAttempt>SEC.lockoutMinutes*60*1000){
    SEC.loginAttempts[identifier]={count:0,firstAttempt:now};return{ok:true};
  }
  if(attempts.count>=SEC.maxLoginAttempts){
    var wait=Math.ceil((SEC.lockoutMinutes*60*1000-(now-attempts.firstAttempt))/60000);
    return{ok:false,msg:"Too many attempts. Try again in "+wait+" minutes."};
  }
  return{ok:true};
}

function recordAttempt(identifier){
  var now=Date.now();
  if(!SEC.loginAttempts[identifier])SEC.loginAttempts[identifier]={count:0,firstAttempt:now};
  SEC.loginAttempts[identifier].count++;
}

function clearAttempts(identifier){
  delete SEC.loginAttempts[identifier];
}

// ---- 12. PLATFORM SECURITY: Session Timeout ----
var sessionTimer=null;
function startSession(){
  if(sessionTimer)clearTimeout(sessionTimer);
  sessionTimer=setTimeout(function(){
    if(typeof loggedInUser!=="undefined"&&loggedInUser){
      toast("Session expired. Please login again.","error");
      if(typeof doLogout==="function")doLogout();
    }
  },SEC.sessionTimeout*60*1000);
}

function resetSession(){
  if(sessionTimer)clearTimeout(sessionTimer);
  startSession();
}

// ---- 13. PLATFORM SECURITY: Result Tampering Prevention ----
function secureResult(score,total,pct){
  var check=(score*7+total*13+pct*3)%997;
  return{score:score,total:total,pct:pct,checksum:check,ts:Date.now()};
}

function verifyResult(result){
  if(!result||!result.checksum)return false;
  var check=(result.score*7+result.total*13+result.pct*3)%997;
  return check===result.checksum;
}

// ---- 14. PLATFORM SECURITY: Exam Time Validation ----
function startExamTimer(duration){
  SEC.examStartTime=Date.now();
  SEC.examDuration=duration*1000;
  SEC.examActive=true;
  enforceFullscreen();
  disableBack();
}

function validateExamTime(){
  if(!SEC.examStartTime)return true;
  var elapsed=Date.now()-SEC.examStartTime;
  return elapsed<=SEC.examDuration+5000;
}

function endExam(){
  SEC.examActive=false;
  SEC.examStartTime=null;
  exitFullscreen();
  enableBack();
}

// ---- 15. PLATFORM SECURITY: Audit Log ----
function secLog(action,details){
  var log=JSON.parse(localStorage.getItem("x_sec_log")||"[]");
  log.push({action:action,details:details,ts:new Date().toISOString(),user:(typeof loggedInUser!=="undefined"&&loggedInUser)?loggedInUser.email:"anonymous"});
  if(log.length>500)log=log.slice(-500);
  localStorage.setItem("x_sec_log",JSON.stringify(log));
}

// ---- 16. FULLSCREEN CHANGE LISTENER ----
document.addEventListener("fullscreenchange",function(){
  if(SEC.examActive&&!document.fullscreenElement){
    toast("Please stay in fullscreen during exam!","error");
    setTimeout(function(){enforceFullscreen()},1000);
  }
});

// ---- 17. ACTIVITY MONITOR ----
document.addEventListener("mousemove",function(){if(SEC.examActive)resetSession()});
document.addEventListener("keydown",function(){if(SEC.examActive)resetSession()});

// ---- INITIALIZE ALL ----
function initSecurity(){
  disableRightClick();
  disableCopyPaste();
  disableShortcuts();
  disableSelection();
  detectDevTools();
  secLog("security_init","All security modules loaded");
  console.log("AIEP Security: All modules active");
}

// ---- EXPORT TO GLOBAL ----
window.AIEP_SEC={
  init:initSecurity,
  startExam:startExamTimer,
  endExam:endExam,
  randomizeExam:randomizeExam,
  shuffleArray:shuffleArray,
  sanitize:sanitize,
  sha256:sha256,
  checkRateLimit:checkRateLimit,
  recordAttempt:recordAttempt,
  clearAttempts:clearAttempts,
  startSession:startSession,
  resetSession:resetSession,
  secureResult:secureResult,
  verifyResult:verifyResult,
  validateTime:validateExamTime,
  secLog:secLog,
  enforceFullscreen:enforceFullscreen,
  exitFullscreen:exitFullscreen,
  config:SEC
};

document.addEventListener("DOMContentLoaded",function(){initSecurity()});
})();