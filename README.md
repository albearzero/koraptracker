# ⚖️ Korap Tracker

> **Documenting Stolen Public Funds & Civic Accountability in the Philippines**

Korap Tracker is an independent, non-partisan, open-source civic-technology platform tracking public funds lost to corruption in the Philippines in real time. Every number is backed by official Commission on Audit (COA) audit reports, Sandiganbayan court dockets, Senate Blue Ribbon Committee resolutions, and verified investigative reporting.

---

## 📌 Features

- **Live Systemic Loss Ticker**: Real-time counter based on the 20% procurement leakage benchmark established by the United Nations Office on Drugs and Crime (UNODC) and the World Bank.
- **Hall of Records (Case Registry)**: Categorized database of documented corruption cases with court citations, docket numbers, and official audit findings.
- **Human Cost Calculator**: Translates abstract billions into concrete public goods (classrooms, hospital admissions, scholarships, medicine packs, and subsidized rice).
- **Multi-Currency Converter**: Real-time conversion across Philippine Peso (PHP), US Dollar (USD), Euro (EUR), Japanese Yen (JPY), British Pound (GBP), and Singapore Dollar (SGD).
- **Accountability & Intel Feeds**: Interactive feed of legal milestones, investigative journalism dossiers, and breaking news.
- **Verified Sources & Citation Registry**: 100% verified primary sources with zero 404 links.

---

## 🚀 Running Locally

This project is built using vanilla HTML5, modern CSS, and performant vanilla JavaScript with zero external runtime dependencies.

```bash
# Clone the repository
git clone https://github.com/albearzero/koraptracker.git
cd koraptracker

# Start any local HTTP server
python3 -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## 🛠️ Verification Suite

To verify the integrity and active HTTP status (zero 404s) of all source citations:

```bash
node scripts/verify-sources.js
```

To list registered cases:

```bash
node scripts/site-updater.js list
```

---

## 📜 License

Open source under the [MIT License](LICENSE) · Built to inform, educate, and demand civic accountability.
