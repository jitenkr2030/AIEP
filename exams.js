// ============================================================
// EXAM DEFINITIONS — Edit here to add/modify exams
// ============================================================
(function(){
var TP = window.TOPICS;

// Question generator — simple MCQ
function genQ(name,n){
    var a=[];
    for(var i=1;i<=n;i++){
        var ci=(i*3+1)%4,cl="ABCD"[ci],opts={};
        for(var j=0;j<4;j++){
            var lk="ABCD"[j];
            if(j===ci) opts[lk]=btoa(unescape(encodeURIComponent("Correct: Concept "+((i%20)+1)+" under "+name+" as per syllabus.")));
            else opts[lk]=btoa(unescape(encodeURIComponent("Option "+lk+": Topic "+((i+j*3)%15+1)+" — incorrect.")));
        }
        a.push({id:"q"+i,
            t:btoa(unescape(encodeURIComponent("Q"+i+". ["+name+"] Topic "+((i%20)+1)+": Which statement is correct?"))),
            o:opts,a:btoa(unescape(encodeURIComponent(cl)))
        });
    }
    return a;
}

// Professional question generator
function genProQ(name,n,tp){
    var qT=["Which correctly describes TOPIC under NAME?","The principle governing TOPIC in NAME:","Correct statement about TOPIC per NAME:","Recognition of TOPIC under NAME requires:","Key requirement for TOPIC under NAME?","Which applies to TOPIC per NAME?","Concept of TOPIC in NAME involves:","Provision about TOPIC under NAME:","TRUE statement about TOPIC in NAME:","Correct treatment of TOPIC per NAME:"];
    var rO=["Proper classification and faithful representation per framework","Recognition when probable benefits flow and reliable measurement possible","Systematic allocation over useful life per benefit patterns","Substance over form ensuring economic reality","Matching principle entries in period incurred","Prudence with neutrality and completeness","Accrual basis with adjustments for estimates","Fair value through market prices or valuation techniques","Disclosure in notes with comparative information","Audit verification ensuring completeness and accuracy"];
    var wO=["Contradicts fundamental principles","Not recognized under current standards","Incorrect interpretation no longer applicable","Superseded by recent amendments","Different category not covered","Oversimplification ignoring requirements","Lacks required disclosure","Conflicts with relevant information objective","Mixes different frameworks","Common misconception not supported"];
    var a=[];
    for(var i=0;i<n;i++){
        var topic=tp[i%tp.length],ci=(i*3+1)%4,cl="ABCD"[ci],opts={};
        for(var j=0;j<4;j++){
            var lk="ABCD"[j];
            if(j===ci) opts[lk]=btoa(unescape(encodeURIComponent(rO[i%rO.length])));
            else opts[lk]=btoa(unescape(encodeURIComponent(wO[(i*7+j*13)%wO.length])));
        }
        var qt=qT[i%qT.length].replace(/TOPIC/g,topic).replace(/NAME/g,name);
        a.push({id:"q"+(i+1),t:btoa(unescape(encodeURIComponent("Q"+(i+1)+". "+qt))),o:opts,a:btoa(unescape(encodeURIComponent(cl)))});
    }
    return a;
}

// Professional papers helper
function profP(pre,ex,lvls,dur){
    var papers={};
    for(var l=0;l<lvls.length;l++){
        var lv=lvls[l];
        for(var s=0;s<lv.subjects.length;s++){
            var sub=lv.subjects[s];
            papers[pre+"_"+l+"_"+s]={
                title:lv.name+" — "+sub.name,
                level:lv.name,
                dur:sub.dur||dur||180,
                qs:genProQ(ex+" "+sub.name,100,sub.topics),
                free:sub.free||false
            };
        }
    }
    return papers;
}

// ============================================================
// ALL EXAMS — Add new exams below
// ============================================================
window.EXAMS = {

// ---- COMPETITIVE EXAMS ----
jee:{name:"JEE Main",cat:"engineering",icon:"&#128300;",tag:"Engineering",tc:"tag-eng",desc:"Engineering entrance examination.",
    papers:{full:{title:"JEE Full",dur:180,qs:genQ("JEE",50)},math:{title:"Maths",dur:60,qs:genQ("JEE Math",50),free:true}}},
upsc:{name:"UPSC CSE",cat:"civil",icon:"&#127963;",tag:"Civil",tc:"tag-gov",desc:"Civil Services Examination.",
    papers:{gs1:{title:"GS Paper I",dur:120,qs:genQ("UPSC GS1",50)},gs2:{title:"CSAT",dur:120,qs:genQ("UPSC CSAT",50)}}},
ssc:{name:"SSC CGL",cat:"ssc",icon:"&#128188;",tag:"SSC",tc:"tag-gov",desc:"Staff Selection Commission.",
    papers:{gk:{title:"GK",dur:60,qs:genQ("SSC GK",50),free:true},quant:{title:"Quant",dur:60,qs:genQ("SSC Quant",50)}}},
bank:{name:"Banking",cat:"banking",icon:"&#127974;",tag:"Banking",tc:"tag-eng",desc:"Bank PO/Clerk examinations.",
    papers:{po:{title:"Bank PO",dur:180,qs:genQ("Bank PO",50)},reason:{title:"Reasoning",dur:45,qs:genQ("Bank Reasoning",50),free:true}}},
clat:{name:"CLAT",cat:"law",icon:"&#9878;",tag:"Law",tc:"tag-law",desc:"Common Law Admission Test.",
    papers:{full:{title:"CLAT UG",dur:120,qs:genQ("CLAT",50)}}},
nda:{name:"NDA",cat:"defence",icon:"&#9876;",tag:"Defence",tc:"tag-def",desc:"National Defence Academy.",
    papers:{math:{title:"NDA Math",dur:150,qs:genQ("NDA",50)},gat:{title:"NDA GAT",dur:150,qs:genQ("NDA GAT",50),free:true}}},
cat:{name:"CAT",cat:"management",icon:"&#128188;",tag:"MBA",tc:"tag-mgmt",desc:"MBA entrance examination.",
    papers:{full:{title:"CAT Full",dur:120,qs:genQ("CAT",50)}}},
ctet:{name:"CTET",cat:"teaching",icon:"&#128218;",tag:"Teach",tc:"tag-law",desc:"Teacher eligibility test.",
    papers:{p1:{title:"CTET P1",dur:150,qs:genQ("CTET",50)},p2:{title:"CTET P2",dur:150,qs:genQ("CTET P2",50)}}},
gate:{name:"GATE",cat:"gate",icon:"&#127891;",tag:"GATE",tc:"tag-eng",desc:"Graduate Aptitude Test in Engineering.",
    papers:{cse:{title:"GATE CSE",dur:180,qs:genQ("GATE",50),free:true},ee:{title:"GATE EE",dur:180,qs:genQ("GATE EE",50)},me:{title:"GATE ME",dur:180,qs:genQ("GATE ME",50)}}},
rbi:{name:"RBI Grade B",cat:"banking",icon:"&#127974;",tag:"RBI",tc:"tag-eng",desc:"Reserve Bank Officer examination.",
    papers:{p1:{title:"Phase I",dur:120,qs:genQ("RBI",50)},p2:{title:"Phase II",dur:180,qs:genQ("RBI P2",50)}}},
cuet:{name:"CUET",cat:"entrance",icon:"&#127891;",tag:"CUET",tc:"tag-eng",desc:"Common University Entrance Test.",
    papers:{gk:{title:"General Test",dur:75,qs:genQ("CUET",50),free:true}}},
ntpc:{name:"RRB NTPC",cat:"ssc",icon:"&#128188;",tag:"Railway",tc:"tag-gov",desc:"Railway NTPC examination.",
    papers:{full:{title:"NTPC",dur:90,qs:genQ("NTPC",50),free:true}}},
ugcnet:{name:"UGC NET",cat:"teaching",icon:"&#128218;",tag:"UGC",tc:"tag-law",desc:"National Eligibility Test.",
    papers:{p1:{title:"Paper I",dur:120,qs:genQ("UGC",50),free:true}}},

// ---- PROFESSIONAL EXAMS ----


acca:{name:"ACCA (UK)",cat:"professional",icon:"&#127468;&#127463;",tag:"ACCA",tc:"tag-fina",desc:"ACCA — Knowledge to Strategic.",
    papers:profP("acca","ACCA",[
        {name:"Knowledge",subjects:[{name:"BT",topics:TP.it,free:true},{name:"MA",topics:TP.cost},{name:"FA",topics:TP.accounting}]},
        {name:"Skills",subjects:[{name:"LW",topics:TP.law},{name:"PM",topics:TP.cost},{name:"TX",topics:TP.tax},{name:"FR",topics:TP.advacc},{name:"AA",topics:TP.audit},{name:"FM",topics:TP.finmgmt}]},
        {name:"Strategic",subjects:[{name:"SBL",topics:TP.strategy},{name:"SBR",topics:TP.advacc},{name:"AFM",topics:TP.finmgmt},{name:"APM",topics:TP.cost}]}
    ],180)},

uscma:{name:"US CMA (IMA)",cat:"professional",icon:"&#127482;&#127480;",tag:"US CMA",tc:"tag-fina",desc:"IMA Certified Management Accountant.",
    papers:profP("uscma","US CMA",[
        {name:"Part 1",subjects:[{name:"Reporting",topics:TP.accounting},{name:"Planning",topics:TP.cost},{name:"Performance",topics:TP.cost},{name:"Cost Mgmt",topics:TP.cost},{name:"Controls",topics:TP.audit},{name:"Technology",topics:TP.it}]},
        {name:"Part 2",subjects:[{name:"Analysis",topics:TP.advacc},{name:"Corp Finance",topics:TP.finmgmt},{name:"Decision",topics:TP.finmgmt},{name:"Risk",topics:TP.risk},{name:"Investment",topics:TP.invest},{name:"Ethics",topics:TP.ethics}]}
    ],240)},

cfa:{name:"CFA",cat:"professional",icon:"&#128176;",tag:"CFA",tc:"tag-fina",desc:"CFA Institute — Level I, II, III.",
    papers:profP("cfa","CFA",[
        {name:"Level I",subjects:[{name:"Ethics",topics:TP.ethics,free:true},{name:"Quant",topics:TP.quant},{name:"Economics",topics:TP.economics},{name:"FRA",topics:TP.advacc},{name:"Equity",topics:TP.invest},{name:"Fixed Income",topics:TP.invest},{name:"Portfolio",topics:TP.invest}]},
        {name:"Level II",subjects:[{name:"Ethics",topics:TP.ethics},{name:"Quant",topics:TP.quant},{name:"FRA",topics:TP.advacc},{name:"Equity",topics:TP.invest},{name:"FI",topics:TP.invest},{name:"Derivatives",topics:TP.invest},{name:"Portfolio",topics:TP.invest}]},
        {name:"Level III",subjects:[{name:"Ethics",topics:TP.ethics},{name:"Private Wealth",topics:TP.invest},{name:"Institutional",topics:TP.invest},{name:"Deriv & Risk",topics:TP.risk},{name:"Trading",topics:TP.invest},{name:"Performance",topics:TP.invest}]}
    ],180)},

frm:{name:"FRM (GARP)",cat:"professional",icon:"&#127919;",tag:"FRM",tc:"tag-fina",desc:"Financial Risk Manager — GARP.",
    papers:profP("frm","FRM",[
        {name:"Part 1",subjects:[{name:"Risk Foundations",topics:TP.risk,free:true},{name:"Quant",topics:TP.quant},{name:"Markets",topics:TP.invest},{name:"Valuation",topics:TP.risk}]},
        {name:"Part 2",subjects:[{name:"Market Risk",topics:TP.risk},{name:"Credit Risk",topics:TP.risk},{name:"Operational",topics:TP.risk},{name:"Liquidity",topics:TP.risk},{name:"Risk & Invest",topics:TP.invest},{name:"Current Issues",topics:TP.invest}]}
    ],240)},

cpa:{name:"US CPA (AICPA)",cat:"professional",icon:"&#127482;&#127480;",tag:"US CPA",tc:"tag-fina",desc:"AICPA CPA Examination.",
    papers:profP("cpa","US CPA",[
        {name:"AUD",subjects:[{name:"Responsibilities",topics:TP.ethics},{name:"Risk",topics:TP.audit},{name:"Evidence",topics:TP.audit},{name:"Reporting",topics:TP.audit}]},
        {name:"FAR",subjects:[{name:"Framework",topics:TP.advacc},{name:"Accounts",topics:TP.accounting},{name:"Transactions",topics:TP.advacc},{name:"Govt",topics:TP.accounting}]},
        {name:"REG",subjects:[{name:"Ethics",topics:TP.ethics},{name:"Business Law",topics:TP.law},{name:"Individual Tax",topics:TP.tax},{name:"Entity Tax",topics:TP.tax}]},
        {name:"BEC",subjects:[{name:"Governance",topics:TP.strategy},{name:"Economics",topics:TP.economics},{name:"FM",topics:TP.finmgmt},{name:"IT",topics:TP.it}]}
    ],240)},

ea:{name:"EA (IRS)",cat:"professional",icon:"&#127919;",tag:"EA",tc:"tag-fina",desc:"Enrolled Agent — IRS.",
    papers:profP("ea","EA",[
        {name:"Part 1",subjects:[{name:"Individuals",topics:TP.tax.concat(TP.economics),free:true}]},
        {name:"Part 2",subjects:[{name:"Businesses",topics:TP.tax.concat(TP.accounting)}]},
        {name:"Part 3",subjects:[{name:"Representation",topics:TP.tax.concat(TP.law)}]}
    ],240)},

icfai:{name:"ICFAI CFA",cat:"professional",icon:"&#127891;",tag:"ICFAI",tc:"tag-prof",desc:"ICFAI CFA Program.",
    papers:profP("icfai","ICFAI",[
        {name:"Foundation",subjects:[{name:"Accounting",topics:TP.accounting,free:true},{name:"Economics",topics:TP.economics},{name:"Quant",topics:TP.quant},{name:"Finance",topics:TP.invest}]},
        {name:"Intermediate",subjects:[{name:"FRA",topics:TP.advacc},{name:"Corp Finance",topics:TP.finmgmt},{name:"Analysis",topics:TP.invest},{name:"Portfolio",topics:TP.invest}]},
        {name:"Final",subjects:[{name:"Adv FRA",topics:TP.advacc},{name:"Adv Portfolio",topics:TP.invest},{name:"Deriv & Risk",topics:TP.risk},{name:"Ethics",topics:TP.ethics}]}
    ],180)},

actuarial:{name:"Actuarial (IAI)",cat:"professional",icon:"&#128202;",tag:"Actuarial",tc:"tag-prof",desc:"Institute of Actuaries of India.",
    papers:profP("actuarial","Actuarial",[
        {name:"CT Series",subjects:[{name:"CT1 Fin Maths",topics:TP.finmgmt.concat(TP.quant),free:true},{name:"CT2 Finance",topics:TP.accounting},{name:"CT3 Probability",topics:TP.quant},{name:"CT4 Models",topics:TP.quant},{name:"CT5 Insurance",topics:TP.risk},{name:"CT6 Statistics",topics:TP.quant},{name:"CT7 Economics",topics:TP.economics},{name:"CT8 Fin Economics",topics:TP.invest}]}
    ],180)},

cima:{name:"CIMA (UK)",cat:"professional",icon:"&#127468;&#127463;",tag:"CIMA",tc:"tag-fina",desc:"CIMA Management Accounting.",
    papers:profP("cima","CIMA",[
        {name:"Operational",subjects:[{name:"E1",topics:TP.strategy},{name:"P1",topics:TP.cost},{name:"F1",topics:TP.accounting}]},
        {name:"Management",subjects:[{name:"E2",topics:TP.strategy},{name:"P2",topics:TP.cost},{name:"F2",topics:TP.finmgmt}]},
        {name:"Strategic",subjects:[{name:"E3",topics:TP.strategy},{name:"P3",topics:TP.cost},{name:"F3",topics:TP.finmgmt}]}
    ],180)},

// ---- NEET EXAMS ----
neet:{name:"NEET (UG)",cat:"medical",icon:"&#129657;",tag:"Medical",tc:"tag-med",desc:"Medical entrance examination — Physics, Chemistry, Biology.",
    papers:{physics:{title:"Physics",dur:90,qs:genQ("NEET Phy",50),free:true},chemistry:{title:"Chemistry",dur:90,qs:genQ("NEET Chem",50)},biology:{title:"Biology",dur:90,qs:genQ("NEET Bio",50)}}},

// ---- ICSI EXAMS ----
icsi_cseet:{name:"CSEET",cat:"professional",icon:"&#127963;",tag:"CS",tc:"tag-prof",desc:"Company Secretary Executive Entrance Test — ICSI.",
    papers:{business_communication:{title:"Business Communication",dur:120,qs:genQ("CSEET Comm",50),free:true},legal_aptitude:{title:"Legal Aptitude",dur:120,qs:genQ("CSEET Legal",50)},economic_environment:{title:"Economic Environment",dur:120,qs:genQ("CSEET Eco",50)},current_affairs:{title:"Current Affairs",dur:120,qs:genQ("CSEET CA",50)}}},
icsi_executive:{name:"ICSI Executive",cat:"professional",icon:"&#128196;",tag:"CS",tc:"tag-prof",desc:"Company Secretary Executive Programme.",
    papers:{jurisprudence:{title:"Jurisprudence",dur:180,qs:genQ("Exec Juris",50)},company_law:{title:"Company Law",dur:180,qs:genQ("Exec CoLaw",50)},business_entities:{title:"Business Entities",dur:180,qs:genQ("Exec BEnt",50)},tax_laws:{title:"Tax Laws",dur:180,qs:genQ("Exec Tax",50)},corporate_accounting:{title:"Corp Accounting",dur:180,qs:genQ("Exec Acc",50)},securities_laws:{title:"Securities Laws",dur:180,qs:genQ("Exec SecL",50)},economic_commercial:{title:"Economic Commercial",dur:180,qs:genQ("Exec Econ",50)},financial_mgmt:{title:"Financial Mgmt",dur:180,qs:genQ("Exec Fin",50)}}},
icsi_professional:{name:"ICSI Professional",cat:"professional",icon:"&#128196;",tag:"CS",tc:"tag-prof",desc:"Company Secretary Professional Programme.",
    papers:{governance_ethics:{title:"Governance Ethics",dur:180,qs:genQ("Prof Gov",50)},advanced_tax:{title:"Advanced Tax",dur:180,qs:genQ("Prof ATax",50)},drafting_pleadings:{title:"Drafting Pleadings",dur:180,qs:genQ("Prof Draft",50)},secretarial_audit:{title:"Secretarial Audit",dur:180,qs:genQ("Prof SecAud",50)},corporate_restructuring:{title:"Corp Restructuring",dur:180,qs:genQ("Prof Restr",50)},resolution_disputes:{title:"Resolution Disputes",dur:180,qs:genQ("Prof Dispt",50)},corporate_funding:{title:"Corp Funding",dur:180,qs:genQ("Prof Fund",50)},multidisciplinary:{title:"Multidisciplinary",dur:180,qs:genQ("Prof Multi",50)}}}
};

})();
