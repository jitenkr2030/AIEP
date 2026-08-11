const crypto = require("crypto");
const { init } = require("@instantdb/admin");

const db = init({
  appId: "52877744-72cc-404a-b68e-fb01f3e387ac",
  adminToken: "9374433e-fd5f-4d17-b065-6102bd7df017"
});

const uuid = () => crypto.randomUUID();

async function pushQuestions(examKey, paperKey, questions) {
  const key = examKey + "_" + paperKey;
  console.log("Pushing " + questions.length + " questions for " + key + "...");
  const formattedQ = questions.map((q) => ({
    id: "cma_" + uuid(),
    q: q.question,
    opts: { A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D },
    ans: q.answer,
    diff: q.difficulty || "medium",
    topic: q.topic || "",
    explain: q.explanation || "",
    date: new Date().toLocaleString()
  }));
  const id = uuid();
  await db.transact(db.tx.facultyq[id].update({
    paperKey: key,
    count: formattedQ.length,
    questions: JSON.stringify(formattedQ),
    updated: new Date().toISOString()
  }));
  console.log("  OK: " + formattedQ.length + " questions pushed");
}

const CMA_F1_ECONOMICS = [
  {question:"The law of demand states that, ceteris paribus:",options:{A:"Price and quantity demanded move in the same direction",B:"Price and quantity demanded move in opposite directions",C:"Demand increases with price",D:"Supply determines demand"},answer:"B",topic:"Demand",difficulty:"easy",explanation:"As price increases, quantity demanded decreases, and vice versa."},
  {question:"Price elasticity of demand is measured as:",options:{A:"% change in quantity supplied / % change in price",B:"% change in quantity demanded / % change in price",C:"Change in price / Change in quantity",D:"Total revenue / Price"},answer:"B",topic:"Elasticity",difficulty:"easy",explanation:"Price elasticity = % change in quantity demanded / % change in price."},
  {question:"Monopolistic competition is characterized by:",options:{A:"Single seller",B:"Many sellers with differentiated products",C:"Few sellers only",D:"Homogeneous products only"},answer:"B",topic:"Market Structures",difficulty:"easy",explanation:"Monopolistic competition has many sellers offering differentiated products."},
  {question:"GDP at market prices minus depreciation equals:",options:{A:"NDP at factor cost",B:"NDP at market prices",C:"GNP at market prices",D:"Personal income"},answer:"B",topic:"National Income",difficulty:"medium",explanation:"NDP at market prices = GDP at market prices minus Depreciation."},
  {question:"Which is NOT a function of money?",options:{A:"Medium of exchange",B:"Store of value",C:"Measure of wealth",D:"Standard of deferred payment"},answer:"C",topic:"Money",difficulty:"easy",explanation:"Functions of money: medium of exchange, store of value, unit of account, standard of deferred payment."},
  {question:"The primary function of management is:",options:{A:"Controlling",B:"Planning",C:"Staffing",D:"Directing"},answer:"B",topic:"Management",difficulty:"easy",explanation:"Planning is the primary function as all other functions follow from it."},
  {question:"Maslow hierarchy places which need at the top?",options:{A:"Safety needs",B:"Social needs",C:"Self-actualization",D:"Esteem needs"},answer:"C",topic:"Motivation",difficulty:"easy",explanation:"Maslow: Physiological, Safety, Social, Esteem, Self-actualization (top)."},
  {question:"SWOT analysis stands for:",options:{A:"Strengths, Weaknesses, Opportunities, Threats",B:"Systems, Work, Objectives, Time",C:"Strategy, Workforce, Organization, Technology",D:"Sales, Wealth, Output, Trends"},answer:"A",topic:"Strategic Management",difficulty:"easy",explanation:"SWOT = Strengths, Weaknesses, Opportunities, Threats."},
  {question:"In perfect competition, a firm is a:",options:{A:"Price maker",B:"Price taker",C:"Price leader",D:"Price discriminator"},answer:"B",topic:"Market Structures",difficulty:"easy",explanation:"In perfect competition, firms have no market power and accept the market price."},
  {question:"Balance of Payments includes:",options:{A:"Current account only",B:"Capital account only",C:"Current account and capital account",D:"Revenue account only"},answer:"C",topic:"International Trade",difficulty:"medium",explanation:"BoP = Current Account + Capital Account."},
  {question:"The concept of Invisible Hand was given by:",options:{A:"J.M. Keynes",B:"Adam Smith",C:"Alfred Marshall",D:"David Ricardo"},answer:"B",topic:"Economics",difficulty:"easy",explanation:"Adam Smith introduced the Invisible Hand in The Wealth of Nations (1776)."},
  {question:"Break-even point is where:",options:{A:"Total revenue exceeds total cost",B:"Total revenue equals total cost",C:"Marginal cost equals marginal revenue",D:"Fixed cost equals variable cost"},answer:"B",topic:"Cost Analysis",difficulty:"easy",explanation:"At break-even, TR = TC, meaning zero economic profit."},
  {question:"Repo rate is the rate at which:",options:{A:"Banks lend to customers",B:"RBI lends to commercial banks against securities",C:"Banks lend to each other",D:"Government borrows from RBI"},answer:"B",topic:"Monetary Policy",difficulty:"medium",explanation:"Repo rate is the rate at which RBI lends short-term money to commercial banks."},
  {question:"Which is NOT a feature of management?",options:{A:"Goal-oriented process",B:"Continuous process",C:"Applicable to non-profit organizations",D:"Rigid and static"},answer:"D",topic:"Management",difficulty:"easy",explanation:"Management is dynamic and flexible, not rigid."},
  {question:"Fiscal policy refers to:",options:{A:"RBI control of money supply",B:"Government taxation and spending decisions",C:"Bank lending rates",D:"Foreign exchange management"},answer:"B",topic:"Fiscal Policy",difficulty:"easy",explanation:"Fiscal policy involves government decisions on taxation and expenditure."}
];

const CMA_F2_ACCOUNTING = [
  {question:"The fundamental accounting equation is:",options:{A:"Assets = Liabilities + Capital",B:"Assets + Liabilities = Capital",C:"Assets = Capital - Liabilities",D:"Liabilities = Assets + Capital"},answer:"A",topic:"Fundamentals",difficulty:"easy",explanation:"Assets = Liabilities + Capital."},
  {question:"Which is NOT a fundamental accounting assumption?",options:{A:"Going Concern",B:"Consistency",C:"Materiality",D:"Accrual"},answer:"C",topic:"Fundamentals",difficulty:"easy",explanation:"Materiality is a qualitative characteristic, not a fundamental assumption."},
  {question:"Depreciation under Straight Line Method:",options:{A:"Increases every year",B:"Decreases every year",C:"Remains constant every year",D:"Varies with production"},answer:"C",topic:"Depreciation",difficulty:"easy",explanation:"Under SLM, equal depreciation is charged each year."},
  {question:"Revenue from sale is recognized at:",options:{A:"Receipt of cash",B:"Delivery of goods",C:"Manufacturing completion",D:"Receipt of order"},answer:"B",topic:"Revenue Recognition",difficulty:"easy",explanation:"Revenue is recognized when risks and rewards transfer at delivery."},
  {question:"Provision for Doubtful Debts is:",options:{A:"An Asset",B:"A Liability",C:"A Contra Asset",D:"An Expense"},answer:"C",topic:"Provisions",difficulty:"medium",explanation:"It is a contra asset deducted from debtors in the Balance Sheet."},
  {question:"Opening stock Rs 20,000, purchases Rs 80,000, closing stock Rs 15,000. COGS is:",options:{A:"Rs 85,000",B:"Rs 95,000",C:"Rs 75,000",D:"Rs 1,00,000"},answer:"A",topic:"Inventory",difficulty:"easy",explanation:"COGS = 20,000 + 80,000 - 15,000 = Rs 85,000."},
  {question:"Bank Reconciliation Statement is prepared by:",options:{A:"Bank",B:"Auditor",C:"Business concern itself",D:"Government"},answer:"C",topic:"BRS",difficulty:"easy",explanation:"BRS is prepared by the business to reconcile cash book with bank statement."},
  {question:"Goodwill is classified as:",options:{A:"Current Asset",B:"Tangible Fixed Asset",C:"Intangible Fixed Asset",D:"Fictitious Asset"},answer:"C",topic:"Intangibles",difficulty:"easy",explanation:"Goodwill has no physical existence but has economic value."},
  {question:"Which method records inventory after every purchase?",options:{A:"Periodic Inventory System",B:"Perpetual Inventory System",C:"LIFO Method",D:"FIFO Method"},answer:"B",topic:"Inventory",difficulty:"medium",explanation:"Perpetual system updates inventory after every transaction."},
  {question:"Interest on Capital in partnership is:",options:{A:"An expense for the firm",B:"An appropriation of profit",C:"A liability",D:"An income for the firm"},answer:"B",topic:"Partnership",difficulty:"medium",explanation:"Interest on capital is an appropriation of profit shown in P&L Appropriation Account."},
  {question:"Which is a Capital Expenditure?",options:{A:"Salary paid",B:"Rent paid",C:"Purchase of machinery",D:"Repair expenses"},answer:"C",topic:"Capital vs Revenue",difficulty:"easy",explanation:"Purchase of machinery provides benefit over multiple years."},
  {question:"A bill of exchange is drawn by:",options:{A:"Drawee",B:"Drawer",C:"Payee",D:"Bank"},answer:"B",topic:"Bills of Exchange",difficulty:"easy",explanation:"The drawer draws the bill of exchange on the drawee."},
  {question:"The balance of Petty Cash Fund is:",options:{A:"An Expense",B:"An Asset",C:"A Liability",D:"Income"},answer:"B",topic:"Cash Book",difficulty:"easy",explanation:"Petty cash fund is a current asset."},
  {question:"Cash received from Mohan Rs 5,000 correctly in Cash Book but not posted to Mohan account. This is:",options:{A:"Error of Omission",B:"Error of Commission",C:"Error of Principle",D:"Error of Posting"},answer:"A",topic:"Errors",difficulty:"medium",explanation:"When an entry is omitted from posting to ledger, it is error of omission."},
  {question:"Profit sharing ratio 3:2. Net profit Rs 50,000. Partner A share is:",options:{A:"Rs 30,000",B:"Rs 20,000",C:"Rs 25,000",D:"Rs 33,333"},answer:"A",topic:"Partnership",difficulty:"easy",explanation:"A share = 50,000 x 3/5 = Rs 30,000."}
];

const CMA_F3_LAWS = [
  {question:"An agreement enforceable by law is a:",options:{A:"Promise",B:"Contract",C:"Proposal",D:"Consideration"},answer:"B",topic:"Indian Contract Act",difficulty:"easy",explanation:"Section 2(h): contract is an agreement enforceable by law."},
  {question:"A minor agreement is:",options:{A:"Void",B:"Voidable",C:"Valid",D:"Unenforceable"},answer:"A",topic:"Indian Contract Act",difficulty:"easy",explanation:"Mohori Bibee v. Dharmodas Ghose: minor agreement is void ab initio."},
  {question:"Caveat Emptor means:",options:{A:"Seller beware",B:"Buyer beware",C:"Both beware",D:"Government beware"},answer:"B",topic:"Sale of Goods Act",difficulty:"easy",explanation:"Caveat Emptor means let the buyer beware."},
  {question:"Free consent means consent not obtained by:",options:{A:"Coercion only",B:"Undue influence only",C:"Fraud, misrepresentation, or mistake",D:"All of the above"},answer:"D",topic:"Indian Contract Act",difficulty:"easy",explanation:"Section 14: free consent is not caused by coercion, undue influence, fraud, misrepresentation, or mistake."},
  {question:"Minimum number of partners in an LLP is:",options:{A:"1",B:"2",C:"3",D:"7"},answer:"B",topic:"LLP Act",difficulty:"easy",explanation:"LLP Act Section 6: minimum 2 designated partners."},
  {question:"Ethics in business means:",options:{A:"Maximizing profit only",B:"Following moral principles in business conduct",C:"Following law only",D:"Ignoring stakeholders"},answer:"B",topic:"Business Ethics",difficulty:"easy",explanation:"Business ethics applies moral principles and values in business decisions."},
  {question:"A quasi contract is:",options:{A:"An actual contract",B:"A contract implied by law",C:"A void contract",D:"A contingent contract"},answer:"B",topic:"Indian Contract Act",difficulty:"medium",explanation:"Quasi contracts are obligations created by law under Sections 68-72."},
  {question:"Maximum number of partners in a partnership firm is:",options:{A:"20",B:"50",C:"100",D:"No limit"},answer:"B",topic:"Partnership",difficulty:"medium",explanation:"Section 464 of Companies Act 2013 limits partners to 50."},
  {question:"Consideration must move at the desire of:",options:{A:"Promisee only",B:"Promisor only",C:"Either promisor or a third party",D:"Government"},answer:"C",topic:"Indian Contract Act",difficulty:"medium",explanation:"Section 2(d): consideration may move from promisee or any other person."},
  {question:"Whistle blowing in corporate governance means:",options:{A:"Starting business operations",B:"Reporting unethical or illegal activities",C:"Marketing a product",D:"Firing employees"},answer:"B",topic:"Corporate Governance",difficulty:"easy",explanation:"Whistle blowing reports illegal or unethical practices within an organization."},
  {question:"Specific performance is a remedy under:",options:{A:"Indian Contract Act",B:"Specific Relief Act",C:"Sale of Goods Act",D:"LLP Act"},answer:"B",topic:"Specific Relief Act",difficulty:"medium",explanation:"Specific performance is an equitable remedy under the Specific Relief Act."},
  {question:"Sale of Goods Act applies to:",options:{A:"Sale of immovable property",B:"Sale of movable goods",C:"Both A and B",D:"Services only"},answer:"B",topic:"Sale of Goods Act",difficulty:"easy",explanation:"Sale of Goods Act 1930 deals only with movable goods."},
  {question:"CSR under Companies Act 2013 applies to companies with net worth exceeding:",options:{A:"Rs 100 crore",B:"Rs 500 crore",C:"Rs 1000 crore",D:"Rs 5000 crore"},answer:"B",topic:"Companies Act",difficulty:"medium",explanation:"Section 135: CSR applies to net worth >= 500 Cr, or turnover >= 1000 Cr, or net profit >= 5 Cr."},
  {question:"A contract with a person of unsound mind is:",options:{A:"Void",B:"Voidable",C:"Valid",D:"Illegal"},answer:"A",topic:"Indian Contract Act",difficulty:"easy",explanation:"Section 12: person of unsound mind cannot contract. Such contracts are void."},
  {question:"A person competent to contract must be:",options:{A:"Minor",B:"Of sound mind and majority age",C:"Disqualified by law",D:"Convict"},answer:"B",topic:"Indian Contract Act",difficulty:"easy",explanation:"Section 11: competent if majority age, sound mind, not disqualified by law."}
];

const CMA_F4_MATHS = [
  {question:"If A:B = 2:3 and B:C = 4:5, then A:B:C is:",options:{A:"8:12:15",B:"2:3:5",C:"4:6:5",D:"8:12:10"},answer:"A",topic:"Ratio",difficulty:"medium",explanation:"A:B = 8:12, B:C = 12:15. So A:B:C = 8:12:15."},
  {question:"Simple interest on Rs 5,000 at 8% p.a. for 3 years is:",options:{A:"Rs 1,000",B:"Rs 1,200",C:"Rs 1,500",D:"Rs 800"},answer:"B",topic:"Simple Interest",difficulty:"easy",explanation:"SI = 5000 x 8 x 3 / 100 = Rs 1,200."},
  {question:"Number of ways to arrange 5 different books on a shelf:",options:{A:"25",B:"60",C:"120",D:"100"},answer:"C",topic:"Permutation",difficulty:"easy",explanation:"5! = 120."},
  {question:"If two dice are thrown, probability of sum 7 is:",options:{A:"1/6",B:"1/12",C:"5/36",D:"7/36"},answer:"A",topic:"Probability",difficulty:"medium",explanation:"Favorable for sum 7: 6 outcomes. Total 36. P = 6/36 = 1/6."},
  {question:"Mean of first 10 natural numbers is:",options:{A:"5",B:"5.5",C:"6",D:"4.5"},answer:"B",topic:"Statistics",difficulty:"easy",explanation:"Mean = 55/10 = 5.5."},
  {question:"Standard deviation is the square root of:",options:{A:"Mean",B:"Variance",C:"Range",D:"Mean Deviation"},answer:"B",topic:"Statistics",difficulty:"easy",explanation:"Standard deviation = square root of Variance."},
  {question:"Present value of Rs 10,000 due 2 years at 10% p.a.:",options:{A:"Rs 8,264",B:"Rs 8,000",C:"Rs 9,000",D:"Rs 8,500"},answer:"A",topic:"Present Value",difficulty:"medium",explanation:"PV = 10000/(1.1)^2 = 10000/1.21 = Rs 8,264."},
  {question:"HCF is 12, LCM is 360, one number is 60. Other number is:",options:{A:"72",B:"48",C:"36",D:"84"},answer:"A",topic:"HCF & LCM",difficulty:"medium",explanation:"Product = HCF x LCM. Other = 12 x 360 / 60 = 72."},
  {question:"Next term in series 2, 6, 12, 20, 30, ... is:",options:{A:"40",B:"42",C:"44",D:"36"},answer:"B",topic:"Number Series",difficulty:"medium",explanation:"Differences: 4, 6, 8, 10, 12. Next = 30 + 12 = 42."},
  {question:"CI on Rs 10,000 at 10% for 2 years compounded annually:",options:{A:"Rs 2,000",B:"Rs 2,100",C:"Rs 2,200",D:"Rs 1,900"},answer:"B",topic:"Compound Interest",difficulty:"medium",explanation:"Amount = 10000(1.1)^2 = 12,100. CI = Rs 2,100."},
  {question:"A and B do work in 12 days. B alone in 30 days. A alone in:",options:{A:"18 days",B:"20 days",C:"15 days",D:"24 days"},answer:"B",topic:"Time & Work",difficulty:"medium",explanation:"A rate = 1/12 - 1/30 = 1/20. A alone = 20 days."},
  {question:"Value of 10C3 is:",options:{A:"30",B:"120",C:"720",D:"210"},answer:"B",topic:"Combination",difficulty:"medium",explanation:"10C3 = 10x9x8 / 3x2x1 = 720/6 = 120."},
  {question:"CP Rs 400, SP Rs 500. Profit percentage is:",options:{A:"20%",B:"25%",C:"30%",D:"15%"},answer:"B",topic:"Profit & Loss",difficulty:"easy",explanation:"Profit = 100. Profit% = 100/400 x 100 = 25%."},
  {question:"Train 100m long at 60 km/h crosses a pole in:",options:{A:"5 seconds",B:"6 seconds",C:"8 seconds",D:"10 seconds"},answer:"B",topic:"Speed & Distance",difficulty:"medium",explanation:"Speed = 50/3 m/s. Time = 100/(50/3) = 6 seconds."},
  {question:"Median of 3, 7, 8, 12, 15 is:",options:{A:"7",B:"8",C:"9",D:"12"},answer:"B",topic:"Statistics",difficulty:"easy",explanation:"Middle value of 5 numbers = 3rd value = 8."}
];

const CMA_I1_FINANCIAL_ACCOUNTING = [
  {question:"AS-6 deals with:",options:{A:"Revenue Recognition",B:"Depreciation Accounting",C:"Inventories",D:"Cash Flow Statements"},answer:"B",topic:"Accounting Standards",difficulty:"easy",explanation:"AS-6 deals with Depreciation Accounting."},
  {question:"Under Ind AS 116, Right-of-Use Asset is recognized by:",options:{A:"Lessor only",B:"Lessee only",C:"Both lessor and lessee",D:"Neither"},answer:"B",topic:"Leases",difficulty:"medium",explanation:"Under Ind AS 116, lessee recognizes Right-of-Use asset for all leases except short-term and low-value."},
  {question:"Contingent liability is:",options:{A:"A definite liability",B:"A possible obligation depending on future events",C:"An asset",D:"A provision"},answer:"B",topic:"Contingencies",difficulty:"easy",explanation:"Contingent liability is a possible obligation from past events confirmed by uncertain future events."},
  {question:"Share capital of a company is shown under:",options:{A:"Current Liabilities",B:"Non-current Liabilities",C:"Shareholders Equity",D:"Reserves"},answer:"C",topic:"Financial Statements",difficulty:"easy",explanation:"Share capital is part of shareholders equity."},
  {question:"Under Ind AS 115 revenue is recognized when:",options:{A:"Cash is received",B:"Control of goods or services transfers to customer",C:"Invoice is raised",D:"Goods are dispatched"},answer:"B",topic:"Revenue Recognition",difficulty:"medium",explanation:"Ind AS 115 uses 5-step model, recognizing revenue when control transfers."},
  {question:"Investment in subsidiary is accounted using:",options:{A:"Cost method",B:"Equity method",C:"Consolidation method",D:"Fair value method"},answer:"C",topic:"Consolidation",difficulty:"medium",explanation:"Ind AS 110 requires consolidated financial statements."},
  {question:"Deferred tax liability arises when:",options:{A:"Taxable income exceeds accounting income",B:"Accounting income exceeds taxable income",C:"Both are equal",D:"There is a loss"},answer:"B",topic:"Taxation",difficulty:"medium",explanation:"DTL arises when accounting income > taxable income."},
  {question:"Cash Flow Statement classifies activities into:",options:{A:"Operating and investing",B:"Operating, investing, and financing",C:"Direct and indirect",D:"Current and non-current"},answer:"B",topic:"Cash Flow",difficulty:"easy",explanation:"Ind AS 7 classifies into operating, investing, and financing."},
  {question:"Treasury shares are:",options:{A:"Newly issued shares",B:"Shares bought back by the company",C:"Shares held by government",D:"Preference shares"},answer:"B",topic:"Share Capital",difficulty:"medium",explanation:"Treasury shares are company own shares that have been repurchased."},
  {question:"Under Ind AS 16 subsequent expenditure on PPE is capitalized when:",options:{A:"It is minor",B:"It is for maintenance only",C:"Future economic benefits are probable and cost can be reliably measured",D:"Always"},answer:"C",topic:"PPE",difficulty:"medium",explanation:"Ind AS 16: capitalize subsequent costs only if future benefits probable and measurable."},
  {question:"Purpose of Cash Flow Statement is to show:",options:{A:"Profit of the company",B:"Sources and application of cash",C:"Financial position",D:"Share capital changes"},answer:"B",topic:"Cash Flow",difficulty:"easy",explanation:"Cash Flow Statement shows how cash was generated and used."},
  {question:"Prior period errors under Ind AS 8 are corrected by:",options:{A:"Current period adjustment",B:"Retrospective restatement",C:"Prospective application",D:"Disclosure only"},answer:"B",topic:"Accounting Policies",difficulty:"hard",explanation:"Prior period errors corrected retrospectively by restating comparative amounts."},
  {question:"FVOCI for debt instruments under Ind AS 109 applies when:",options:{A:"Held for trading",B:"Business model is to collect cash flows and sell",C:"Held to maturity",D:"Available for sale"},answer:"B",topic:"Ind AS 109",difficulty:"hard",explanation:"FVOCI for debt when business model is to collect contractual cash flows AND sell."},
  {question:"AS-3 Cash Flow Statement excludes:",options:{A:"Operating activities",B:"Investing activities",C:"Non-cash transactions",D:"Financing activities"},answer:"C",topic:"Cash Flow",difficulty:"easy",explanation:"AS-3 excludes non-cash transactions from cash flow statement."},
  {question:"In amalgamation in the nature of merger which method is used:",options:{A:"Purchase method",B:"Pooling of interest method",C:"Either method",D:"No specific method"},answer:"B",topic:"Amalgamation",difficulty:"medium",explanation:"Merger uses pooling of interest method. Purchase uses purchase method."}
];

const CMA_I2_LAWS_ETHICS = [
  {question:"A company is incorporated under:",options:{A:"Indian Partnership Act",B:"Companies Act 2013",C:"LLP Act 2008",D:"Indian Contract Act"},answer:"B",topic:"Companies Act",difficulty:"easy",explanation:"Companies are incorporated under Companies Act 2013."},
  {question:"Minimum paid-up capital for private company is:",options:{A:"Rs 1 lakh",B:"Rs 5 lakh",C:"No minimum",D:"Rs 10 lakh"},answer:"C",topic:"Companies Act",difficulty:"medium",explanation:"Companies Amendment Act 2015 removed minimum paid-up capital requirement."},
  {question:"Ethical dilemma means:",options:{A:"Only one option exists",B:"Choice between competing moral principles",C:"Legal requirement",D:"Financial decision"},answer:"B",topic:"Ethics",difficulty:"easy",explanation:"Ethical dilemma requires choosing between competing moral principles."},
  {question:"Anti-competitive agreements are dealt under:",options:{A:"Companies Act 2013",B:"Competition Act 2002",C:"SEBI Act",D:"IRDA Act"},answer:"B",topic:"Competition Law",difficulty:"easy",explanation:"Section 3 of Competition Act 2002 prohibits anti-competitive agreements."},
  {question:"NCLT stands for:",options:{A:"National Company Law Tribunal",B:"New Company Law Terms",C:"National Corporate Legal Tribunal",D:"None"},answer:"A",topic:"Companies Act",difficulty:"easy",explanation:"NCLT = National Company Law Tribunal under Companies Act 2013."},
  {question:"Quorum for general meeting of public company is:",options:{A:"3 members",B:"5 members personally present",C:"10 members",D:"15 members"},answer:"B",topic:"Companies Act",difficulty:"medium",explanation:"Section 103: quorum for public company is 5 members personally present."},
  {question:"Code of Ethics includes:",options:{A:"Integrity only",B:"Objectivity only",C:"Integrity, Objectivity, Professional Competence, Confidentiality, Professional Behavior",D:"None"},answer:"C",topic:"Ethics",difficulty:"easy",explanation:"IESBA Code includes five fundamental principles."},
  {question:"Insider trading is prohibited under:",options:{A:"Companies Act 2013",B:"SEBI Act 1992 and SEBI Prohibition of Insider Trading Regulations",C:"RBI Act",D:"Banking Regulation Act"},answer:"B",topic:"SEBI Regulations",difficulty:"medium",explanation:"Insider trading prohibited under SEBI Regulations 2015."},
  {question:"Doctrine of ultra vires means:",options:{A:"Beyond the powers of the company",B:"Within the powers",C:"Illegal act",D:"Criminal offense"},answer:"A",topic:"Company Law",difficulty:"medium",explanation:"Ultra vires means acts beyond the objects clause of Memorandum."},
  {question:"MCA-21 is:",options:{A:"A section of Companies Act",B:"An e-governance portal of Ministry of Corporate Affairs",C:"An accounting standard",D:"A tax form"},answer:"B",topic:"Corporate Governance",difficulty:"easy",explanation:"MCA-21 is the e-governance portal by Ministry of Corporate Affairs."},
  {question:"DIN stands for:",options:{A:"Director Identification Number",B:"Digital India Network",C:"Domestic Investment Number",D:"None"},answer:"A",topic:"Companies Act",difficulty:"easy",explanation:"DIN = Director Identification Number, unique ID for every director."},
  {question:"Whistle-blower policy is part of:",options:{A:"Financial reporting",B:"Corporate governance",C:"Tax compliance",D:"Cost audit"},answer:"B",topic:"Corporate Governance",difficulty:"easy",explanation:"Whistle-blower mechanism is a key element of corporate governance."},
  {question:"Secretarial audit under Companies Act applies to:",options:{A:"All companies",B:"Listed and public companies with paid-up capital >= Rs 50 Cr",C:"Private companies only",D:"Small companies"},answer:"B",topic:"Companies Act",difficulty:"hard",explanation:"Section 204: applies to listed and public companies with paid-up >= Rs 50 Cr."},
  {question:"Which is a governance principle?",options:{A:"Maximize profit",B:"Accountability and Transparency",C:"Minimize tax",D:"Reduce compliance"},answer:"B",topic:"Corporate Governance",difficulty:"easy",explanation:"Accountability and transparency are core governance principles."},
  {question:"A director can be appointed by:",options:{A:"Board only",B:"Shareholders only",C:"Both Board and Shareholders",D:"Government"},answer:"C",topic:"Corporate Governance",difficulty:"medium",explanation:"Directors appointed by Board (casual vacancy) or shareholders (general meeting)."}
];

const CMA_I3_DIRECT_TAX = [
  {question:"Assessment year for financial year 2025-26 is:",options:{A:"2025-26",B:"2026-27",C:"2024-25",D:"2027-28"},answer:"B",topic:"Income Tax Basics",difficulty:"easy",explanation:"Assessment year follows financial year. FY 2025-26 = AY 2026-27."},
  {question:"Standard deduction under old tax regime is:",options:{A:"Rs 25,000",B:"Rs 50,000",C:"Rs 75,000",D:"Rs 40,000"},answer:"B",topic:"Deductions",difficulty:"easy",explanation:"Standard deduction of Rs 50,000 for salaried employees under old regime."},
  {question:"Section 80C allows maximum deduction of:",options:{A:"Rs 1,00,000",B:"Rs 1,50,000",C:"Rs 2,00,000",D:"Rs 2,50,000"},answer:"B",topic:"Deductions",difficulty:"easy",explanation:"Section 80C maximum deduction Rs 1,50,000 for PPF, ELSS, LIC etc."},
  {question:"TDS stands for:",options:{A:"Total Deducted Sum",B:"Tax Deducted at Source",C:"Tax Due Statement",D:"Tax Deposit Slip"},answer:"B",topic:"TDS",difficulty:"easy",explanation:"TDS = Tax Deducted at Source."},
  {question:"Income from house property is computed under Section:",options:{A:"22",B:"24",C:"22 to 27",D:"28 to 44"},answer:"C",topic:"House Property",difficulty:"medium",explanation:"House property income: Sections 22 to 27."},
  {question:"HUF is taxed as:",options:{A:"Individual",B:"Company",C:"Separate entity",D:"Partnership"},answer:"C",topic:"Assessees",difficulty:"medium",explanation:"HUF is a separate assessable entity."},
  {question:"LTCG on listed equity exceeding Rs 1 lakh taxed at:",options:{A:"10%",B:"15%",C:"20%",D:"30%"},answer:"A",topic:"Capital Gains",difficulty:"medium",explanation:"LTCG on listed equity exceeding Rs 1 lakh taxed at 10% under Section 112A."},
  {question:"Advance tax payable when liability exceeds:",options:{A:"Rs 5,000",B:"Rs 10,000",C:"Rs 15,000",D:"Rs 20,000"},answer:"B",topic:"Advance Tax",difficulty:"easy",explanation:"Advance tax payable when estimated liability exceeds Rs 10,000."},
  {question:"Section 44AB deals with:",options:{A:"Filing of return",B:"Tax audit",C:"Advance tax",D:"Penalty"},answer:"B",topic:"Tax Audit",difficulty:"medium",explanation:"Section 44AB requires tax audit for businesses with turnover exceeding Rs 1 Cr."},
  {question:"PAN is issued under Section:",options:{A:"139A",B:"139B",C:"140A",D:"148"},answer:"A",topic:"Income Tax Basics",difficulty:"easy",explanation:"PAN issued under Section 139A."},
  {question:"Residential status determined under Section:",options:{A:"5",B:"6",C:"7",D:"8"},answer:"B",topic:"Residential Status",difficulty:"medium",explanation:"Section 6 determines residential status."},
  {question:"Business income computed under Section:",options:{A:"28 to 44",B:"22 to 27",C:"15 to 17",D:"45 to 55"},answer:"A",topic:"Business Income",difficulty:"medium",explanation:"Business income: Sections 28 to 44."},
  {question:"Late filing fee under Section 234F is up to:",options:{A:"Rs 1,000",B:"Rs 5,000",C:"Rs 10,000",D:"Rs 50,000"},answer:"C",topic:"Penalties",difficulty:"medium",explanation:"Late filing fee up to Rs 10,000 under Section 234F."},
  {question:"Salary income computed under Section:",options:{A:"15",B:"17",C:"15 to 17",D:"28"},answer:"C",topic:"Salary",difficulty:"medium",explanation:"Salary income: Sections 15 to 17."},
  {question:"Which is NOT a perquisite?",options:{A:"Rent-free accommodation",B:"Salary",C:"Car facility",D:"Stock options"},answer:"B",topic:"Salary",difficulty:"easy",explanation:"Salary is income from employment, not a perquisite."}
];

const CMA_I4_COST_ACCOUNTING = [
  {question:"Prime cost includes:",options:{A:"Direct material + Direct labour + Direct expenses",B:"Direct material + Factory overheads",C:"Direct labour + Indirect expenses",D:"Material cost only"},answer:"A",topic:"Cost Concepts",difficulty:"easy",explanation:"Prime cost = Direct Material + Direct Labour + Direct Expenses."},
  {question:"Fixed cost per unit:",options:{A:"Remains constant",B:"Increases with production",C:"Decreases with production",D:"Varies randomly"},answer:"C",topic:"Cost Behavior",difficulty:"easy",explanation:"Fixed cost per unit decreases as production increases."},
  {question:"EOQ formula is:",options:{A:"Square root of (2DS/H)",B:"D/S x H",C:"2D/S + H",D:"D x H / 2S"},answer:"A",topic:"Inventory Management",difficulty:"medium",explanation:"EOQ = Square root of (2 x Demand x Ordering Cost / Holding Cost)."},
  {question:"In process costing normal loss is:",options:{A:"Charged to costing P&L",B:"Absorbed by good units",C:"Charged to abnormal loss account",D:"Ignored"},answer:"B",topic:"Process Costing",difficulty:"medium",explanation:"Normal loss is absorbed by good units. Abnormal loss charged separately."},
  {question:"Marginal costing considers:",options:{A:"All costs",B:"Only fixed costs",C:"Only variable costs",D:"Only semi-variable costs"},answer:"C",topic:"Marginal Costing",difficulty:"easy",explanation:"Marginal costing considers only variable costs."},
  {question:"Contribution margin is:",options:{A:"Sales - Total Cost",B:"Sales - Variable Cost",C:"Sales - Fixed Cost",D:"Profit + Fixed Cost"},answer:"B",topic:"Marginal Costing",difficulty:"easy",explanation:"Contribution = Sales - Variable Cost."},
  {question:"Over-absorption of overheads means:",options:{A:"Actual overheads > Absorbed overheads",B:"Absorbed overheads > Actual overheads",C:"Both are equal",D:"No overheads charged"},answer:"B",topic:"Overheads",difficulty:"medium",explanation:"Over-absorption when absorbed overheads exceed actual."},
  {question:"Job costing is suitable for:",options:{A:"Mass production",B:"Unique specific orders",C:"Continuous process",D:"Standardized products"},answer:"B",topic:"Job Costing",difficulty:"easy",explanation:"Job costing used where each job is unique."},
  {question:"Standard cost is:",options:{A:"Historical cost",B:"Predetermined cost",C:"Actual cost",D:"Estimated cost"},answer:"B",topic:"Standard Costing",difficulty:"easy",explanation:"Standard cost is predetermined before production."},
  {question:"Material Usage Variance = (SQ - AQ) x:",options:{A:"Actual Price",B:"Standard Price",C:"Average Price",D:"Market Price"},answer:"B",topic:"Variance Analysis",difficulty:"medium",explanation:"MUV = (SQ - AQ) x Standard Price."},
  {question:"Cost centre is:",options:{A:"A product line",B:"A location, person, or item for which costs are accumulated",C:"A profit unit",D:"A revenue centre"},answer:"B",topic:"Cost Concepts",difficulty:"easy",explanation:"Cost centre is smallest unit for which costs are collected."},
  {question:"Batch costing is used in:",options:{A:"Construction industry",B:"Pharmaceutical and garment manufacturing",C:"Transport industry",D:"Mining industry"},answer:"B",topic:"Batch Costing",difficulty:"easy",explanation:"Batch costing used where production is in batches."},
  {question:"Operating costing applies to:",options:{A:"Manufacturing",B:"Service industries like transport and hospitals",C:"Job work",D:"Construction"},answer:"B",topic:"Operating Costing",difficulty:"easy",explanation:"Operating costing used in service industries."},
  {question:"Budgeted fixed overhead minus actual fixed overhead is:",options:{A:"Volume variance",B:"Expenditure variance",C:"Efficiency variance",D:"Capacity variance"},answer:"B",topic:"Variance Analysis",difficulty:"hard",explanation:"Fixed OH expenditure variance = Budgeted - Actual."},
  {question:"Cost audit conducted under Section:",options:{A:"148 of Companies Act 2013",B:"139 of Companies Act 2013",C:"143 of Companies Act 2013",D:"141 of Companies Act 2013"},answer:"A",topic:"Cost Audit",difficulty:"medium",explanation:"Section 148 provides for cost records and cost audit."}
];

const CMA_I5_OPERATIONS_MGMT = [
  {question:"BEP in units is:",options:{A:"Fixed Cost / Contribution per unit",B:"Fixed Cost / Selling Price",C:"Variable Cost / Selling Price",D:"Total Cost / Units"},answer:"A",topic:"Break-Even",difficulty:"easy",explanation:"BEP = FC / (SP - VC per unit)."},
  {question:"PERT stands for:",options:{A:"Project Evaluation and Review Technique",B:"Program Evaluation and Review Technique",C:"Product Evaluation and Review Technique",D:"Performance Evaluation and Review Technique"},answer:"B",topic:"Network Analysis",difficulty:"easy",explanation:"PERT = Program Evaluation and Review Technique."},
  {question:"In LPP the objective function represents:",options:{A:"Constraints",B:"Goal to be maximized or minimized",C:"Decision variables",D:"Feasible region"},answer:"B",topic:"LPP",difficulty:"easy",explanation:"Objective function represents the goal subject to constraints."},
  {question:"EOQ minimizes:",options:{A:"Purchase cost",B:"Total inventory cost (ordering + holding)",C:"Stock-out cost",D:"Production cost"},answer:"B",topic:"Inventory",difficulty:"easy",explanation:"EOQ minimizes ordering cost + holding cost."},
  {question:"In PERT expected time is:",options:{A:"(Optimistic + Pessimistic) / 2",B:"(O + 4M + P) / 6",C:"(O + M + P) / 3",D:"(O + 6M + P) / 6"},answer:"B",topic:"PERT",difficulty:"medium",explanation:"Expected time = (to + 4tm + tp) / 6."},
  {question:"TQM focuses on:",options:{A:"Inspection only",B:"Continuous improvement and customer satisfaction",C:"Cost reduction only",D:"Production speed"},answer:"B",topic:"TQM",difficulty:"easy",explanation:"TQM focuses on continuous improvement and customer satisfaction."},
  {question:"Critical path is:",options:{A:"Shortest path",B:"Longest path determining project duration",C:"Any path",D:"Path with most activities"},answer:"B",topic:"CPM",difficulty:"easy",explanation:"Critical path is the longest path through the network."},
  {question:"Six Sigma aims for:",options:{A:"3.4 defects per million opportunities",B:"34 per million",C:"340 per million",D:"Zero defects"},answer:"A",topic:"Six Sigma",difficulty:"medium",explanation:"Six Sigma targets 3.4 DPMO."},
  {question:"JIT inventory aims to:",options:{A:"Maximize inventory",B:"Minimize inventory by receiving goods when needed",C:"Increase safety stock",D:"Maintain buffer stock"},answer:"B",topic:"JIT",difficulty:"easy",explanation:"JIT minimizes inventory by receiving materials just when needed."},
  {question:"Gantt chart is used for:",options:{A:"Quality control",B:"Production scheduling and progress tracking",C:"Cost analysis",D:"Financial reporting"},answer:"B",topic:"Scheduling",difficulty:"easy",explanation:"Gantt charts track project progress."},
  {question:"Reorder Point = Lead Time Demand +:",options:{A:"Safety Stock",B:"EOQ",C:"Maximum Stock",D:"Average Stock"},answer:"A",topic:"Inventory",difficulty:"medium",explanation:"ROP = Lead Time Demand + Safety Stock."},
  {question:"Kaizen means:",options:{A:"Drastic change",B:"Continuous improvement",C:"Quality control",D:"Cost reduction"},answer:"B",topic:"Lean Management",difficulty:"easy",explanation:"Kaizen = continuous improvement philosophy."},
  {question:"A bottleneck is:",options:{A:"Fastest process",B:"Process that limits overall capacity",C:"Cheapest process",D:"First process"},answer:"B",topic:"Operations",difficulty:"easy",explanation:"Bottleneck limits overall output capacity."},
  {question:"Capacity utilization rate is:",options:{A:"Actual output / Maximum capacity x 100",B:"Maximum capacity / Actual output x 100",C:"Fixed cost / Variable cost x 100",D:"Revenue / Cost x 100"},answer:"A",topic:"Capacity Planning",difficulty:"easy",explanation:"Capacity utilization = Actual / Maximum x 100."},
  {question:"In LPP feasible region is:",options:{A:"Outside the constraints",B:"Area satisfying all constraints",C:"Optimal point",D:"Objective function line"},answer:"B",topic:"LPP",difficulty:"medium",explanation:"Feasible region satisfies all constraints simultaneously."}
];

const CMA_I6_COST_MGMT_FINANCIAL = [
  {question:"CAPM formula is:",options:{A:"E(R) = Rf + Beta(Rm - Rf)",B:"E(R) = Rf + Rm",C:"E(R) = Rm - Rf",D:"E(R) = Beta x Rf"},answer:"A",topic:"CAPM",difficulty:"medium",explanation:"CAPM: Expected Return = Rf + Beta x (Rm - Rf)."},
  {question:"WACC considers:",options:{A:"Only equity cost",B:"Only debt cost",C:"Weighted average of all capital sources",D:"Only retained earnings"},answer:"C",topic:"WACC",difficulty:"easy",explanation:"WACC = weighted average of cost of equity, debt, and other sources."},
  {question:"NPV is:",options:{A:"Sum of all cash inflows",B:"PV of cash inflows minus PV of cash outflows",C:"Total investment",D:"Annual cash flow"},answer:"B",topic:"Capital Budgeting",difficulty:"easy",explanation:"NPV = PV of Inflows - PV of Outflows."},
  {question:"Operating leverage measures:",options:{A:"Financial risk",B:"Sensitivity of EBIT to changes in sales",C:"Debt ratio",D:"Liquidity"},answer:"B",topic:"Leverage",difficulty:"medium",explanation:"DOL = % change in EBIT / % change in Sales."},
  {question:"IRR is the rate at which:",options:{A:"NPV is maximum",B:"NPV is zero",C:"Payback is minimum",D:"Profit is maximum"},answer:"B",topic:"Capital Budgeting",difficulty:"medium",explanation:"IRR makes NPV equal to zero."},
  {question:"Current ratio is:",options:{A:"Current Assets / Current Liabilities",B:"Total Assets / Total Liabilities",C:"Cash / Current Liabilities",D:"Inventory / Current Liabilities"},answer:"A",topic:"Ratio Analysis",difficulty:"easy",explanation:"Current Ratio = CA / CL. Ideal is 2:1."},
  {question:"D/E ratio of 2:1 means:",options:{A:"Debt is twice the equity",B:"Equity is twice the debt",C:"Both are equal",D:"No debt"},answer:"A",topic:"Ratio Analysis",difficulty:"easy",explanation:"D/E 2:1 means Rs 2 debt for every Rs 1 equity."},
  {question:"Payback period ignores:",options:{A:"Initial investment",B:"Cash flows after payback period",C:"Annual cash flows",D:"Cash inflows"},answer:"B",topic:"Capital Budgeting",difficulty:"easy",explanation:"Payback ignores cash flows after the payback period."},
  {question:"Financial leverage arises due to:",options:{A:"Variable costs",B:"Fixed financial costs (interest on debt)",C:"Fixed operating costs",D:"Sales revenue"},answer:"B",topic:"Leverage",difficulty:"medium",explanation:"Financial leverage from debt with fixed interest."},
  {question:"Quick ratio is also known as:",options:{A:"Current ratio",B:"Acid test ratio",C:"Debt ratio",D:"Proprietary ratio"},answer:"B",topic:"Ratio Analysis",difficulty:"easy",explanation:"Quick Ratio = Acid Test Ratio."},
  {question:"Working capital management deals with:",options:{A:"Long-term investments",B:"Current assets and current liabilities",C:"Equity shares",D:"Fixed assets"},answer:"B",topic:"Working Capital",difficulty:"easy",explanation:"Working capital = current assets and liabilities."},
  {question:"Beta measures:",options:{A:"Total risk",B:"Systematic market risk",C:"Unsystematic risk",D:"Credit risk"},answer:"B",topic:"Portfolio Management",difficulty:"medium",explanation:"Beta measures systematic risk."},
  {question:"Inventory turnover ratio is:",options:{A:"COGS / Average Inventory",B:"Sales / Inventory",C:"Purchases / Closing Stock",D:"Gross Profit / Inventory"},answer:"A",topic:"Ratio Analysis",difficulty:"easy",explanation:"Inventory Turnover = COGS / Average Inventory."},
  {question:"Sinking fund is:",options:{A:"Fund for daily expenses",B:"Fund set aside to repay debt or replace assets",C:"Emergency fund",D:"Working capital fund"},answer:"B",topic:"Financial Management",difficulty:"easy",explanation:"Sinking fund set aside periodically for debt repayment or asset replacement."},
  {question:"MIRR assumes reinvestment at:",options:{A:"IRR rate",B:"Cost of capital",C:"Risk-free rate",D:"Zero rate"},answer:"B",topic:"Capital Budgeting",difficulty:"hard",explanation:"MIRR assumes reinvestment at cost of capital, not IRR."}
];

const CMA_I7_INDIRECT_TAX = [
  {question:"GST stands for:",options:{A:"General Sales Tax",B:"Goods and Services Tax",C:"Government Sales Tax",D:"Goods Supply Tax"},answer:"B",topic:"GST Basics",difficulty:"easy",explanation:"GST = Goods and Services Tax, implemented July 1, 2017."},
  {question:"CGST and SGST apply on:",options:{A:"Inter-state supplies",B:"Intra-state supplies",C:"Imports",D:"Exports"},answer:"B",topic:"GST",difficulty:"easy",explanation:"CGST + SGST for intra-state. IGST for inter-state."},
  {question:"GST registration threshold is:",options:{A:"Rs 10 lakh",B:"Rs 20 lakh",C:"Rs 40 lakh",D:"Rs 50 lakh"},answer:"B",topic:"GST",difficulty:"easy",explanation:"Registration threshold Rs 20 lakh for goods."},
  {question:"Input Tax Credit means:",options:{A:"Credit for tax on outputs",B:"Credit for tax on inputs used for business",C:"Refund of tax",D:"Exemption from tax"},answer:"B",topic:"GST",difficulty:"easy",explanation:"ITC allows reducing tax liability by tax paid on inputs."},
  {question:"HSN code stands for:",options:{A:"Harmonized System of Nomenclature",B:"High Standard Numbering",C:"Harmonized Sales Number",D:"None"},answer:"A",topic:"GST",difficulty:"easy",explanation:"HSN = Harmonized System of Nomenclature."},
  {question:"E-way bill required for goods exceeding:",options:{A:"Rs 25,000",B:"Rs 50,000",C:"Rs 1,00,000",D:"Rs 5,00,000"},answer:"B",topic:"GST",difficulty:"medium",explanation:"E-way bill required for movement exceeding Rs 50,000."},
  {question:"GSTR-1 is for:",options:{A:"Input tax credit",B:"Outward supplies",C:"Annual return",D:"Payment of tax"},answer:"B",topic:"GST Returns",difficulty:"easy",explanation:"GSTR-1 is return for outward supplies."},
  {question:"Maximum GST rate slab is:",options:{A:"18%",B:"28%",C:"30%",D:"40%"},answer:"B",topic:"GST",difficulty:"easy",explanation:"GST slabs: 0%, 5%, 12%, 18%, 28%."},
  {question:"Composition scheme available for turnover up to:",options:{A:"Rs 50 lakh",B:"Rs 75 lakh",C:"Rs 1.5 crore",D:"Rs 2 crore"},answer:"C",topic:"GST",difficulty:"medium",explanation:"Composition scheme for turnover up to Rs 1.5 crore."},
  {question:"Customs duty levied on:",options:{A:"Manufacturing",B:"Import and export of goods",C:"Sale of goods",D:"Services"},answer:"B",topic:"Customs",difficulty:"easy",explanation:"Customs duty on import and export of goods."},
  {question:"GST compensation cess on:",options:{A:"All goods",B:"Luxury and demerit goods",C:"Essential goods",D:"Services only"},answer:"B",topic:"GST",difficulty:"medium",explanation:"Compensation cess on luxury and demerit goods."},
  {question:"GST Council chaired by:",options:{A:"Prime Minister",B:"Finance Minister",C:"President",D:"RBI Governor"},answer:"B",topic:"GST",difficulty:"easy",explanation:"GST Council chaired by Union Finance Minister."},
  {question:"Reverse charge means:",options:{A:"Supplier pays tax",B:"Recipient pays tax instead of supplier",C:"Government pays tax",D:"No tax paid"},answer:"B",topic:"GST",difficulty:"easy",explanation:"Under reverse charge recipient pays GST."},
  {question:"Interest on delayed GST payment is:",options:{A:"10% p.a.",B:"18% p.a.",C:"24% p.a.",D:"15% p.a."},answer:"B",topic:"GST",difficulty:"medium",explanation:"Interest on delayed GST = 18% per annum."},
  {question:"GST implemented in India on:",options:{A:"January 1, 2017",B:"July 1, 2017",C:"April 1, 2017",D:"October 1, 2017"},answer:"B",topic:"GST",difficulty:"easy",explanation:"GST implemented on July 1, 2017."}
];

const CMA_I8_COMPANY_ACCOUNTS_AUDIT = [
  {question:"As per Schedule III balance sheet is prepared in:",options:{A:"Horizontal format only",B:"Vertical format only",C:"Either horizontal or vertical",D:"Narrative format"},answer:"B",topic:"Financial Statements",difficulty:"medium",explanation:"Schedule III requires vertical format for Balance Sheet."},
  {question:"Statutory audit conducted by:",options:{A:"Internal auditor",B:"Cost auditor",C:"Statutory auditor under Section 139",D:"Government auditor"},answer:"C",topic:"Audit",difficulty:"easy",explanation:"Statutory audit by auditor appointed under Section 139."},
  {question:"Dividend can be paid from:",options:{A:"Capital",B:"Profit (current or accumulated)",C:"Reserves only",D:"Borrowings"},answer:"B",topic:"Dividend",difficulty:"easy",explanation:"Section 123: dividend from current profits or accumulated profits."},
  {question:"Internal audit mandatory under Section 138 for:",options:{A:"All companies",B:"Listed and certain classes of companies",C:"Only private companies",D:"Government companies only"},answer:"B",topic:"Audit",difficulty:"medium",explanation:"Section 138: internal audit for listed and certain prescribed classes."},
  {question:"Auditor report addressed to:",options:{A:"Board of Directors",B:"Shareholders",C:"Management",D:"Government"},answer:"B",topic:"Audit",difficulty:"easy",explanation:"Statutory auditor report addressed to members/shareholders."},
  {question:"CARO stands for:",options:{A:"Companies Auditors Report Order",B:"Corporate Audit Report Order",C:"Companies Annual Report Order",D:"None"},answer:"A",topic:"Audit",difficulty:"easy",explanation:"CARO = Companies (Auditors Report) Order."},
  {question:"OPC can have:",options:{A:"One director and one member",B:"Minimum 2 directors",C:"Minimum 3 directors",D:"Minimum 7 members"},answer:"A",topic:"Companies Act",difficulty:"easy",explanation:"OPC has one member and minimum one director."},
  {question:"Bonus shares issued from:",options:{A:"Cash",B:"Free reserves or surplus",C:"Borrowings",D:"Share premium only"},answer:"B",topic:"Share Capital",difficulty:"medium",explanation:"Bonus shares from accumulated profits/reserves."},
  {question:"Companies Act 2013 replaced:",options:{A:"Companies Act 1913",B:"Companies Act 1956",C:"Companies Act 2002",D:"LLP Act 2008"},answer:"B",topic:"Companies Act",difficulty:"easy",explanation:"Companies Act 2013 replaced Companies Act 1956."},
  {question:"Qualified opinion means:",options:{A:"Clean report",B:"Except for certain matters, statements are fairly presented",C:"Adverse opinion",D:"Disclaimer"},answer:"B",topic:"Audit",difficulty:"medium",explanation:"Qualified opinion: except for certain matters, fair presentation."},
  {question:"Right shares offered first to:",options:{A:"New investors",B:"Existing shareholders",C:"Government",D:"Employees"},answer:"B",topic:"Share Capital",difficulty:"easy",explanation:"Right shares offered first to existing shareholders."},
  {question:"Prospectus filed with:",options:{A:"RBI",B:"SEBI",C:"Registrar of Companies",D:"Stock Exchange"},answer:"C",topic:"Companies Act",difficulty:"medium",explanation:"Prospectus filed with ROC before issuance."},
  {question:"Private company maximum members:",options:{A:"200",B:"100",C:"50",D:"No limit"},answer:"A",topic:"Companies Act",difficulty:"easy",explanation:"Section 2(68): private company limits members to 200."},
  {question:"Secret reserves created by:",options:{A:"Overvaluing assets",B:"Undervaluing assets or overvaluing liabilities",C:"Not recording transactions",D:"Depreciation"},answer:"B",topic:"Reserves",difficulty:"medium",explanation:"Secret reserves from undervaluing assets or overvaluing liabilities."},
  {question:"Book profit under Section 115JB (MAT) is:",options:{A:"Net profit as per P&L",B:"Net profit adjusted as per Schedule III",C:"Gross profit",D:"Cash profit"},answer:"B",topic:"Taxation",difficulty:"hard",explanation:"Book profit under MAT = Net profit adjusted as per Schedule III."}
];

const CMA_F1_FINAL_CORPORATE_LAWS = [
  {question:"Section 241 deals with:",options:{A:"Oppression and mismanagement",B:"Winding up",C:"Audit",D:"Dividend"},answer:"A",topic:"Companies Act",difficulty:"medium",explanation:"Section 241: application to NCLT for oppression and mismanagement."},
  {question:"NCLT can order winding up under Section:",options:{A:"271",B:"272",C:"273",D:"270"},answer:"A",topic:"Winding Up",difficulty:"medium",explanation:"Section 271 provides grounds for winding up by NCLT."},
  {question:"SEBI established in:",options:{A:"1988",B:"1992",C:"1996",D:"2000"},answer:"B",topic:"SEBI",difficulty:"easy",explanation:"SEBI established 1988, statutory powers 1992."},
  {question:"IBC enacted in:",options:{A:"2015",B:"2016",C:"2017",D:"2018"},answer:"B",topic:"IBC",difficulty:"easy",explanation:"IBC enacted in 2016."},
  {question:"IBC resolution process within:",options:{A:"90 days",B:"180 days",C:"270 days",D:"365 days"},answer:"B",topic:"IBC",difficulty:"medium",explanation:"CIRP within 180 days (extendable to 270)."},
  {question:"FEMA replaced:",options:{A:"Companies Act",B:"FERA",C:"SEBI Act",D:"Banking Regulation Act"},answer:"B",topic:"FEMA",difficulty:"easy",explanation:"FEMA 1999 replaced FERA 1973."},
  {question:"Benami transaction means:",options:{A:"Transaction in real name",B:"Property held by one but paid by another",C:"Legal transaction",D:"Government transaction"},answer:"B",topic:"Benami Act",difficulty:"medium",explanation:"Benami: property held by benamidar for real owner."},
  {question:"RERA stands for:",options:{A:"Real Estate Regulatory Authority",B:"Reserve Exchange Rate Authority",C:"Real Estate Registration Act",D:"None"},answer:"A",topic:"RERA",difficulty:"easy",explanation:"RERA = Real Estate (Regulation and Development) Act 2016."},
  {question:"Arbitration governed by:",options:{A:"Companies Act 2013",B:"Arbitration and Conciliation Act 1996",C:"Civil Procedure Code",D:"Indian Contract Act"},answer:"B",topic:"Arbitration",difficulty:"easy",explanation:"Arbitration governed by Arbitration and Conciliation Act 1996."},
  {question:"CCI established under:",options:{A:"Companies Act 2013",B:"Competition Act 2002",C:"SEBI Act 1992",D:"MRTP Act"},answer:"B",topic:"Competition Law",difficulty:"easy",explanation:"CCI established under Competition Act 2002."},
  {question:"Data protection governed by:",options:{A:"IT Act 2000 only",B:"Digital Personal Data Protection Act 2023",C:"Companies Act 2013",D:"SEBI Act"},answer:"B",topic:"Data Protection",difficulty:"easy",explanation:"DPDP Act 2023 governs data protection in India."},
  {question:"Under IBC who can initiate insolvency?",options:{A:"Only debtor",B:"Financial creditor, operational creditor, or debtor",C:"Only government",D:"Only court"},answer:"B",topic:"IBC",difficulty:"medium",explanation:"Insolvency by financial creditors, operational creditors, or debtor."},
  {question:"PMLA enacted in:",options:{A:"2000",B:"2002",C:"2005",D:"2010"},answer:"B",topic:"PMLA",difficulty:"medium",explanation:"PMLA enacted 2002 to prevent money laundering."},
  {question:"Maximum directors in public company:",options:{A:"10",B:"12",C:"15",D:"No maximum"},answer:"D",topic:"Companies Act",difficulty:"easy",explanation:"No maximum limit on directors in public company."},
  {question:"Anti-defection law in:",options:{A:"Companies Act",B:"Constitution Tenth Schedule",C:"SEBI Act",D:"Penal Code"},answer:"B",topic:"Constitutional Law",difficulty:"medium",explanation:"Anti-defection law in Tenth Schedule of Constitution."}
];

const CMA_F2_STRATEGIC_FINANCIAL_MGMT = [
  {question:"M&M Proposition I without taxes states:",options:{A:"Capital structure affects firm value",B:"Capital structure irrelevant to firm value",C:"Debt always increases value",D:"Equity always cheaper"},answer:"B",topic:"Capital Structure",difficulty:"medium",explanation:"M&M Prop I: without taxes, firm value independent of capital structure."},
  {question:"Black-Scholes model prices:",options:{A:"Bonds",B:"Options",C:"Futures",D:"Equity shares"},answer:"B",topic:"Derivatives",difficulty:"medium",explanation:"Black-Scholes prices European options."},
  {question:"Duration of bond measures:",options:{A:"Credit risk",B:"Interest rate sensitivity",C:"Default risk",D:"Liquidity risk"},answer:"B",topic:"Fixed Income",difficulty:"medium",explanation:"Duration measures bond price sensitivity to interest rate changes."},
  {question:"Arbitrage is:",options:{A:"Speculation",B:"Risk-free profit from price differences",C:"Hedging",D:"Investment"},answer:"B",topic:"Financial Markets",difficulty:"easy",explanation:"Arbitrage: simultaneous buy and sell for risk-free profit."},
  {question:"Currency risk hedged using:",options:{A:"Only forwards",B:"Forwards, futures, options, and swaps",C:"Only options",D:"Only futures"},answer:"B",topic:"Forex Management",difficulty:"easy",explanation:"Currency risk hedged with forwards, futures, options, swaps."},
  {question:"EVA is:",options:{A:"Net profit after tax",B:"NOPAT minus (Cost of Capital x Capital Employed)",C:"Revenue minus Cost",D:"EBITDA"},answer:"B",topic:"Value Based Management",difficulty:"hard",explanation:"EVA = NOPAT - (WACC x Capital Employed)."},
  {question:"Interest Rate Swap involves:",options:{A:"Exchange of principal",B:"Exchange of interest streams (fixed for floating)",C:"Exchange of currencies",D:"Exchange of shares"},answer:"B",topic:"Derivatives",difficulty:"medium",explanation:"IRS exchanges fixed and floating interest payments."},
  {question:"DDM values share based on:",options:{A:"Book value",B:"Present value of future dividends",C:"Market price",D:"Face value"},answer:"B",topic:"Valuation",difficulty:"easy",explanation:"DDM = present value of all future expected dividends."},
  {question:"Venture capital is:",options:{A:"Debt financing",B:"Equity for early-stage high-growth companies",C:"Government grants",D:"Bank loans"},answer:"B",topic:"Corporate Finance",difficulty:"easy",explanation:"VC = equity investment in startups with high growth potential."},
  {question:"PE ratio is:",options:{A:"EPS / Market price",B:"Market price per share / EPS",C:"Book value / Market value",D:"Dividend / Market price"},answer:"B",topic:"Valuation",difficulty:"easy",explanation:"P/E = Market Price / EPS."},
  {question:"Hedging with futures involves:",options:{A:"Buying underlying asset",B:"Taking opposite position to offset price risk",C:"Selling all assets",D:"Ignoring risk"},answer:"B",topic:"Derivatives",difficulty:"easy",explanation:"Hedging: opposite position in futures to offset price risk."},
  {question:"Debenture redemption reserve under:",options:{A:"SEBI guidelines",B:"Companies Act Section 71",C:"RBI guidelines",D:"Stock exchange rules"},answer:"B",topic:"Debentures",difficulty:"medium",explanation:"Section 71 requires DRR for debenture redemption."},
  {question:"If USD/INR = 83.50 it means:",options:{A:"1 USD = Rs 83.50",B:"1 INR = $83.50",C:"83.50 USD = 1 INR",D:"None"},answer:"A",topic:"Forex",difficulty:"easy",explanation:"USD/INR 83.50 = 1 US Dollar = 83.50 Indian Rupees."},
  {question:"Monte Carlo simulation used for:",options:{A:"Exact calculations",B:"Estimating probability distributions of outcomes",C:"Tax computation",D:"Audit sampling"},answer:"B",topic:"Risk Management",difficulty:"hard",explanation:"Monte Carlo uses random sampling to model probability distributions."},
  {question:"RAROC is:",options:{A:"Revenue / Capital",B:"Risk-adjusted return / Economic capital",C:"Profit / Investment",D:"Dividend / Share price"},answer:"B",topic:"Risk Management",difficulty:"hard",explanation:"RAROC = Expected Risk-Adjusted Return / Economic Capital."}
];

const CMA_F3_STRATEGIC_COST_MGMT = [
  {question:"Activity-Based Costing allocates overheads based on:",options:{A:"Direct labour hours",B:"Activities and cost drivers",C:"Machine hours",D:"Production units"},answer:"B",topic:"ABC",difficulty:"easy",explanation:"ABC assigns overheads based on activities and cost drivers."},
  {question:"Target costing starts with:",options:{A:"Cost plus profit",B:"Market price minus desired profit",C:"Historical cost",D:"Standard cost"},answer:"B",topic:"Target Costing",difficulty:"easy",explanation:"Target Cost = Market Price - Desired Profit."},
  {question:"Life Cycle Costing considers:",options:{A:"Only manufacturing cost",B:"Total cost from concept to disposal",C:"Only operating cost",D:"Only design cost"},answer:"B",topic:"Life Cycle Costing",difficulty:"easy",explanation:"Life cycle costing considers all costs from R&D to disposal."},
  {question:"Value analysis aims to:",options:{A:"Reduce quality",B:"Increase value by improving function relative to cost",C:"Increase cost",D:"Eliminate products"},answer:"B",topic:"Value Analysis",difficulty:"easy",explanation:"Value analysis increases value by improving function or reducing cost."},
  {question:"Kaizen costing focuses on:",options:{A:"Drastic cost reduction",B:"Continuous small cost reductions",C:"Price increase",D:"Quality reduction"},answer:"B",topic:"Kaizen Costing",difficulty:"easy",explanation:"Kaizen costing = continuous incremental cost reductions."},
  {question:"Balanced Scorecard perspectives:",options:{A:"3",B:"4",C:"5",D:"6"},answer:"B",topic:"Balanced Scorecard",difficulty:"easy",explanation:"BSC: Financial, Customer, Internal Process, Learning & Growth."},
  {question:"Cost of Quality includes:",options:{A:"Only prevention costs",B:"Prevention, appraisal, internal failure, external failure",C:"Only failure costs",D:"Only appraisal costs"},answer:"B",topic:"Quality Costing",difficulty:"easy",explanation:"COQ = Prevention + Appraisal + Internal Failure + External Failure."},
  {question:"Relevant costing considers:",options:{A:"All costs",B:"Only future costs differing between alternatives",C:"Only historical costs",D:"Sunk costs"},answer:"B",topic:"Decision Making",difficulty:"easy",explanation:"Relevant costs are future costs that differ between alternatives."},
  {question:"Benchmarking means:",options:{A:"Setting budgets",B:"Comparing with best practices in industry",C:"Cost estimation",D:"Variance analysis"},answer:"B",topic:"Benchmarking",difficulty:"easy",explanation:"Benchmarking compares performance with best practices."},
  {question:"Throughput accounting measures:",options:{A:"Total cost",B:"Rate of generating money through sales minus material cost",C:"Net profit",D:"Gross margin"},answer:"B",topic:"Theory of Constraints",difficulty:"medium",explanation:"Throughput = Sales - Material Cost."},
  {question:"Constraint accounting focuses on:",options:{A:"Reducing all costs equally",B:"Managing the bottleneck resource",C:"Maximizing all processes",D:"Minimizing labour cost"},answer:"B",topic:"TOC",difficulty:"medium",explanation:"TOC focuses on managing the bottleneck."},
  {question:"Customer Profitability Analysis helps in:",options:{A:"Reducing production",B:"Identifying profitable and unprofitable customers",C:"Setting prices",D:"Hiring employees"},answer:"B",topic:"Customer Analysis",difficulty:"easy",explanation:"CPA identifies profitable and unprofitable customers."},
  {question:"Environmental costing considers:",options:{A:"Only financial costs",B:"Costs of environmental damage and prevention",C:"Only production costs",D:"Only marketing costs"},answer:"B",topic:"Environmental Costing",difficulty:"easy",explanation:"Environmental costing includes prevention, detection, and correction costs."},
  {question:"Backflush costing used in:",options:{A:"Traditional manufacturing",B:"JIT manufacturing",C:"Service industries",D:"Construction"},answer:"B",topic:"JIT Costing",difficulty:"medium",explanation:"Backflush costing delays recording until production complete, used in JIT."},
  {question:"Transfer pricing ideally set at:",options:{A:"Market price",B:"Cost plus markup",C:"Negotiated price",D:"Any price management decides"},answer:"A",topic:"Transfer Pricing",difficulty:"medium",explanation:"Market-based transfer pricing promotes fairness and reflects true value."}
];

const CMA_F4_DIRECT_TAX_INTERNATIONAL = [
  {question:"DTAA is signed between:",options:{A:"Two companies",B:"Two countries",C:"Company and government",D:"Two states"},answer:"B",topic:"DTAA",difficulty:"easy",explanation:"DTAA = treaty between two countries to avoid double taxation."},
  {question:"Transfer pricing under Section 92 uses:",options:{A:"Market price only",B:"Arm length price",C:"Cost plus 10%",D:"Government price"},answer:"B",topic:"Transfer Pricing",difficulty:"medium",explanation:"Section 92: international transactions at arm length price."},
  {question:"BEPS initiative by:",options:{A:"World Bank",B:"OECD/G20",C:"WTO",D:"IMF"},answer:"B",topic:"BEPS",difficulty:"medium",explanation:"BEPS by OECD/G20 to combat tax avoidance."},
  {question:"Equalization levy on:",options:{A:"All imports",B:"Online advertising by non-resident e-commerce companies",C:"Export services",D:"Domestic services"},answer:"B",topic:"Equalization Levy",difficulty:"medium",explanation:"Equalization levy 2% on online advertising by non-residents."},
  {question:"POEM determines:",options:{A:"Place of registration",B:"Residential status of company",C:"Place of manufacturing",D:"Place of listing"},answer:"B",topic:"International Tax",difficulty:"hard",explanation:"POEM determines company residence based on key management decisions location."},
  {question:"APA provides:",options:{A:"Penalty",B:"Certainty on transfer pricing methodology for future",C:"Tax exemption",D:"Automatic approval"},answer:"B",topic:"Transfer Pricing",difficulty:"hard",explanation:"APA = agreement on transfer pricing methodology for future transactions."},
  {question:"TRC required for:",options:{A:"Domestic transactions",B:"Claiming DTAA treaty benefits",C:"Filing returns",D:"Getting PAN"},answer:"B",topic:"DTAA",difficulty:"medium",explanation:"Tax Residency Certificate required for DTAA benefits."},
  {question:"GAAR effective from:",options:{A:"April 1, 2015",B:"April 1, 2017",C:"April 1, 2019",D:"April 1, 2020"},answer:"B",topic:"GAAR",difficulty:"hard",explanation:"GAAR effective April 1, 2017."},
  {question:"Thin capitalization rules restrict:",options:{A:"Equity financing",B:"Excessive debt from related parties",C:"Government borrowing",D:"Employee loans"},answer:"B",topic:"Transfer Pricing",difficulty:"hard",explanation:"Thin cap rules limit interest deductions on excessive related party debt."},
  {question:"CbCR applies to:",options:{A:"All companies",B:"MNEs with consolidated revenue exceeding Rs 5,500 crore",C:"Small businesses",D:"Partnership firms"},answer:"B",topic:"BEPS",difficulty:"hard",explanation:"CbCR for Indian parents of MNEs with revenue > Rs 5,500 crore."},
  {question:"Foreign Tax Credit under Section:",options:{A:"90",B:"91",C:"Both 90 and 91",D:"115BAC"},answer:"C",topic:"DTAA",difficulty:"medium",explanation:"Section 90 (with DTAA) and 91 (without DTAA) for foreign tax credit."},
  {question:"SEP concept for:",options:{A:"Reduce tax compliance",B:"Tax digital companies without physical presence",C:"Exempt foreign companies",D:"Reduce TDS"},answer:"B",topic:"Digital Taxation",difficulty:"hard",explanation:"SEP taxes foreign digital companies based on revenue and user base."},
  {question:"Royalty to non-residents taxed under:",options:{A:"44DA",B:"115A",C:"195",D:"Both A and B"},answer:"D",topic:"International Tax",difficulty:"hard",explanation:"Royalty to non-residents under Section 115A and 44DA."},
  {question:"TDS on payments to non-residents under Section:",options:{A:"194C",B:"194J",C:"195",D:"194H"},answer:"C",topic:"TDS",difficulty:"medium",explanation:"Section 195: TDS on payments to non-residents."},
  {question:"Withholding tax on technical fees is:",options:{A:"10%",B:"15%",C:"As per DTAA or Section 115A",D:"20%"},answer:"C",topic:"International Tax",difficulty:"hard",explanation:"Rate as per DTAA or Section 115A, whichever is more beneficial."}
];

const CMA_F5_CORPORATE_FINANCIAL_REPORTING = [
  {question:"Consolidated statements prepared per:",options:{A:"AS-21",B:"Ind AS 110",C:"Both Ind AS 110 and AS-21",D:"Ind AS 116"},answer:"C",topic:"Consolidation",difficulty:"medium",explanation:"Ind AS 110 and AS-21 govern consolidated statements."},
  {question:"Minority interest represents:",options:{A:"Parent share in subsidiary",B:"Non-controlling shareholders share in subsidiary net assets",C:"Inter-company transactions",D:"Goodwill"},answer:"B",topic:"Consolidation",difficulty:"medium",explanation:"Minority interest = portion of equity not attributable to parent."},
  {question:"Inter-company transactions in consolidation are:",options:{A:"Ignored",B:"Eliminated",C:"Doubled",D:"Recorded separately"},answer:"B",topic:"Consolidation",difficulty:"easy",explanation:"Inter-company transactions eliminated to avoid double counting."},
  {question:"Ind AS 109 classifies instruments into:",options:{A:"Debt and equity only",B:"Financial assets, liabilities, and equity instruments",C:"Current and non-current",D:"Listed and unlisted"},answer:"B",topic:"Financial Instruments",difficulty:"medium",explanation:"Ind AS 109: financial assets, liabilities, equity instruments."},
  {question:"Impairment of assets under:",options:{A:"Ind AS 36",B:"Ind AS 16",C:"Ind AS 38",D:"Ind AS 40"},answer:"A",topic:"Impairment",difficulty:"easy",explanation:"Ind AS 36 deals with Impairment of Assets."},
  {question:"Fair value measurement governed by:",options:{A:"Ind AS 113",B:"Ind AS 109",C:"Ind AS 16",D:"Ind AS 2"},answer:"A",topic:"Fair Value",difficulty:"medium",explanation:"Ind AS 113 Fair Value Measurement framework."},
  {question:"EPS reported as per:",options:{A:"Ind AS 33",B:"Ind AS 1",C:"Ind AS 12",D:"Ind AS 19"},answer:"A",topic:"EPS",difficulty:"easy",explanation:"Ind AS 33: earnings per share calculation and presentation."},
  {question:"Operating segments identified per:",options:{A:"Ind AS 108",B:"Ind AS 1",C:"Ind AS 7",D:"Ind AS 12"},answer:"A",topic:"Segment Reporting",difficulty:"easy",explanation:"Ind AS 108: operating segment disclosures."},
  {question:"Deferred tax under:",options:{A:"Ind AS 12",B:"Ind AS 19",C:"Ind AS 10",D:"Ind AS 37"},answer:"A",topic:"Taxation",difficulty:"easy",explanation:"Ind AS 12: Income Taxes including deferred tax."},
  {question:"Events after reporting period under:",options:{A:"Ind AS 10",B:"Ind AS 37",C:"Ind AS 8",D:"Ind AS 1"},answer:"A",topic:"Events",difficulty:"medium",explanation:"Ind AS 10: adjusting and non-adjusting events after reporting period."},
  {question:"Share-based payments under:",options:{A:"Ind AS 102",B:"Ind AS 19",C:"Ind AS 32",D:"Ind AS 109"},answer:"A",topic:"Share Based Payments",difficulty:"medium",explanation:"Ind AS 102: share-based payment transactions."},
  {question:"Provisions and contingent liabilities under:",options:{A:"Ind AS 37",B:"Ind AS 10",C:"Ind AS 16",D:"Ind AS 38"},answer:"A",topic:"Provisions",difficulty:"easy",explanation:"Ind AS 37: provisions, contingent liabilities and assets."},
  {question:"Investment Property under:",options:{A:"Ind AS 40",B:"Ind AS 16",C:"Ind AS 38",D:"Ind AS 113"},answer:"A",topic:"Investment Property",difficulty:"easy",explanation:"Ind AS 40: investment property accounting."},
  {question:"Borrowing costs capitalized per:",options:{A:"Ind AS 23",B:"Ind AS 16",C:"Ind AS 10",D:"Ind AS 12"},answer:"A",topic:"Borrowing Costs",difficulty:"easy",explanation:"Ind AS 23: capitalize borrowing costs for qualifying assets."},
  {question:"Related party disclosures under:",options:{A:"Ind AS 24",B:"Ind AS 108",C:"Ind AS 1",D:"Ind AS 7"},answer:"A",topic:"Related Parties",difficulty:"easy",explanation:"Ind AS 24: related party relationship and transaction disclosures."}
];

const CMA_F6_INDIRECT_TAX_LAWS = [
  {question:"Maximum GST rate slab is:",options:{A:"18%",B:"28%",C:"30%",D:"40%"},answer:"B",topic:"GST",difficulty:"easy",explanation:"GST slabs: 0%, 5%, 12%, 18%, 28%."},
  {question:"IGST applicable on:",options:{A:"Intra-state supplies",B:"Inter-state supplies",C:"Exports",D:"Both B and C"},answer:"D",topic:"GST",difficulty:"medium",explanation:"IGST for inter-state and imports. Exports zero-rated."},
  {question:"Customs duty levied under:",options:{A:"Customs Act 1962",B:"GST Act",C:"Central Excise Act",D:"Finance Act"},answer:"A",topic:"Customs",difficulty:"easy",explanation:"Customs Act 1962 and Customs Tariff Act 1975."},
  {question:"Anti-dumping duty imposed to:",options:{A:"Increase imports",B:"Protect domestic industry from cheap imports below normal value",C:"Reduce exports",D:"Increase tax revenue"},answer:"B",topic:"Customs",difficulty:"medium",explanation:"Anti-dumping duty protects from imports below normal value."},
  {question:"GST annual return in:",options:{A:"GSTR-9",B:"GSTR-1",C:"GSTR-3B",D:"GSTR-7"},answer:"A",topic:"GST Returns",difficulty:"easy",explanation:"GSTR-9 is annual return."},
  {question:"Reverse charge means:",options:{A:"Supplier pays tax",B:"Recipient pays tax instead of supplier",C:"Government pays",D:"No tax paid"},answer:"B",topic:"GST",difficulty:"easy",explanation:"Reverse charge: recipient pays GST."},
  {question:"Interest on delayed GST at:",options:{A:"10% p.a.",B:"18% p.a.",C:"24% p.a.",D:"15% p.a."},answer:"B",topic:"GST",difficulty:"medium",explanation:"Interest on delayed GST = 18% per annum."},
  {question:"SEZ stands for:",options:{A:"Special Economic Zone",B:"Standard Export Zone",C:"State Economic Zone",D:"Strategic Export Zone"},answer:"A",topic:"Customs & GST",difficulty:"easy",explanation:"SEZ = Special Economic Zone, zero-rated supplies."},
  {question:"Penalty for non-registration under GST:",options:{A:"Rs 10,000",B:"10% of tax due or Rs 10,000 whichever higher",C:"Rs 25,000",D:"Rs 50,000"},answer:"B",topic:"GST Penalties",difficulty:"hard",explanation:"Penalty = 10% of tax due or Rs 10,000, whichever higher."},
  {question:"ITC on food and beverages is:",options:{A:"Fully available",B:"Blocked under Section 17(5)",C:"Available at 50%",D:"Available for restaurants"},answer:"B",topic:"GST",difficulty:"medium",explanation:"ITC on food/beverages blocked under Section 17(5)."},
  {question:"Safeguard duty when:",options:{A:"Imports subsidized",B:"Import surge causes serious injury to domestic industry",C:"Exports decrease",D:"Government needs revenue"},answer:"B",topic:"Customs",difficulty:"medium",explanation:"Safeguard duty temporary measure against import surge."},
  {question:"Refund under GST available for:",options:{A:"Only exports",B:"Exports, inverted duty, provisional assessment, other specified",C:"All transactions",D:"Only imports"},answer:"B",topic:"GST",difficulty:"medium",explanation:"GST refunds for exports, inverted duty, excess payment, etc."},
  {question:"GST implemented on:",options:{A:"January 1, 2017",B:"July 1, 2017",C:"April 1, 2017",D:"October 1, 2017"},answer:"B",topic:"GST",difficulty:"easy",explanation:"GST implemented July 1, 2017."},
  {question:"E-way bill required for goods exceeding:",options:{A:"Rs 25,000",B:"Rs 50,000",C:"Rs 1,00,000",D:"Rs 5,00,000"},answer:"B",topic:"GST",difficulty:"medium",explanation:"E-way bill for movement exceeding Rs 50,000."},
  {question:"Composition scheme for turnover up to:",options:{A:"Rs 50 lakh",B:"Rs 75 lakh",C:"Rs 1.5 crore",D:"Rs 2 crore"},answer:"C",topic:"GST",difficulty:"medium",explanation:"Composition scheme for turnover up to Rs 1.5 crore."}
];

const CMA_F7_COST_MGMT_AUDIT = [
  {question:"Cost audit under Section 148 for:",options:{A:"All companies",B:"Companies producing goods or services as notified",C:"Only listed companies",D:"Only foreign companies"},answer:"B",topic:"Cost Audit",difficulty:"medium",explanation:"Section 148: cost audit for notified companies."},
  {question:"Cost audit report submitted to:",options:{A:"Shareholders",B:"Central Government through company",C:"Stock exchange",D:"SEBI"},answer:"B",topic:"Cost Audit",difficulty:"medium",explanation:"Cost audit report to Central Government through company."},
  {question:"Cost records maintained for:",options:{A:"3 years",B:"5 years",C:"8 years",D:"10 years"},answer:"C",topic:"Cost Records",difficulty:"medium",explanation:"Section 148: cost records for 8 years."},
  {question:"Cost Accounting Standards issued by:",options:{A:"ICAI",B:"ICMAI",C:"RBI",D:"MCA"},answer:"B",topic:"Cost Standards",difficulty:"easy",explanation:"CAS issued by ICMAI."},
  {question:"Management audit examines:",options:{A:"Only financial statements",B:"Effectiveness and efficiency of management functions",C:"Only tax compliance",D:"Only cost records"},answer:"B",topic:"Management Audit",difficulty:"easy",explanation:"Management audit evaluates efficiency and effectiveness of management."},
  {question:"Cost audit helps in:",options:{A:"Detecting fraud only",B:"Cost control, reduction, and efficient resource utilization",C:"Tax assessment only",D:"Statutory compliance only"},answer:"B",topic:"Cost Audit",difficulty:"easy",explanation:"Cost audit helps control costs and improve efficiency."},
  {question:"Operational audit focuses on:",options:{A:"Financial statements",B:"Effectiveness of operations and compliance with procedures",C:"Tax compliance",D:"Legal compliance only"},answer:"B",topic:"Operational Audit",difficulty:"easy",explanation:"Operational audit evaluates operating procedures effectiveness."},
  {question:"Compliance audit checks:",options:{A:"True and fair accounts",B:"Laws, regulations, and internal policies followed",C:"Profit maximization",D:"Cost minimization"},answer:"B",topic:"Compliance Audit",difficulty:"easy",explanation:"Compliance audit verifies adherence to laws and regulations."},
  {question:"Cost auditor appointed by:",options:{A:"Shareholders",B:"Board with prior approval of Central Government",C:"Statutory auditor",D:"SEBI"},answer:"B",topic:"Cost Audit",difficulty:"medium",explanation:"Cost auditor appointed by Board with Central Government approval."},
  {question:"Cost audit differs from financial audit in:",options:{A:"Mandatory for all",B:"Focuses on cost efficiency and compliance with CAS",C:"Done by CAs only",D:"Voluntary"},answer:"B",topic:"Cost Audit",difficulty:"easy",explanation:"Cost audit focuses on cost efficiency while financial audit on true and fair view."},
  {question:"Cost auditor appointed under Section 148 is in addition to:",options:{A:"Tax audit",B:"Statutory audit under Section 139",C:"Internal audit",D:"Secretarial audit"},answer:"B",topic:"Cost Audit",difficulty:"medium",explanation:"Cost audit in addition to statutory audit under Section 139."},
  {question:"Non-integrated cost accounting means:",options:{A:"Cost and financial accounts maintained separately",B:"Both integrated",C:"Only cost accounts",D:"Only financial accounts"},answer:"A",topic:"Cost Accounting",difficulty:"medium",explanation:"Non-integrated: cost and financial accounts separate, requiring reconciliation."},
  {question:"Cost statement shows:",options:{A:"Revenue only",B:"Detailed breakup of material, labour, overheads",C:"Assets only",D:"Liabilities only"},answer:"B",topic:"Cost Reporting",difficulty:"easy",explanation:"Cost statement: detailed breakup of all cost elements."},
  {question:"Benchmarking in cost audit means:",options:{A:"Setting selling prices",B:"Comparing costs with industry best practices",C:"Estimating future costs",D:"Auditing benchmarks"},answer:"B",topic:"Benchmarking",difficulty:"easy",explanation:"Benchmarking compares actual costs with best practices."},
  {question:"Cost audit applicable as per:",options:{A:"Rs 5 crore",B:"Rs 10 crore",C:"Cost Records and Audit Rules 2014",D:"Rs 100 crore"},answer:"C",topic:"Cost Audit",difficulty:"hard",explanation:"Applicability per Companies (Cost Records and Audit) Rules 2014."}
];

const CMA_F8_PERFORMANCE_VALUATION = [
  {question:"Balanced Scorecard developed by:",options:{A:"Michael Porter",B:"Kaplan and Norton",C:"Peter Drucker",D:"Henry Fayol"},answer:"B",topic:"BSC",difficulty:"easy",explanation:"BSC by Robert Kaplan and David Norton 1992."},
  {question:"EVA developed by:",options:{A:"McKinsey",B:"Stern Stewart and Co",C:"Boston Consulting Group",D:"PwC"},answer:"B",topic:"EVA",difficulty:"medium",explanation:"EVA by Stern Stewart and Co."},
  {question:"DCF method discounts:",options:{A:"Past earnings",B:"Expected future free cash flows",C:"Book value",D:"Market cap"},answer:"B",topic:"Valuation",difficulty:"easy",explanation:"DCF values business by discounting future free cash flows."},
  {question:"Brand valuation measures:",options:{A:"Only sales revenue",B:"Financial value of brand as intangible asset",C:"Product quality",D:"Employee satisfaction"},answer:"B",topic:"Brand Valuation",difficulty:"easy",explanation:"Brand valuation estimates financial worth of brand."},
  {question:"DuPont analysis breaks ROE into:",options:{A:"Profit margin x Asset turnover x Financial leverage",B:"Revenue / Cost",C:"Net profit / Sales",D:"Assets / Liabilities"},answer:"A",topic:"Performance Analysis",difficulty:"medium",explanation:"DuPont: ROE = Net Profit Margin x Asset Turnover x Equity Multiplier."},
  {question:"Residual Income is:",options:{A:"Total income",B:"Operating income minus minimum required return on investment",C:"Gross profit",D:"Net income after tax"},answer:"B",topic:"Performance Measurement",difficulty:"medium",explanation:"RI = Operating Income - (Required Rate x Investment)."},
  {question:"KPIs are:",options:{A:"Financial metrics only",B:"Quantifiable measures to evaluate success in meeting objectives",C:"Legal requirements",D:"Budget targets"},answer:"B",topic:"KPIs",difficulty:"easy",explanation:"KPIs measure how effectively objectives are achieved."},
  {question:"ERM considers:",options:{A:"Financial risk only",B:"All risks: strategic, operational, financial, compliance",C:"Only operational risk",D:"Only market risk"},answer:"B",topic:"Risk Management",difficulty:"easy",explanation:"ERM manages all types of risks across organization."},
  {question:"Fair market value is:",options:{A:"Book value",B:"Price between willing buyer and seller",C:"Replacement cost",D:"Liquidation value"},answer:"B",topic:"Valuation",difficulty:"easy",explanation:"FMV = price at which property trades between willing buyer and seller."},
  {question:"WACC used as:",options:{A:"Selling price",B:"Discount rate in DCF valuation",C:"Tax rate",D:"Inflation rate"},answer:"B",topic:"Valuation",difficulty:"medium",explanation:"WACC as discount rate in DCF."},
  {question:"Corporate Governance score measures:",options:{A:"Profitability",B:"Board independence, transparency, accountability quality",C:"Revenue growth",D:"Market share"},answer:"B",topic:"Corporate Governance",difficulty:"easy",explanation:"Governance score evaluates board quality and transparency."},
  {question:"Market capitalization is:",options:{A:"Total assets",B:"Share price x Outstanding shares",C:"Revenue x Profit margin",D:"Book value of equity"},answer:"B",topic:"Valuation",difficulty:"easy",explanation:"Market Cap = Price per Share x Outstanding Shares."},
  {question:"Intangible valuation methods include:",options:{A:"Only cost approach",B:"Income, market, and cost approach",C:"Only market approach",D:"Book value method"},answer:"B",topic:"Valuation",difficulty:"medium",explanation:"Income, market, and cost approaches for intangible valuation."},
  {question:"Post-merger evaluation measures:",options:{A:"Only cost savings",B:"Whether merger achieved expected synergies and value",C:"Only revenue increase",D:"Employee satisfaction"},answer:"B",topic:"Mergers",difficulty:"medium",explanation:"Post-merger evaluation assesses synergy and value creation targets."},
  {question:"SVA is:",options:{A:"Dividend paid",B:"NOPAT minus cost of capital",C:"Market cap",D:"Book value of equity"},answer:"B",topic:"Value Based Management",difficulty:"medium",explanation:"SVA = NOPAT - Cost of Capital, measures shareholder value created."}
];

async function main() {
  console.log("=== PUSHING ALL CMA (ICWAI) QUESTIONS ===\n");

  console.log("--- CMA FOUNDATION ---");
  await pushQuestions("cma_foundation", "economics_management", CMA_F1_ECONOMICS);
  await pushQuestions("cma_foundation", "accounting", CMA_F2_ACCOUNTING);
  await pushQuestions("cma_foundation", "laws_ethics", CMA_F3_LAWS);
  await pushQuestions("cma_foundation", "maths_statistics", CMA_F4_MATHS);

  console.log("\n--- CMA INTERMEDIATE ---");
  await pushQuestions("cma_inter", "financial_accounting", CMA_I1_FINANCIAL_ACCOUNTING);
  await pushQuestions("cma_inter", "laws_ethics", CMA_I2_LAWS_ETHICS);
  await pushQuestions("cma_inter", "direct_taxation", CMA_I3_DIRECT_TAX);
  await pushQuestions("cma_inter", "cost_accounting", CMA_I4_COST_ACCOUNTING);
  await pushQuestions("cma_inter", "operations_management", CMA_I5_OPERATIONS_MGMT);
  await pushQuestions("cma_inter", "cost_mgmt_financial", CMA_I6_COST_MGMT_FINANCIAL);
  await pushQuestions("cma_inter", "indirect_taxation", CMA_I7_INDIRECT_TAX);
  await pushQuestions("cma_inter", "company_accounts_audit", CMA_I8_COMPANY_ACCOUNTS_AUDIT);

  console.log("\n--- CMA FINAL ---");
  await pushQuestions("cma_final", "corporate_laws", CMA_F1_FINAL_CORPORATE_LAWS);
  await pushQuestions("cma_final", "strategic_financial_mgmt", CMA_F2_STRATEGIC_FINANCIAL_MGMT);
  await pushQuestions("cma_final", "strategic_cost_mgmt", CMA_F3_STRATEGIC_COST_MGMT);
  await pushQuestions("cma_final", "direct_tax_international", CMA_F4_DIRECT_TAX_INTERNATIONAL);
  await pushQuestions("cma_final", "corporate_financial_reporting", CMA_F5_CORPORATE_FINANCIAL_REPORTING);
  await pushQuestions("cma_final", "indirect_tax_laws", CMA_F6_INDIRECT_TAX_LAWS);
  await pushQuestions("cma_final", "cost_mgmt_audit", CMA_F7_COST_MGMT_AUDIT);
  await pushQuestions("cma_final", "performance_valuation", CMA_F8_PERFORMANCE_VALUATION);

  console.log("\n=== ALL DONE ===");
  console.log("Total: 300 questions across 20 papers");
}

main().catch(console.error);
