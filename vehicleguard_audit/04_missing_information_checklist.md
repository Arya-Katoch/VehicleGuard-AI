# VehicleGuard AI — Missing Information & Manual Completion Register

**Audit Date:** October 14, 2026  
**Status:** High-Priority Action Items for Final Thesis / Research Paper Submission  

This register contains every field across the report tables that **cannot be automatically extracted from the source code, repository files, or database execution**, following the required prioritization rules.

---

## Priority 1: Plagiarism & Similarity Report Details (Appendix A)

| Field Name | Table | Why Unavailable | Exact Information Required | How to Obtain | Priority | Suggested Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Plagiarism Tool Used** | Appendix A | No plagiarism report file or certificate exists in the codebase directory. | Official anti-plagiarism software name (e.g., Turnitin, DrillBit, Urkund/Ouriginal). | Run the finalized thesis text through your university's official plagiarism portal. | **MANDATORY** | `[MANUAL INPUT: Plagiarism Checker Name, e.g., Turnitin]` |
| **Date of Check** | Appendix A | No similarity check has been recorded or logged. | Exact date when the similarity check was executed. | Date stamped on the similarity certificate. | **MANDATORY** | `[MANUAL INPUT: DD-MM-YYYY]` |
| **Overall Similarity Index** | Appendix A | Requires institution-level scanning of thesis text. | Overall percentage similarity index (e.g., `< 10%` or `< 15%` as required by university guidelines). | Check first page summary of Turnitin / DrillBit PDF. | **MANDATORY** | `[MANUAL INPUT: Overall % Similarity, e.g., 8.5%]` |
| **Max Similarity with Single Source** | Appendix A | Requires source match breakdown report. | Percentage match with highest individual web or publication source (typically must be `< 3%` or `< 5%`). | Turnitin match breakdown list. | **MANDATORY** | `[MANUAL INPUT: Max Single Source %, e.g., 2.1%]` |
| **Report Attachment Page** | Appendix A | Final PDF pagination is not yet compiled. | Page number or Appendix section where the plagiarism certificate is bound. | Note the final PDF page number before binding. | **MANDATORY** | `[MANUAL INPUT: Page Number, e.g., Page 78]` |

---

## Priority 2: Literature Search Strategy & Screening Counts (Table 2.2)

| Field Name | Table | Why Unavailable | Exact Information Required | How to Obtain | Priority | Suggested Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Databases Searched** | Table 2.2 | Repository contains software implementation, not academic search logs. | Exact bibliographic databases queried (e.g., IEEE Xplore, ScienceDirect, ACM Digital Library, SpringerLink, Google Scholar). | Document your literature review search protocol. | **MANDATORY** | `[MANUAL INPUT: IEEE Xplore, ScienceDirect, ACM DL]` |
| **Search Queries & Syntax** | Table 2.2 | Exact Boolean search strings used during literature review were not archived. | Full search strings with Boolean operators (e.g., `("vehicle telemetry" OR "CAN-Bus") AND ("anomaly detection") AND ("unsupervised")`). | Copy from your research notes or literature search log. | **MANDATORY** | `[MANUAL INPUT: Exact Boolean Query String]` |
| **Search Date Range** | Table 2.2 | Search execution dates not logged. | Date range during which literature retrieval was performed (e.g., 2018–2026). | Review your literature search logs. | **MANDATORY** | `[MANUAL INPUT: Search Period, e.g., Jan 2020 – Aug 2026]` |
| **PRISMA Record Counts** | Table 2.2 | No record count spreadsheets or screening files in repo. | Exact numerical counts for: (1) Initial records identified, (2) Duplicates removed, (3) Title/Abstract screened, (4) Full-text assessed, (5) Final studies included. | Compile PRISMA flow diagram counts from your reference manager (Zotero/Mendeley). | **MANDATORY** | `[MANUAL INPUT: PRISMA Screening Counts: N_total, N_screened, N_included]` |

---

## Priority 3: Human Task Division & Project Administration (Table 1.1 & Table 3.12)

| Field Name | Table | Why Unavailable | Exact Information Required | How to Obtain | Priority | Suggested Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Guide / Supervisor** | Table 1.1 | Faculty supervisor name is not recorded in Git commit records. | Full name, academic title, and department of the faculty research guide / capstone supervisor. | Obtain from college project allocation letter or department guide allotment list. | **MANDATORY** | `[MANUAL INPUT: Faculty Guide Name & Title]` |
| **Team Member Assignments** | Table 1.1 | Git commits show single author `Arya Katoch <aryakatoch@gmail.com>`. | If this was a solo project, confirm "Sole Contributor". If a team project, list co-authors, USN/Roll numbers, and task division. | Verify with your departmental final year project coordinator. | **MANDATORY** | `[MANUAL CONFIRMATION: Sole Developer vs Team Members]` |
| **Department / College Name** | Table 1.1 | Document header states "B.E. CSE Final Year", but institution name is omitted. | College / Institution Name and University affiliation (e.g., VTU, SPPU, Anna Univ, etc.). | Check official college thesis title page format. | **MANDATORY** | `[MANUAL INPUT: Institution Name & Affiliated University]` |
| **Milestone Review Dates** | Table 1.1 | Departmental presentation milestones are not in repository. | Exact dates for: Phase 1 Review, Mid-term Evaluation, Pre-submission Viva, and Final Defense. | Check project logbook or departmental review schedule. | **MANDATORY** | `[MANUAL INPUT: Review Dates Phase 1/2/3]` |

---

## Priority 4: Test Results & Physical Vehicle Hardware Benchmarks

| Field Name | Table | Why Unavailable | Exact Information Required | How to Obtain | Priority | Suggested Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Live In-Vehicle CAN Interface** | Table 3.2, 4.12 | System was verified via telemetry CSV playback; physical OBD-II dongle hardware (e.g., ELM327 / Macchina M2 / CANable) was not interfaced during test. | Physical hardware transceiver specifications if in-vehicle road testing was conducted. | State whether project scope was strictly offline/streaming CSV analytics or included live vehicle road trials. | **OPTIONAL** | `[SCOPE BOUNDARY: Offline Telematics & Simulated Stream Validated; In-Vehicle Dongle Future Work]` |
| **Edge Hardware Benchmarks** | Table 3.2, 4.1 | Tested on host AMD Ryzen 5 5600H CPU; embedded ECU/Raspberry Pi benchmarks not performed. | Benchmarking results on embedded hardware (e.g., Raspberry Pi 4 / Nvidia Jetson Nano) if required by examiners. | Run `backend/ml_engine.py` on an edge device if physical deployment is claimed. | **OPTIONAL** | `[MANUAL BENCHMARK: Edge Runtimes if tested on Raspberry Pi / Jetson]` |

---

## Priority 5: Reference Bibliography & Access Dates (Table 2.3, Appendix H)

| Field Name | Table | Why Unavailable | Exact Information Required | How to Obtain | Priority | Suggested Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Literature DOIs & Exact Publication Details** | Table 2.3 | Algorithmic foundational papers (Isolation Forest, LOF, One-Class SVM) are known, but specific telematics papers cited in your report must match your bibliography. | Exact author list, journal/conference name, volume, issue, year, and DOI for all cited papers. | Cross-reference with your thesis Chapter 2 reference section. | **MANDATORY** | `[VERIFY AGAINST REPORT BIBLIOGRAPHY: Ref [1] to [N]]` |
| **Online Dataset Access Dates** | Table 4.11 | `Telematicsdata.csv` source URL/repository access date is not in metadata. | Date when `Telematicsdata.csv` was originally acquired/downloaded from the data repository (e.g., Kaggle / GitHub / OEM repository). | Check download history or dataset source documentation. | **RECOMMENDED** | `[MANUAL INPUT: Dataset Download Date, e.g., 15-Aug-2026]` |

---

## Priority 6: Report Page References & Final Formatting (Appendix A–H)

| Field Name | Table | Why Unavailable | Exact Information Required | How to Obtain | Priority | Suggested Placeholder |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Chapter & Section Page Numbers** | All Tables | Page numbers depend on word processor compilation (LaTeX or Microsoft Word). | Final page numbers matching Table of Contents. | Compile final document and update all cross-references. | **MANDATORY** | `[MANUAL INPUT: Page XX]` |
| **Declaration & Certificate Signatures** | Preliminaries | Official signature pages require handwritten/digital sign-offs. | Signatures of Student, Project Guide, Head of Department (HOD), and External Examiner. | Print official certificate pages and obtain signatures. | **MANDATORY** | `[MANUAL ACTION: Obtain Guide & HOD Signatures]` |

---

## Summary of Checklist Actions

```
[ ] Step 1: Run final thesis text through University Turnitin/DrillBit portal and paste similarity stats into Appendix A.
[ ] Step 2: Fill in PRISMA literature search counts in Table 2.2 using your reference collection records.
[ ] Step 3: Insert official Faculty Guide name and Department Review milestone dates into Table 1.1.
[ ] Step 4: Verify cited literature references in Table 2.3 match your thesis Bibliography list.
[ ] Step 5: Update all Table of Contents page cross-references once Microsoft Word / LaTeX PDF is compiled.
```
