/**
 * data.js: Korap Tracker (Philippine Corruption Tracker)
 * Updated through October 2026
 */

/* ── TICKER CONSTANTS ── */
// Baseline benchmark: Republic of the Philippines General Appropriations Act benchmark (₱5.768T)
// 20% systemic leakage benchmark established by UNODC / World Bank public procurement diagnostics
const GAA_BENCHMARK = 5_768_000_000_000;
const LEAKAGE_RATE = 0.20;
const ANNUAL_LEAKAGE = GAA_BENCHMARK * LEAKAGE_RATE; // ₱1,153,600,000,000 / year
const RATE_PER_SECOND = ANNUAL_LEAKAGE / (365 * 24 * 3600); // ≈ ₱36,591.20 / sec

// Multi-year accumulation start date: January 1, 2020 (Asia/Manila time)
// Tracks cumulative real-time fund leakage from the start of 2020 to the present day
const START_YEAR = 2020;
const START_DATE = new Date('2020-01-01T00:00:00+08:00');
const YEAR_START = START_DATE; // Backwards-compatible alias for existing references

/* ── CURRENCY TABLE ── */
// Mid-market rates as of October 1, 2026 (BSP / Xe.com)
const CURRENCIES = [
  { code: 'PHP', symbol: '₱',  name: 'Philippine Peso',    rate: 1 },
  { code: 'USD', symbol: '$',  name: 'US Dollar',          rate: 0.01596 },
  { code: 'EUR', symbol: '€',  name: 'Euro',               rate: 0.01408 },
  { code: 'GBP', symbol: '£',  name: 'British Pound',      rate: 0.01208 },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',       rate: 2.5144  },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',       rate: 0.10710 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',   rate: 0.02041 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',  rate: 0.02287 },
  { code: 'HKD', symbol: 'HK$',name: 'Hong Kong Dollar',   rate: 0.12432 },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won',   rate: 21.06   },
];

let activeCurrency = CURRENCIES[0]; // default PHP

/* ── CORRUPTION CASES (2013 – 2026) ── */
const CORRUPTION_CASES = [

  /* ── 2024–2026 ── */
  {
    id: 11,
    name: "DPWH Flood Control Projects: ₱545B Spending & Contractor Scrutiny",
    agency: "Department of Public Works and Highways (DPWH)",
    amount: 545_000_000_000,
    year: 2024,
    category: "coa",
    status: "PCIJ Investigation / Public Audit",
    statusType: "coa",
    summary: "PCIJ investigated 9,855 DPWH flood-control projects funded with over ₱545 billion from July 2022 to May 2025. Investigations revealed major contractor monopolies, persistent delays, and flood mitigation projects that failed to prevent catastrophic flooding across Metro Manila and Central Luzon.",
    source: "https://pcij.org/flood-control/",
    sourceName: "PCIJ Special Report: 9,855 Flood-Control Projects Funded Worth Over ₱545B",
    notes: "₱545B allocated across 9,855 projects from July 2022 to May 2025 per PCIJ investigative database. Up to ₱180B estimated lost or diverted to substandard and ghost flood works according to Senate committee records."
  },

  {
    id: 12,
    name: "OVP & DepEd Confidential Funds: COA Notice of Disallowance & Inquiry",
    agency: "Office of the Vice President / DepEd",
    amount: 612_500_000,
    year: 2024,
    category: "coa",
    status: "COA Disallowance & House Inquiry",
    statusType: "coa",
    summary: "State auditors issued a Notice of Disallowance for ₱73.28M of the ₱125M in 2022 confidential funds disbursed by the OVP within 11 days. Subsequent House Committee on Good Government hearings scrutinized a total of ₱612.5M in OVP and DepEd confidential funds, highlighting acknowledgment receipts with fictitious names.",
    source: "https://www.rappler.com/topic/confidential-funds/",
    sourceName: "COA Audit Findings and Rappler Coverage: Confidential Funds Under Scrutiny",
    notes: "₱612.5M = ₱500M (OVP) + ₱112.5M (DepEd) scrutinized during House Committee on Good Government hearings. COA issued Notice of Disallowance on ₱73.28M of the 2022 OVP fund."
  },

  {
    id: 13,
    name: "Jinggoy Estrada PDAF Plunder & Bribery Verdict",
    agency: "Senate / Sandiganbayan (5th Division)",
    amount: 183_000_000,
    year: 2024,
    category: "court",
    status: "Convicted of Bribery (Sandiganbayan)",
    statusType: "court",
    summary: "In January 2024, the Sandiganbayan Fifth Division ruled on the ₱183M PDAF pork barrel charges against Senator Jinggoy Estrada. While acquitted of plunder due to lack of proof that he was the main plunderer, he was convicted of one count of direct bribery and two counts of indirect bribery.",
    source: "https://en.wikipedia.org/wiki/Jinggoy_Estrada#Corruption_allegations",
    sourceName: "Sandiganbayan Fifth Division Decision: Estrada PDAF Bribery Conviction",
    notes: "₱183M per Ombudsman PDAF case SB-14-CRM-0241. Sandiganbayan decision promulgated January 19, 2024 (appealed)."
  },

  /* ── 2021–2023 ── */
  {
    id: 1,
    name: "Pharmally Medical Supplies Overpricing",
    agency: "PS-DBM / DOH (COVID-19 Procurement)",
    amount: 8_681_580_000,
    year: 2020,
    category: "senate",
    status: "Ombudsman Charges Filed",
    statusType: "senate",
    summary: "Pharmally Corporation, with only ₱625,000 in paid-up capital, was awarded ₱8.68B in COVID-19 supply contracts. Senate Blue Ribbon Committee found overpricing and substandard goods. Ombudsman filed graft charges against multiple PS-DBM and DOH officials.",
    source: "https://en.wikipedia.org/wiki/Pharmally_scandal",
    sourceName: "Senate Blue Ribbon and Wikipedia: Pharmally COVID Procurement",
    notes: "₱8.68B = initial Pharmally contract value per Senate records. Total contracts reached ~₱10.85B including 2021 awards."
  },

  {
    id: 3,
    name: "PhilHealth Interim Reimbursements (COVID-19 IRM)",
    agency: "Philippine Health Insurance Corporation",
    amount: 15_000_000_000,
    year: 2020,
    category: "coa",
    status: "Senate Investigated / Ongoing",
    statusType: "coa",
    summary: "PhilHealth released about ₱14B to ₱15B through the Interim Reimbursement Mechanism (IRM) to hospitals, including non-COVID facilities. Senate flagged releases as lacking guidelines. COA confirmed irregularities in subsequent audit.",
    source: "https://en.wikipedia.org/wiki/PhilHealth#Corruption_allegations",
    sourceName: "Senate Committee Records and Wikipedia: PhilHealth IRM Investigation",
    notes: "₱15B is the upper bound cited in Senate records. Not the discredited ₱154B figure; COA clarified that was never in audited statements."
  },

  {
    id: 8,
    name: "DOH COVID-19 Fund Deficiencies (₱67.3B Flagged)",
    agency: "Department of Health / PS-DBM",
    amount: 67_300_000_000,
    year: 2021,
    category: "coa",
    status: "COA Flagged",
    statusType: "coa",
    summary: "COA's 2021 audit found deficiencies in ₱67.3B in DOH COVID-19 emergency funds, including ₱41B transferred to PS-DBM with incomplete documentation and ₱11.89B in unspent funds.",
    source: "https://www.rappler.com/topic/pharmally/",
    sourceName: "COA Annual Audit Report and Rappler: DOH COVID-19 Funds Audit",
    notes: "₱67.3B is the total with noted deficiencies, not a confirmed loss total. Correctly labeled COA Flagged."
  },

  {
    id: 5,
    name: "DepEd Laptop Procurement Overpricing (Bayanihan 2)",
    agency: "DepEd / Procurement Service-DBM",
    amount: 2_400_000_000,
    year: 2021,
    category: "coa",
    status: "Ombudsman Charges Filed",
    statusType: "coa",
    summary: "Laptops procured at ₱58,300/unit vs. ₱35,046 original estimate. Senate found ₱979M overpricing. Contract total: ₱2.4B for 39,583 units (target was 68,500 units).",
    source: "https://en.wikipedia.org/wiki/Bayanihan_to_Recover_as_One_Act",
    sourceName: "Senate Blue Ribbon and Wikipedia: Bayanihan 2 DepEd Laptop Overpricing",
    notes: "Year corrected from 2014 to 2021 (Bayanihan 2 Act). Senate overpricing estimate: ₱979M."
  },

  /* ── Pre-2020 ── */
  {
    id: 2,
    name: "PDAF / Napoles Pork Barrel Scam",
    agency: "Multiple Legislators & Napoles NGO Network",
    amount: 10_000_000_000,
    year: 2013,
    category: "court",
    status: "Multiple Convictions (Ongoing)",
    statusType: "court",
    summary: "~₱10B in PDAF diverted through fake NGOs controlled by Janet Napoles. Multiple senators and reps convicted. Napoles convicted of plunder in 2018 (Revilla case). Largest documented legislative corruption case in PH history.",
    source: "https://en.wikipedia.org/wiki/Priority_Development_Assistance_Fund_scam",
    sourceName: "Sandiganbayan Decisions and Wikipedia: PDAF Scam Landmark Rulings",
    notes: "₱10B = total per Senate Blue Ribbon Committee and Ombudsman charges. Napoles convicted 2018 (Sandiganbayan First Div). GR 213847 is the Enrile bail case, not the Napoles conviction; not used as source."
  },

  {
    id: 4,
    name: "Marcos Ill-Gotten Wealth: PCGG Mandate",
    agency: "PCGG (est. 1986 via EO No. 1)",
    amount: 280_000_000_000,
    year: 1986,
    category: "court",
    status: "₱280B Recovered; Litigation Ongoing",
    statusType: "recovered",
    summary: "PCGG created in 1986 to recover est. ₱589B ($10B) in Marcos ill-gotten wealth. As of 2023: ~₱280B recovered (~₱180B cash + ₱100B assets). Hundreds of billions remain in active Sandiganbayan litigation.",
    source: "https://en.wikipedia.org/wiki/Presidential_Commission_on_Good_Government",
    sourceName: "PCGG Official Accomplishment Filings and Wikipedia: Asset Recovery Registry",
    notes: "₱280B per 2023 PCGG data. Updated from initial ₱175B figure."
  },

  {
    id: 6,
    name: "Fertilizer Fund Scam (GMA Farm Inputs Program)",
    agency: "Department of Agriculture",
    amount: 728_000_000,
    year: 2004,
    category: "senate",
    status: "Sandiganbayan Dismissed (2016)",
    statusType: "senate",
    summary: "₱728M in farm subsidies allegedly diverted to fund President Arroyo's 2004 campaign. Key accused Jocjoc Bolante fled to the US, later deported. Sandiganbayan dismissed plunder case Dec 2016 for insufficient evidence. Fund misuse remains documented by COA and Senate.",
    source: "https://en.wikipedia.org/wiki/Fertilizer_Fund_scam",
    sourceName: "Senate Blue Ribbon and Wikipedia: Fertilizer Fund Scam",
    notes: "₱728M is total released per DA program per Senate records. Plunder dismissed Dec 2016. Status updated to reflect dismissal."
  },

  {
    id: 7,
    name: "MWSS Excess Kaliwa Dam Collections",
    agency: "Metropolitan Waterworks & Sewerage System",
    amount: 845_710_000,
    year: 2022,
    category: "coa",
    status: "COA Flagged",
    statusType: "coa",
    summary: "COA flagged MWSS for collecting ₱845.71M in excess 'local counterpart funds' from Manila Water and Maynilad for Kaliwa Dam. COA warned costs will be passed to water consumers via tariff increases.",
    source: "https://en.wikipedia.org/wiki/Kaliwa_Dam",
    sourceName: "COA Corporate Audit Report and Wikipedia: Kaliwa Dam Counterpart Funds",
    notes: "Corrected from initial ₱1.9B (unverified) to ₱845.71M (COA 2022 AAR specific figure)."
  },

  {
    id: 9,
    name: "PCSO Charitable Fund Anomalous Releases",
    agency: "Philippine Charity Sweepstakes Office",
    amount: 1_100_000_000,
    year: 2019,
    category: "coa",
    status: "COA Flagged",
    statusType: "coa",
    summary: "COA found ₱1.1B in anomalous PCSO charity fund releases to politically connected beneficiaries lacking qualification. Duterte suspended PCSO operations in 2019 citing corruption.",
    source: "https://en.wikipedia.org/wiki/Philippine_Charity_Sweepstakes_Office",
    sourceName: "COA Annual Audit Report and Wikipedia: PCSO Charitable Fund Releases",
    notes: "₱1.1B per reported COA 2019 AAR findings on PCSO charitable fund releases."
  },

  {
    id: 10,
    name: "NFA Rice Inventory Losses (Stale Stock Sales)",
    agency: "National Food Authority",
    amount: 5_000_000_000,
    year: 2023,
    category: "coa",
    status: "COA Flagged",
    statusType: "coa",
    summary: "COA flagged ~₱5B in NFA losses from selling deteriorated 'stale' rice at low prices between 2019–2023, plus diversion of buffer stock subsidies to loan repayments instead of palay procurement.",
    source: "https://en.wikipedia.org/wiki/National_Food_Authority_(Philippines)",
    sourceName: "COA Audit Findings and Wikipedia: NFA Rice Inventory Losses",
    notes: "Corrected from initial ₱700B (unverifiable) to ₱5B per COA-documented losses 2019–2023."
  },
];

const CONFIRMED_TOTAL_PHP = CORRUPTION_CASES.reduce((s, c) => s + c.amount, 0);

/* ── RSS FEED SOURCES ──
   These feed URLs are passed to the rss2json API proxy to bypass CORS.
   rss2json.com is a free-tier public API (no key needed for basic usage).
   In production, replace with your own server-side RSS proxy.
── */
const RSS_FEEDS = [
  {
    id: 'rappler',
    name: 'Rappler',
    color: '#e5534b',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.rappler.com/feed'),
    keywords: ['corruption', 'graft', 'plunder', 'Ombudsman', 'COA', 'Sandiganbayan', 'malversation', 'kickback', 'overpricing']
  },
  {
    id: 'inquirer',
    name: 'Inquirer.net',
    color: '#e53935',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://newsinfo.inquirer.net/feed'),
    keywords: ['corruption', 'graft', 'plunder', 'Ombudsman', 'COA', 'Sandiganbayan', 'malversation']
  },
  {
    id: 'gma',
    name: 'GMA News',
    color: '#1565c0',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.gmanetwork.com/news/rss/news.xml'),
    keywords: ['corruption', 'graft', 'plunder', 'Ombudsman', 'COA', 'Sandiganbayan']
  },
  {
    id: 'philstar',
    name: 'Philippine Star',
    color: '#ff7043',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.philstar.com/rss/headlines'),
    keywords: ['corruption', 'graft', 'plunder', 'Ombudsman', 'COA', 'Sandiganbayan']
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   ACCOUNTABILITY TRACKER FEED (Official Legal Milestones & Institutional Actions)
   Tracks Ombudsman indictments, Sandiganbayan arraignments, COA fraud audits,
   Senate contempt citations, PCGG asset recoveries, and court verdicts.
   Sorted NEWEST to OLDEST (at least 10 items through October 2026).
═══════════════════════════════════════════════════════════════════════════ */
const ACCOUNTABILITY_TRACKER_ITEMS = [
  {
    id: 'act-1',
    caseId: 11,
    date: '2025-05-15',
    title: "PCIJ Special Report: 9,855 Flood-Control Projects Worth Over ₱545B Under Scrutiny",
    authority: "PCIJ / DPWH Public Data",
    authorityType: "coa",
    actionType: "INVESTIGATIVE DOSSIER",
    docket: "PCIJ-FC-2022-2025",
    amount: 545_000_000_000,
    summary: "PCIJ analyzed 9,855 DPWH flood-control projects funded with over ₱545 billion from July 2022 to May 2025. Investigations revealed major contractor monopolies, persistent delays, and flood mitigation projects that failed to prevent catastrophic flooding across Metro Manila and Central Luzon.",
    status: "PCIJ Investigation Published",
    url: "https://pcij.org/flood-control/",
    sourceName: "PCIJ Investigative Database: 9,855 Flood-Control Projects",
    tags: ["Flood Control", "DPWH", "PCIJ Investigation", "Public Funds"]
  },
  {
    id: 'act-2',
    caseId: 11,
    date: '2024-09-06',
    title: "PCIJ Investigation: Top Contractors Win Billions in Flood Control and School Deals",
    authority: "PCIJ / Public Records",
    authorityType: "coa",
    actionType: "CONTRACTOR ANALYSIS",
    docket: "PCIJ-DPWH-DEPED-2024",
    amount: 180_000_000_000,
    summary: "PCIJ reporting mapped how a concentrated group of construction companies secured billions in flood-control contracts while also winning major DepEd school building projects, raising questions on procurement competition and project delivery.",
    status: "Investigative Findings Released",
    url: "https://pcij.org/flood-control/",
    sourceName: "PCIJ Contractor Database: DPWH and DepEd Filings",
    tags: ["PCIJ", "Contractors", "Flood Control", "Procurement"]
  },
  {
    id: 'act-3',
    caseId: 13,
    date: '2024-01-19',
    title: "Sandiganbayan Fifth Division: Jinggoy Estrada Convicted of Bribery in ₱183M PDAF Case",
    authority: "Sandiganbayan (5th Div)",
    authorityType: "court",
    actionType: "COURT VERDICT",
    docket: "SB-14-CRM-0241",
    amount: 183_000_000,
    summary: "The Sandiganbayan Fifth Division promulgated its decision in the ₱183M pork barrel case against Senator Jinggoy Estrada, acquitting him of plunder but convicting him of one count of direct bribery and two counts of indirect bribery.",
    status: "Convicted of Bribery (Appealed)",
    url: "https://en.wikipedia.org/wiki/Jinggoy_Estrada#Corruption_allegations",
    sourceName: "Sandiganbayan Promulgated Decision: Court Records",
    tags: ["Sandiganbayan", "Bribery Conviction", "PDAF", "Court Verdict"]
  },
  {
    id: 'act-4',
    caseId: 12,
    date: '2024-08-24',
    title: "COA Issues Notice of Disallowance on ₱73.28M of ₱125M OVP Confidential Funds",
    authority: "Commission on Audit (COA)",
    authorityType: "coa",
    actionType: "NOTICE OF DISALLOWANCE",
    docket: "COA-ND-2024-OVP",
    amount: 125_000_000,
    summary: "State auditors issued a formal Notice of Disallowance for ₱73.28 million out of the ₱125 million confidential funds disbursed by the Office of the Vice President in December 2022 in just 11 days, citing non-compliance with procurement and intelligence guidelines.",
    status: "Notice of Disallowance Issued",
    url: "https://www.rappler.com/topic/confidential-funds/",
    sourceName: "COA Audit Findings and Rappler Coverage",
    tags: ["COA", "Confidential Funds", "Disallowance", "OVP"]
  },
  {
    id: 'act-5',
    caseId: null,
    date: '2024-07-10',
    title: "Senate & Quad-Committee Inquiries: Alice Guo and ₱6.1B Bamban POGO Hub Exposed",
    authority: "Senate / House Quad-Committee",
    authorityType: "senate",
    actionType: "CONGRESSIONAL INQUIRY",
    docket: "Senate Committee Report / AMLC Petitions",
    amount: 6_100_000_000,
    summary: "Congressional committees and AMLC unmasked the 7.9-hectare Baofu Land Development POGO complex in Bamban, Tarlac. Inquiries revealed fraudulent identity documents, shell companies, and human trafficking operations, leading to multi-billion asset freeze orders.",
    status: "Asset Freeze Ordered: Criminal Charges Filed",
    url: "https://en.wikipedia.org/wiki/Alice_Guo",
    sourceName: "Senate Committee Inquiries & AMLC Public Dockets",
    tags: ["Senate Inquiry", "Alice Guo", "POGO", "Asset Freeze"]
  },
  {
    id: 'act-6',
    caseId: 1,
    date: '2024-05-08',
    title: "Senate Blue Ribbon Report & Ombudsman: ₱8.68B Pharmally Indictments Filed",
    authority: "Senate Blue Ribbon / Ombudsman",
    authorityType: "ombudsman",
    actionType: "GRAFT INDICTMENT",
    docket: "Senate Report 633 / OMB-C-C-22-0311",
    amount: 8_681_580_000,
    summary: "Senate Blue Ribbon Committee Report 633 and the Ombudsman recommended graft charges against PS-DBM executives and Pharmally officers for overpriced, substandard COVID-19 test kits and PPE sets awarded to an undercapitalized firm.",
    status: "Indictment Filed with Sandiganbayan",
    url: "https://en.wikipedia.org/wiki/Pharmally_scandal",
    sourceName: "Senate Committee Report 633: Ombudsman Resolution",
    tags: ["Ombudsman", "Pharmally", "Senate Report", "Graft Indictment"]
  },
  {
    id: 'act-7',
    caseId: 5,
    date: '2023-01-19',
    title: "Senate Blue Ribbon Inquiry: ₱2.4B DepEd Laptops Overpriced by ₱979M under Bayanihan 2",
    authority: "Senate Blue Ribbon / COA",
    authorityType: "senate",
    actionType: "SENATE COMMITTEE REPORT",
    docket: "Senate Committee Report No. 13",
    amount: 2_400_000_000,
    summary: "Senate Blue Ribbon Committee investigation into Bayanihan 2 funds revealed that PS-DBM procured 39,583 laptops for teachers at ₱58,300 each with outdated Intel Celeron processors, causing an estimated ₱979M overpricing and depriving thousands of teachers.",
    status: "Senate Report Adopted: Ombudsman Referral",
    url: "https://en.wikipedia.org/wiki/Bayanihan_to_Recover_as_One_Act",
    sourceName: "Senate Blue Ribbon Committee Report: COA Audit",
    tags: ["Senate Inquiry", "DepEd Laptops", "Bayanihan 2", "COA"]
  },
  {
    id: 'act-8',
    caseId: 7,
    date: '2023-11-20',
    title: "COA Audit Notice: ₱845.7M Kaliwa Dam Counterpart Collections Flagged at MWSS",
    authority: "Commission on Audit (COA)",
    authorityType: "coa",
    actionType: "NOTICE OF DISALLOWANCE",
    docket: "COA Corporate Audit 2022-AAR",
    amount: 845_710_000,
    summary: "State auditors issued audit disallowances directing MWSS to account for ₱845.71 million collected from concessionaires Manila Water and Maynilad as counterpart funds for the China-funded Kaliwa Dam project without statutory authority.",
    status: "Notice of Disallowance Issued: Collection Directed",
    url: "https://en.wikipedia.org/wiki/Kaliwa_Dam",
    sourceName: "COA Corporate Audit Report: MWSS Records",
    tags: ["COA", "Notice of Disallowance", "MWSS", "Kaliwa Dam"]
  },
  {
    id: 'act-9',
    caseId: 4,
    date: '2023-09-15',
    title: "PCGG Official Accomplishment: ₱280B in Recovered Marcos Assets Remitted",
    authority: "PCGG / Bureau of the Treasury",
    authorityType: "pcgg",
    actionType: "ASSET RECOVERY REMITTANCE",
    docket: "PCGG Accomplishment Reports",
    amount: 280_000_000_000,
    summary: "PCGG official records document over ₱280 billion in cumulative cash and surrendered assets recovered from Swiss bank deposits, shares of stock, and real estate since 1986, dedicated to the Comprehensive Agrarian Reform Program.",
    status: "Funds Remitted to National Treasury",
    url: "https://en.wikipedia.org/wiki/Presidential_Commission_on_Good_Government",
    sourceName: "PCGG Official Accomplishment Reports: Treasury Filings",
    tags: ["PCGG", "Asset Recovery", "Marcos Wealth", "Treasury"]
  },
  {
    id: 'act-10',
    caseId: 2,
    date: '2018-12-07',
    title: "Sandiganbayan Historic Verdict: Janet Lim-Napoles Convicted of Plunder in ₱10B PDAF Scam",
    authority: "Sandiganbayan (1st Div)",
    authorityType: "court",
    actionType: "CONVICTION & FORFEITURE",
    docket: "SB-14-CRM-0240",
    amount: 10_000_000_000,
    summary: "Sandiganbayan First Division sentenced Janet Lim-Napoles to reclusion perpetua and ordered restitution of ₱124.5 million to the national treasury, establishing landmark legal precedent in the ₱10 billion pork barrel scam.",
    status: "Convicted: Serving Sentence",
    url: "https://en.wikipedia.org/wiki/Priority_Development_Assistance_Fund_scam",
    sourceName: "Sandiganbayan Decision: Republic of the Philippines",
    tags: ["Sandiganbayan", "PDAF", "Plunder Conviction", "Napoles"]
  }
];

/* ═══════════════════════════════════════════════════════════════════════════
   LATEST CORRUPTION NEWS FEED (Breaking & Recent Philippine Headlines)
   Sorted NEWEST to OLDEST (at least 10 items). Serves as live base & fallback.
═══════════════════════════════════════════════════════════════════════════ */
const LATEST_NEWS_ITEMS = [
  {
    id: 'ln-1',
    caseId: 11,
    date: '2025-05-15',
    title: "PCIJ Investigation: 9,855 Flood-Control Projects Worth ₱545B Fail to Stop Flooding",
    publisher: "PCIJ Special Coverage",
    publisherColor: "#a855f7",
    amount: 545_000_000_000,
    summary: "Despite over half a trillion pesos allocated across nearly 10,000 DPWH flood control projects from 2022 to 2025, devastating floods continue to paralyze Central Luzon and Metro Manila.",
    url: "https://pcij.org/flood-control/",
    tags: ["Flood Control", "PCIJ Investigation", "DPWH", "Budget Tracking"]
  },
  {
    id: 'ln-2',
    caseId: 11,
    date: '2024-09-06',
    title: "PCIJ Investigation: Top Contractors Monopolize Billions in Flood Control Contracts",
    publisher: "PCIJ",
    publisherColor: "#e5534b",
    amount: 180_000_000_000,
    summary: "PCIJ analysis reveals how a small group of preferred construction firms captured a disproportionate share of DPWH river dredging and dike projects while communities remain underwater.",
    url: "https://pcij.org/flood-control/",
    tags: ["Contractors", "PCIJ", "Flood Control", "Monopoly"]
  },
  {
    id: 'ln-3',
    caseId: 5,
    date: '2023-01-19',
    title: "COA and Senate Probe: ₱2.4B DepEd Bayanihan 2 Laptops Contract Overpriced by ₱979M",
    publisher: "COA / Senate Records",
    publisherColor: "#1565c0",
    amount: 2_400_000_000,
    summary: "State auditors and the Senate Blue Ribbon Committee flagged the procurement of overpriced and slow Celeron laptops for public school teachers through the Procurement Service-DBM.",
    url: "https://en.wikipedia.org/wiki/Bayanihan_to_Recover_as_One_Act",
    tags: ["DepEd", "Bayanihan 2", "Procurement Overprice", "COA Audit"]
  },
  {
    id: 'ln-4',
    caseId: 11,
    date: '2024-08-10',
    title: "PCIJ Public Records: DPWH Flood Mitigation Budget Data from 2022 to 2025",
    publisher: "PCIJ Investigation",
    publisherColor: "#ff7043",
    amount: 545_000_000_000,
    summary: "PCIJ published an open dataset detailing project descriptions, contract amounts, and contractor allocations across all regional engineering districts in the Philippines.",
    url: "https://pcij.org/flood-control/",
    tags: ["Open Data", "PCIJ", "DPWH Records", "Accountability"]
  },
  {
    id: 'ln-5',
    caseId: null,
    date: '2024-06-11',
    title: "COA Annual Financial Audit: Overview of Suspensions and Disallowances in State Agencies",
    publisher: "Commission on Audit",
    publisherColor: "#22c55e",
    amount: 112_000_000_000,
    summary: "The Commission on Audit's constitutional mandate and annual financial reporting tracks unliquidated cash advances, notices of disallowance, and emergency procurement lapses across all government departments.",
    url: "https://en.wikipedia.org/wiki/Commission_on_Audit_(Philippines)",
    tags: ["COA Mandate", "State Audit", "Public Spending", "Constitutional Body"]
  },
  {
    id: 'ln-6',
    caseId: null,
    date: '2024-07-10',
    title: "Senate & Quad-Committee Inquiry: Alice Guo and the Bamban POGO Hub Laundering Complex",
    publisher: "House & Senate Inquiries",
    publisherColor: "#06b6d4",
    amount: 6_100_000_000,
    summary: "Legislative inquiries and anti-money laundering investigations exposed how the 7.9-hectare Baofu POGO compound in Bamban was financed through fraudulent identities, dummy corporations, and foreign remittances.",
    url: "https://en.wikipedia.org/wiki/Alice_Guo",
    tags: ["Alice Guo", "POGO Inquiry", "AMLC Freeze", "Quad-Committee"]
  },
  {
    id: 'ln-7',
    caseId: 12,
    date: '2024-09-25',
    title: "House Good Government Inquiry: Questionable OVP & DepEd Confidential Fund Liquidation",
    publisher: "Rappler / House Records",
    publisherColor: "#e5534b",
    amount: 612_500_000,
    summary: "House panel scrutinizes acknowledgment receipts submitted by the Office of the Vice President and DepEd to COA, noting suspicious recipients, missing documentation, and rapid cash disbursements.",
    url: "https://www.rappler.com/topic/confidential-funds/",
    tags: ["Confidential Funds", "House Inquiry", "OVP", "DepEd"]
  },
  {
    id: 'ln-8',
    caseId: 3,
    date: '2024-08-15',
    title: "Rappler Special Report: PhilHealth ₱15B IRM Releases and Reserve Fund Controversies",
    publisher: "Rappler / COA",
    publisherColor: "#3b82f6",
    amount: 15_000_000_000,
    summary: "Comprehensive reporting on PhilHealth's emergency Interim Reimbursement Mechanism (IRM) disbursements to non-COVID hospitals, alongside controversies over the transfer of billions in excess reserve funds.",
    url: "https://www.rappler.com/topic/philhealth/",
    tags: ["PhilHealth", "IRM Inquiry", "Healthcare Funds", "COA"]
  },
  {
    id: 'ln-9',
    caseId: 1,
    date: '2024-05-08',
    title: "Sandiganbayan Dockets: Graft Indictments in ₱8.68B Pharmally Pandemic Deals",
    publisher: "Sandiganbayan / Ombudsman",
    publisherColor: "#a855f7",
    amount: 8_680_000_000,
    summary: "Court dockets trace the graft charges filed against former PS-DBM procurement officials and Pharmally Pharmaceutical Corporation executives for the supply of overpriced medical kits.",
    url: "https://en.wikipedia.org/wiki/Pharmally_scandal",
    tags: ["Sandiganbayan", "Pharmally", "PS-DBM", "Graft Indictment"]
  },
  {
    id: 'ln-10',
    caseId: 13,
    date: '2024-01-19',
    title: "Sandiganbayan Decision: Jinggoy Estrada Convicted of Bribery in ₱183M PDAF Case",
    publisher: "Sandiganbayan Fifth Division",
    publisherColor: "#e53935",
    amount: 183_000_000,
    summary: "The anti-graft court found Senator Jinggoy Estrada guilty of direct and indirect bribery in connection with the diversion of his Priority Development Assistance Fund (PDAF) allocations to bogus NGOs.",
    url: "https://en.wikipedia.org/wiki/Jinggoy_Estrada#Corruption_allegations",
    tags: ["Sandiganbayan", "Jinggoy Estrada", "Bribery Conviction", "PDAF"]
  }
];

/* ═══════════════════════════════════════════════════════════════════════════
   INVESTIGATIVE REPORTS FEED (In-depth Journalistic Investigations)
   Sorted NEWEST to OLDEST (at least 10 items). PCIJ, Rappler, Inquirer, GMA.
═══════════════════════════════════════════════════════════════════════════ */
const INVESTIGATIVE_ITEMS = [
  {
    id: 'inv-1',
    caseId: 11,
    date: '2025-05-15',
    title: "PCIJ Special Report: 9,855 Flood-Control Projects Worth Over ₱545B: Where Did the Funds Go?",
    publisher: "PCIJ",
    publisherColor: "#e53935",
    amount: 545_000_000_000,
    summary: "PCIJ investigated 9,855 flood-control projects funded from July 2022 to May 2025 across the Philippines. The forensic analysis tracks billions awarded to top contractor syndicates, persistent project delays, and why Metro Manila and Central Luzon remain vulnerable to devastating seasonal floods.",
    url: "https://pcij.org/flood-control/",
    tags: ["Flood Control", "PCIJ Investigation", "DPWH", "Contractor Scrutiny"]
  },
  {
    id: 'inv-2',
    caseId: 11,
    date: '2024-09-06',
    title: "PCIJ Investigation: Billions for School Buildings Awarded to Flood-Control Contractors",
    publisher: "PCIJ",
    publisherColor: "#a855f7",
    amount: 180_000_000_000,
    summary: "PCIJ's cross-sector investigation revealed that the same favored construction companies winning billions in DPWH flood mitigation projects also secured major DepEd classroom and school infrastructure contracts, concentrating public works capital among a handful of players.",
    url: "https://pcij.org/flood-control/",
    tags: ["PCIJ", "Contractors", "School Buildings", "DPWH"]
  },
  {
    id: 'inv-3',
    caseId: 12,
    date: '2024-09-25',
    title: "Rappler In-Depth: The ₱612.5M Confidential Funds Trail and Fictitious Acknowledgment Receipts",
    publisher: "Rappler",
    publisherColor: "#e5534b",
    amount: 612_500_000,
    summary: "In-depth investigative coverage into the ₱612.5M in confidential funds allocated to the Office of the Vice President and DepEd. Rappler details COA's ₱73.28M notice of disallowance and House testimonies exposing acknowledgment receipts bearing bogus names like 'Mary Grace Piattos'.",
    url: "https://www.rappler.com/topic/confidential-funds/",
    tags: ["Confidential Funds", "Rappler Investigation", "OVP", "COA Audit"]
  },
  {
    id: 'inv-4',
    caseId: null,
    date: '2024-07-10',
    title: "The Bamban POGO Dossier: Alice Guo, Baofu Compound, and Transnational Money Laundering",
    publisher: "Senate & Public Inquiries",
    publisherColor: "#a855f7",
    amount: 6_100_000_000,
    summary: "A comprehensive case dossier documenting how a 7.9-hectare luxury POGO hub was constructed behind the Bamban municipal hall, examining forged identity records, shell corporations, human trafficking compounds, and AMLC asset freeze proceedings.",
    url: "https://en.wikipedia.org/wiki/Alice_Guo",
    tags: ["Alice Guo", "POGO Dossier", "Money Laundering", "Senate Probe"]
  },
  {
    id: 'inv-5',
    caseId: 5,
    date: '2023-01-19',
    title: "The Bayanihan 2 Laptops Dossier: ₱2.4B Procurement Overpriced by ₱979M for Teachers",
    publisher: "Senate Blue Ribbon / COA",
    publisherColor: "#e5534b",
    amount: 2_400_000_000,
    summary: "An investigation detailing how PS-DBM procurement officials altered unit specifications to buy antiquated Celeron laptops at ₱58,300 each, costing the government nearly ₱1B in excess funds while depriving 30,000 public school teachers.",
    url: "https://en.wikipedia.org/wiki/Bayanihan_to_Recover_as_One_Act",
    tags: ["DepEd", "Laptops", "PS-DBM", "Procurement Fraud"]
  },
  {
    id: 'inv-6',
    caseId: 4,
    date: '2023-09-15',
    title: "PCGG Four Decades Later: ₱280B Recovered, with Major Ill-Gotten Wealth Cases in Court",
    publisher: "PCGG / Official Records",
    publisherColor: "#ff7043",
    amount: 280_000_000_000,
    summary: "PCGG reports ₱280B in total Marcos-era asset recoveries since its creation in 1986. An in-depth review of disputed jewelry, artworks, Swiss bank accounts, and why key civil forfeiture cases remain in active litigation.",
    url: "https://en.wikipedia.org/wiki/Presidential_Commission_on_Good_Government",
    tags: ["PCGG", "Marcos Wealth", "Asset Recovery", "Treasury"]
  },
  {
    id: 'inv-7',
    caseId: 7,
    date: '2022-06-20',
    title: "The Kaliwa Dam Dossier: Why Water Consumers Shoulder ₱845M in Counterpart Costs",
    publisher: "COA / Investigative Records",
    publisherColor: "#e53935",
    amount: 845_710_000,
    summary: "How MWSS required private concessionaires Manila Water and Maynilad to advance ₱845.71M for Chinese loan counter-funding, creating costs destined to be passed on to everyday water consumers via future tariff adjustments.",
    url: "https://en.wikipedia.org/wiki/Kaliwa_Dam",
    tags: ["MWSS", "Kaliwa Dam", "COA Audit", "Consumer Impact"]
  },
  {
    id: 'inv-8',
    caseId: 1,
    date: '2021-10-15',
    title: "Pharmally: The Forensic Reconstruction of an ₱8.68B Pandemic Supply Scandal",
    publisher: "Senate Blue Ribbon / Public Records",
    publisherColor: "#a855f7",
    amount: 8_680_000_000,
    summary: "An exhaustive reconstruction of how Pharmally Pharmaceutical Corporation, capitalized at only ₱625,000, was awarded ₱8.68B in COVID medical supply contracts, with evidence of overpricing, substandard goods, and official complicity.",
    url: "https://en.wikipedia.org/wiki/Pharmally_scandal",
    tags: ["Pharmally", "COVID-19", "Procurement", "Investigation"]
  },
  {
    id: 'inv-9',
    caseId: 8,
    date: '2021-09-28',
    title: "COA Special Audit: ₱67.3B in DOH COVID-19 Emergency Funds Flagged for Deficiencies",
    publisher: "COA / Rappler",
    publisherColor: "#e5534b",
    amount: 67_300_000_000,
    summary: "COA released a special audit finding deficiencies in ₱67.3B in DOH COVID-19 funds, including ₱41B transferred to PS-DBM with incomplete documentation and about ₱12B in unspent funds, the same pool from which emergency contracts were drawn.",
    url: "https://www.rappler.com/topic/pharmally/",
    tags: ["COA", "DOH", "COVID-19", "Audit Deficiencies"]
  },
  {
    id: 'inv-10',
    caseId: 2,
    date: '2018-12-07',
    title: "Anatomy of a Plunder Conviction: The ₱10B PDAF Scam and Napoles NGO Network",
    publisher: "Sandiganbayan / Public Records",
    publisherColor: "#a855f7",
    amount: 10_000_000_000,
    summary: "The definitive case dossier detailing how Janet Lim-Napoles coordinated with lawmakers and departmental fixers to divert ₱10B through 20 bogus NGOs, leading to the landmark 2018 plunder conviction in Sandiganbayan.",
    url: "https://en.wikipedia.org/wiki/Priority_Development_Assistance_Fund_scam",
    tags: ["Sandiganbayan", "PDAF", "Plunder Conviction", "Napoles Network"]
  }
];

// Backwards compatibility alias
const ACCOUNTABILITY_ITEMS = INVESTIGATIVE_ITEMS;

