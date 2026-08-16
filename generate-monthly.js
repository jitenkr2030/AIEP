var fs = require('fs');

var TOPICS = {
  scholarship:["General Knowledge","Reasoning","Mathematics","Science","English","Current Affairs","Mental Ability","Indian History","Geography","Social Science"],
  science:["Physics","Chemistry","Biology","Computer Science","Environmental Science","Space Science","Technology","Scientific Methods","Applied Science","Biotechnology"],
  commerce:["Accounting","Business Studies","Economics","Entrepreneurship","Marketing","Finance","Banking","Trade","Management","Commercial Law"],
  language:["English Grammar","Hindi Literature","Vocabulary","Comprehension","Writing Skills","Verbal Ability","Communication","Phonetics","Linguistics","Public Speaking"],
  history:["Indian History","World History","Indian Geography","World Geography","Indian Polity","Civics","Constitution","International Relations","Art and Culture","Heritage"],
  reasoning:["Logical Reasoning","Analytical Reasoning","Quantitative Aptitude","Data Interpretation","Verbal Reasoning","Non-Verbal Reasoning","Puzzles","Series","Coding Decoding","Critical Thinking"],
  computer:["Programming","Data Structures","Algorithms","Calculus","Algebra","Statistics","Database","Networking","Discrete Mathematics","Operating Systems"],
  ai:["Artificial Intelligence","Machine Learning","Deep Learning","NLP","Computer Vision","Digital Marketing","Cloud Computing","Blockchain","Cybersecurity","Data Science"],
  excel:["Excel Functions","Pivot Tables","VLOOKUP","Data Visualization","Statistical Analysis","Power BI","Charts and Graphs","Data Cleaning","Formulas","Macros VBA"],
  gk:["Current Affairs","Static GK","Indian GK","World GK","Sports","Awards","Science Discoveries","Books Authors","Important Dates","First in World"],
  mega:["General Knowledge","Reasoning","Mathematics","Science","English","Computer","Current Affairs","Indian History","Geography","Economics"]
};

var QT=["Which correctly describes TOPIC?","The key principle governing TOPIC is:","Correct statement about TOPIC:","In the context of TOPIC, which is true?","Key requirement for understanding TOPIC:","Which applies to TOPIC?","Concept of TOPIC involves:","Important aspect of TOPIC:","TRUE statement about TOPIC:","Best description of TOPIC:"];
var RO=["This is the correct and widely accepted principle in this field","This represents the standard approach as per current framework","This is the fundamental concept applied in practice","This aligns with established standards and best practices","This is the recognized method used by professionals","This follows the prescribed guidelines and methodology","This is the most accurate interpretation of the concept","This reflects the current understanding and application","This is consistent with regulatory and academic standards","This represents the core principle in this domain"];
var WO=["This contradicts the fundamental principles","This is an outdated interpretation no longer valid","This is a common misconception","This oversimplifies the concept incorrectly","This applies to a different domain entirely","This lacks sufficient evidence or support","This conflicts with established standards","This is based on incorrect assumptions","This is not supported by current framework","This confuses two different concepts"];

function genQ(name,topics,n){var a=[];for(var i=0;i<n;i++){var topic=topics[i%topics.length],ci=(i*3+1)%4,cl="ABCD"[ci],opts={};for(var j=0;j<4;j++){var lk="ABCD"[j];if(j===ci)opts[lk]=btoa(unescape(encodeURIComponent(RO[i%RO.length])));else opts[lk]=btoa(unescape(encodeURIComponent(WO[(i*7+j*13)%WO.length])))}var qt=QT[i%QT.length].replace(/TOPIC/g,topic);a.push({id:"mq"+(i+1),t:btoa(unescape(encodeURIComponent("Q"+(i+1)+". ["+name+"] "+qt))),o:opts,a:btoa(unescape(encodeURIComponent(cl)))})}return a}

var months=[
{key:"jan_scholarship",name:"January - National Scholarship Exam",cat:"monthly",icon:"&#127942;",tag:"JAN",tc:"tag-gov",desc:"National level scholarship examination for all students.",month:1,papers:{paper1:{title:"Paper I - General",dur:90,qs:genQ("Scholarship General",TOPICS.scholarship,50),free:true},paper2:{title:"Paper II - Advanced",dur:120,qs:genQ("Scholarship Advanced",TOPICS.scholarship,50)}}},
{key:"feb_science",name:"February - Science & Tech Olympiad",cat:"monthly",icon:"&#128300;",tag:"FEB",tc:"tag-eng",desc:"Science and Technology Olympiad for aspiring scientists.",month:2,papers:{paper1:{title:"Paper I - Science",dur:90,qs:genQ("Science Olympiad",TOPICS.science,50),free:true},paper2:{title:"Paper II - Technology",dur:90,qs:genQ("Tech Olympiad",TOPICS.computer,50)}}},
{key:"mar_commerce",name:"March - Commerce & Business Challenge",cat:"monthly",icon:"&#128188;",tag:"MAR",tc:"tag-eng",desc:"Commerce and business knowledge challenge.",month:3,papers:{paper1:{title:"Paper I - Commerce",dur:90,qs:genQ("Commerce Challenge",TOPICS.commerce,50),free:true},paper2:{title:"Paper II - Business",dur:90,qs:genQ("Business Challenge",TOPICS.commerce,50)}}},
{key:"apr_language",name:"April - Language & Communication Skills",cat:"monthly",icon:"&#128172;",tag:"APR",tc:"tag-law",desc:"Language proficiency and communication skills challenge.",month:4,papers:{paper1:{title:"Paper I - English",dur:60,qs:genQ("English Skills",TOPICS.language,50),free:true},paper2:{title:"Paper II - Communication",dur:60,qs:genQ("Communication",TOPICS.language,50)}}},
{key:"may_summer",name:"May - Summer National Mega Exam",cat:"monthly",icon:"&#9728;",tag:"MAY",tc:"tag-gov",desc:"Summer national level mega examination.",month:5,papers:{paper1:{title:"Paper I - General",dur:120,qs:genQ("Summer Mega",TOPICS.mega,50),free:true},paper2:{title:"Paper II - Advanced",dur:120,qs:genQ("Summer Advanced",TOPICS.mega,50)},paper3:{title:"Paper III - Expert",dur:150,qs:genQ("Summer Expert",TOPICS.mega,50)}}},
{key:"jun_history",name:"June - History Geography & Civics Challenge",cat:"monthly",icon:"&#127758;",tag:"JUN",tc:"tag-def",desc:"History Geography and Civics knowledge challenge.",month:6,papers:{paper1:{title:"Paper I - History & Geography",dur:90,qs:genQ("History Geo",TOPICS.history,50),free:true},paper2:{title:"Paper II - Civics & Polity",dur:90,qs:genQ("Civics Polity",TOPICS.history,50)}}},
{key:"jul_reasoning",name:"July - Reasoning & Aptitude Challenge",cat:"monthly",icon:"&#129504;",tag:"JUL",tc:"tag-eng",desc:"Logical reasoning and quantitative aptitude challenge.",month:7,papers:{paper1:{title:"Paper I - Reasoning",dur:60,qs:genQ("Reasoning",TOPICS.reasoning,50),free:true},paper2:{title:"Paper II - Aptitude",dur:60,qs:genQ("Aptitude",TOPICS.reasoning,50)}}},
{key:"aug_computer",name:"August - Computer & Maths Challenge",cat:"monthly",icon:"&#128187;",tag:"AUG",tc:"tag-eng",desc:"Computer Science and Mathematics challenge.",month:8,papers:{paper1:{title:"Paper I - Computer Science",dur:90,qs:genQ("Computer",TOPICS.computer,50),free:true},paper2:{title:"Paper II - Mathematics",dur:90,qs:genQ("Mathematics",TOPICS.computer,50)},paper3:{title:"Paper III - Advanced Computing",dur:90,qs:genQ("Adv Computing",TOPICS.computer,50)}}},
{key:"sep_ai",name:"September - AI & Digital Skills Challenge",cat:"monthly",icon:"&#129302;",tag:"SEP",tc:"tag-eng",desc:"Artificial Intelligence and digital skills challenge.",month:9,papers:{paper1:{title:"Paper I - AI Fundamentals",dur:90,qs:genQ("AI Fundamentals",TOPICS.ai,50),free:true},paper2:{title:"Paper II - Digital Skills",dur:90,qs:genQ("Digital Skills",TOPICS.ai,50)}}},
{key:"oct_excel",name:"October - Excel & Data Analysis Challenge",cat:"monthly",icon:"&#128202;",tag:"OCT",tc:"tag-eng",desc:"Microsoft Excel and data analysis skills challenge.",month:10,papers:{paper1:{title:"Paper I - Excel Skills",dur:60,qs:genQ("Excel Skills",TOPICS.excel,50),free:true},paper2:{title:"Paper II - Data Analysis",dur:90,qs:genQ("Data Analysis",TOPICS.excel,50)}}},
{key:"nov_gk",name:"November - General Knowledge Challenge",cat:"monthly",icon:"&#128218;",tag:"NOV",tc:"tag-gov",desc:"General Knowledge challenge for all aspirants.",month:11,papers:{paper1:{title:"Paper I - Indian GK",dur:60,qs:genQ("Indian GK",TOPICS.gk,50),free:true},paper2:{title:"Paper II - World GK",dur:60,qs:genQ("World GK",TOPICS.gk,50)},paper3:{title:"Paper III - Current Affairs",dur:60,qs:genQ("Current Affairs",TOPICS.gk,50)}}},
{key:"dec_mega",name:"December - National Mega Online Exam",cat:"monthly",icon:"&#127775;",tag:"DEC",tc:"tag-gov",desc:"Grand national level mega online examination.",month:12,papers:{paper1:{title:"Paper I - General Ability",dur:120,qs:genQ("Mega General",TOPICS.mega,50),free:true},paper2:{title:"Paper II - Professional",dur:150,qs:genQ("Mega Professional",TOPICS.mega,50)},paper3:{title:"Paper III - Expert Level",dur:180,qs:genQ("Mega Expert",TOPICS.mega,50)}}}
];

var out='// ============================================================\n';
out+='// MONTHLY EXAM SERIES - 12 Months Challenge\n';
out+='// ============================================================\n';
out+='(function(){\n';
out+='if(!window.EXAMS) window.EXAMS={};\n';

for(var m=0;m<months.length;m++){
  var mo=months[m];
  out+='window.EXAMS["'+mo.key+'"]={name:"'+mo.name+'",cat:"'+mo.cat+'",icon:"'+mo.icon+'",tag:"'+mo.tag+'",tc:"'+mo.tc+'",desc:"'+mo.desc+'",monthly:true,month:'+mo.month+',papers:{';
  var pkeys=Object.keys(mo.papers);
  for(var p=0;p<pkeys.length;p++){
    var pa=mo.papers[pkeys[p]];
    out+=pkeys[p]+':{title:"'+pa.title+'",dur:'+pa.dur+',qs:[';
    for(var q=0;q<pa.qs.length;q++){
      var qq=pa.qs[q];
      out+='{id:"'+qq.id+'",t:"'+qq.t+'",o:{';
      var okeys=Object.keys(qq.o);
      for(var oi=0;oi<okeys.length;oi++){
        out+=okeys[oi]+':"'+qq.o[okeys[oi]]+'"';
        if(oi<okeys.length-1)out+=',';
      }
      out+='},a:"'+qq.a+'"}';
      if(q<pa.qs.length-1)out+=',';
    }
    out+=']';
    if(pa.free)out+=',free:true';
    out+='}';
    if(p<pkeys.length-1)out+=',';
  }
  out+='}};\n';
}
out+='})();\n';
fs.writeFileSync('monthly-exams.js',out);
console.log('monthly-exams.js created! ('+out.length+' bytes, '+months.length+' months)');
