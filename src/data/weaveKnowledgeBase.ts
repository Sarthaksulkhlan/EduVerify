/**
 * EduVerify Curated Hardcoded Knowledge Base (SIH26263)
 * Offline-first, deterministic question answering with zero external LLM / API key dependencies.
 */

export interface KnowledgeEntry {
  id: string;
  category:
    | 'understanding'
    | 'imports'
    | 'validation'
    | 'duplicates'
    | 'intake'
    | 'verification'
    | 'security'
    | 'dashboard';
  categoryLabel: string;
  canonicalQuestion: string;
  synonyms: string[];
  answer: string;
  relatedIds?: string[];
  followUpQuestions?: string[];
}

export const WEAVE_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ==========================================
  // Category 1 — Understanding EduVerify
  // ==========================================
  {
    id: 'und-01',
    category: 'understanding',
    categoryLabel: 'Understanding EduVerify',
    canonicalQuestion: 'What is EduVerify?',
    synonyms: [
      'what is weave',
      'about weave',
      'what does weave do',
      'explain weave platform',
      'overview of weave',
    ],
    answer:
      'EduVerify is an institutional student data management and record verification platform designed for Smart India Hackathon problem statement SIH26263. It connects AICTE-approved technical institutions, regulators, and authorized verification workflows to ensure academic records are consistent, deduplicated, and cryptographically verifiable.',
    relatedIds: ['und-02', 'und-03', 'und-05'],
    followUpQuestions: [
      'What problem does EduVerify solve?',
      'What does "academic records connected by trust" mean?',
      'Who uses EduVerify?',
    ],
  },
  {
    id: 'und-02',
    category: 'understanding',
    categoryLabel: 'Understanding EduVerify',
    canonicalQuestion: 'What problem does EduVerify solve?',
    synonyms: [
      'problem statement',
      'why weave',
      'what problem are you solving',
      'pain points',
      'why was weave created',
    ],
    answer:
      'Technical education in India faces three major record-governance challenges:\n1. **Fragmented rosters:** Institutions maintain disconnected admission spreadsheets with inconsistent program codes and formatting.\n2. **Multi-round counselling collisions:** Students frequently accept provisional seats at multiple campuses, creating uncoordinated double-enrolments.\n3. **Opaque verification:** Employers, scholarship boards, and credit bodies lack a minimal-disclosure method to verify genuine enrolment without exposing raw identifiers.',
    relatedIds: ['und-01', 'dup-01', 'int-01'],
    followUpQuestions: [
      'What is SIH26263?',
      'How does duplicate detection work?',
      'What is approved intake monitoring?',
    ],
  },
  {
    id: 'und-03',
    category: 'understanding',
    categoryLabel: 'Understanding EduVerify',
    canonicalQuestion: 'What is SIH26263?',
    synonyms: [
      'sih problem',
      'sih26263',
      'problem code',
      'hackathon problem statement',
      'smart india hackathon',
    ],
    answer:
      'SIH26263 is a Smart India Hackathon problem statement focused on developing an APAAR-based student data management, intake tracking, and record verification platform for AICTE-approved institutions.',
    relatedIds: ['und-01', 'und-04'],
    followUpQuestions: [
      'Does EduVerify directly connect to government APAAR servers?',
      'Who uses EduVerify?',
    ],
  },
  {
    id: 'und-04',
    category: 'understanding',
    categoryLabel: 'Understanding EduVerify',
    canonicalQuestion: 'Who uses EduVerify?',
    synonyms: [
      'user roles',
      'target audience',
      'who is this for',
      'actors',
      'user personas',
    ],
    answer:
      'EduVerify is built for five distinct institutional and regulatory user personas:\n- **Institution Operators:** Upload CSV rosters, inspect row-level format errors, and review batch diagnostics.\n- **Institution Administrators:** Commit eligible batch rows and issue signed Ed25519 student enrolment attestations.\n- **Regulator Officers:** Adjudicate cross-institution APAAR duplicate candidates with documented decision histories.\n- **Regulator Directorate Admins:** Oversee national intake caps, monitor compliance across institutions, and govern program registries.\n- **Auditors:** Inspect tamper-evident SHA-256 hash chains and cryptographic verification logs.',
    relatedIds: ['dash-04', 'dash-05', 'dash-06'],
    followUpQuestions: [
      'What is the difference between an institution operator and an administrator?',
      'What can a regulator do?',
    ],
  },
  {
    id: 'und-05',
    category: 'understanding',
    categoryLabel: 'Understanding EduVerify',
    canonicalQuestion: 'What makes EduVerify different from a spreadsheet or SIS?',
    synonyms: [
      'how is this different from excel',
      'why not use excel',
      'difference from spreadsheet',
      'why weave over erp',
    ],
    answer:
      'Unlike isolated spreadsheets or generic ERPs, EduVerify enforces:\n1. **Deterministic rulesets:** Immediate verification against sanctioned AICTE program codes and format rules.\n2. **Privacy by design:** Automated masking (`****-****-XXXX`) and salted SHA-256 hashing so raw APAARs are never stored in plaintext.\n3. **Cross-institutional conflict queues:** Automatic discovery of students enrolled at two competing campuses without sharing sensitive student profiles.\n4. **Verifiable credentials:** Ed25519 digitally signed attestations that third parties can verify without database access.',
    relatedIds: ['val-01', 'dup-01', 'ver-01'],
    followUpQuestions: [
      'What is data validation in EduVerify?',
      'How does student-record verification work?',
    ],
  },
  {
    id: 'und-06',
    category: 'understanding',
    categoryLabel: 'Understanding EduVerify',
    canonicalQuestion: 'What does "academic records connected by trust" mean?',
    synonyms: [
      'connected by trust',
      'trust philosophy',
      'core tagline',
      'meaning of headline',
    ],
    answer:
      'It means academic credentials should carry mathematical and cryptographic trust rather than relying on phone calls, physical paper seals, or blind faith. By verifying records deterministically at intake and issuing tamper-evident attestations, institutions and regulators establish transparency without violating privacy.',
    relatedIds: ['ver-01', 'sec-01'],
    followUpQuestions: [
      'How does student-record verification work?',
      'What is an explainable validation rule?',
    ],
  },

  // ==========================================
  // Category 2 — Student Records and Imports
  // ==========================================
  {
    id: 'imp-01',
    category: 'imports',
    categoryLabel: 'Student Records & Imports',
    canonicalQuestion: 'How do I import student records?',
    synonyms: [
      'import csv',
      'upload student records',
      'upload roster',
      'how to import',
      'csv ingestion',
    ],
    answer:
      'To import student records:\n1. Navigate to **Student records → Import batches** or click **Import CSV Batch** from the top header.\n2. Select your file or paste CSV text into the preflight wizard.\n3. Ensure your file contains the 7 required columns (`student_ref`, `apaar_id`, `full_name`, `dob`, `program_code`, `enrollment_year`, `consent_granted`).\n4. Review the instant preflight summary and click **Upload & Run Deterministic Validation**.',
    relatedIds: ['imp-02', 'imp-03', 'imp-04'],
    followUpQuestions: [
      'Which file formats are supported?',
      'What information should an import contain?',
      'What happens after a file is uploaded?',
    ],
  },
  {
    id: 'imp-02',
    category: 'imports',
    categoryLabel: 'Student Records & Imports',
    canonicalQuestion: 'Which file formats are supported?',
    synonyms: [
      'file types',
      'supported formats',
      'can i upload excel',
      'csv or xlsx',
      'accepted files',
    ],
    answer:
      'EduVerify currently supports standard UTF-8 encoded **CSV (.csv)** files with comma separators and quoted text fields. Direct Excel (.xlsx) parsing is slated for future release; please export your spreadsheet to CSV prior to upload.',
    relatedIds: ['imp-01', 'imp-03'],
    followUpQuestions: [
      'What information should an import contain?',
      'How should institutions prepare their data?',
    ],
  },
  {
    id: 'imp-03',
    category: 'imports',
    categoryLabel: 'Student Records & Imports',
    canonicalQuestion: 'What information should an import contain?',
    synonyms: [
      'required columns',
      'csv schema',
      'import format',
      'csv template',
      'expected headers',
    ],
    answer:
      'An import file must contain exactly these 7 header columns:\n- `student_ref`: Institutional roll or admission number (e.g. `STU-2026-101`).\n- `apaar_id`: 12-digit synthetic APAAR identifier starting with 2–9.\n- `full_name`: Candidate legal name.\n- `dob`: ISO date of birth `YYYY-MM-DD`.\n- `program_code`: Sanctioned AICTE discipline (e.g. `BTECH-CSE`, `MTECH-AI`).\n- `enrollment_year`: 4-digit academic year (e.g. `2026`).\n- `consent_granted`: `true` or `false` indicating documented student consent.\n\n*Note: Columns labelled `aadhaar` or `uid` are rejected by privacy policy.*',
    relatedIds: ['imp-01', 'val-02'],
    followUpQuestions: [
      'Why was a student record flagged?',
      'What happens when validation fails?',
    ],
  },
  {
    id: 'imp-04',
    category: 'imports',
    categoryLabel: 'Student Records & Imports',
    canonicalQuestion: 'What happens after a file is uploaded?',
    synonyms: [
      'upload lifecycle',
      'batch pipeline',
      'what happens next',
      'after upload',
    ],
    answer:
      'After upload, EduVerify executes Ruleset 2026.10.v1 immediately:\n1. **Format verification:** Checks APAAR format and masks it to `****-****-XXXX`.\n2. **Program check:** Validates `program_code` against sanctioned AICTE codes.\n3. **Age & Year check:** Ensures date of birth and enrollment year meet academic guidelines.\n4. **Conflict detection:** Flags intra-batch and cross-institution duplicate digests.\n5. **Intake check:** Compares batch volume against sanctioned seat capacity.',
    relatedIds: ['val-01', 'dup-01', 'int-01'],
    followUpQuestions: [
      'What is an explainable validation rule?',
      'How do I commit eligible rows?',
    ],
  },
  {
    id: 'imp-05',
    category: 'imports',
    categoryLabel: 'Student Records & Imports',
    canonicalQuestion: 'What is a batch in EduVerify?',
    synonyms: [
      'what is a batch',
      'batch definition',
      'batch concept',
      'import batch',
    ],
    answer:
      'A batch represents a single uploaded admission roster (e.g., `BAT-2026-003`). Batches track total rows, rows that passed validation, rows with warnings or duplicate flags, and rows that failed. Eligible verified rows can be committed to the institutional registry in bulk.',
    relatedIds: ['imp-01', 'imp-06'],
    followUpQuestions: [
      'How do I commit eligible rows of a batch?',
      'What happens if an import fails?',
    ],
  },
  {
    id: 'imp-06',
    category: 'imports',
    categoryLabel: 'Student Records & Imports',
    canonicalQuestion: 'How do I commit eligible rows of a batch?',
    synonyms: [
      'commit batch',
      'commit eligible rows',
      'how to commit',
      'finalize batch',
    ],
    answer:
      'Open the batch in **Student records → Import batches → Inspect Batch**, review the summary cards, and click the dark green **Commit Eligible Rows** button. Only records that passed all deterministic validation checks are committed. Flagged and failed rows remain isolated.',
    relatedIds: ['imp-05', 'val-04'],
    followUpQuestions: [
      'Can I correct an imported record?',
      'Where can I review unresolved conflicts?',
    ],
  },

  // ==========================================
  // Category 3 — Validation and Data Quality
  // ==========================================
  {
    id: 'val-01',
    category: 'validation',
    categoryLabel: 'Validation & Data Quality',
    canonicalQuestion: 'What is data validation in EduVerify?',
    synonyms: [
      'what is validation',
      'validation engine',
      'ruleset',
      'ruleset 2026.10.v1',
      'deterministic rules',
    ],
    answer:
      'Data validation in EduVerify is an automated, deterministic ruleset (Ruleset `2026.10.v1`) that evaluates incoming student rows against 6 standardized rules (STU-001 through STU-006). It verifies identifier structure, sanctioned discipline codes, academic age windows, and cross-institution uniqueness before records enter the official registry.',
    relatedIds: ['val-02', 'val-03'],
    followUpQuestions: [
      'Why was a student record flagged?',
      'What is an explainable validation rule?',
    ],
  },
  {
    id: 'val-02',
    category: 'validation',
    categoryLabel: 'Validation & Data Quality',
    canonicalQuestion: 'Why was a student record flagged or rejected?',
    synonyms: [
      'why did validation fail',
      'flagged record',
      'validation failed',
      'record error',
      'row error',
    ],
    answer:
      'A record is flagged or failed if it violates any deterministic rule:\n- **STU-001:** Invalid APAAR format (must be 12 digits starting with 2–9).\n- **STU-002:** Unregistered program code (e.g. `BTECH-ASTRO` is not in the institution sanctioned registry).\n- **STU-003:** Date of birth outside standard academic age window (15–35 years).\n- **STU-004:** Duplicate APAAR or roll number within the same uploaded file.\n- **STU-005:** APAAR digest collision with an active enrolment at another campus.\n- **STU-006:** Enrolment would exceed AICTE sanctioned intake capacity.',
    relatedIds: ['val-01', 'val-03', 'val-04'],
    followUpQuestions: [
      'How do I resolve rule STU-002?',
      'Can validation errors be corrected?',
    ],
  },
  {
    id: 'val-03',
    category: 'validation',
    categoryLabel: 'Validation & Data Quality',
    canonicalQuestion: 'How do I resolve rule STU-002 (RULE-PROG-CODE)?',
    synonyms: [
      'fix stu 002',
      'stu-002 error',
      'program code error',
      'unregistered program',
      'invalid program code',
    ],
    answer:
      'Rule STU-002 flags program codes that do not exist in the approved AICTE discipline registry for your institution. To resolve:\n1. Inspect the affected row in the batch diagnostics drawer.\n2. Map the local department designation to the approved AICTE code (e.g. change `BTECH-ASTRO` to `BTECH-ME` or `BTECH-CSE`).\n3. If your institution received an AICTE approval letter for a new branch, request your Administrator to update the Program Registry under **Oversight → Institutions and programs**.',
    relatedIds: ['val-02', 'int-03'],
    followUpQuestions: [
      'What is the Program and Sanctioned Intake Registry?',
      'Can validation errors be corrected?',
    ],
  },
  {
    id: 'val-04',
    category: 'validation',
    categoryLabel: 'Validation & Data Quality',
    canonicalQuestion: 'Can validation errors be corrected?',
    synonyms: [
      'fix validation errors',
      'correct a record',
      'edit student record',
      're-upload failed rows',
    ],
    answer:
      'Yes. In the Batch Validation screen, click **Download Error Report (.CSV)**. This downloads a CSV containing only the flagged and failed rows with error descriptions. Correct the data in your spreadsheet and upload the corrected rows as a supplemental batch.',
    relatedIds: ['imp-01', 'val-02'],
    followUpQuestions: [
      'How do I check the status of an import?',
      'What is an explainable validation rule?',
    ],
  },
  {
    id: 'val-05',
    category: 'validation',
    categoryLabel: 'Validation & Data Quality',
    canonicalQuestion: 'What is an explainable validation rule?',
    synonyms: [
      'explainable validation',
      'why explainable',
      'no black box',
      'rule transparency',
    ],
    answer:
      'In EduVerify, no record is ever rejected by an opaque algorithm or black-box LLM. Every evaluation returns:\n- The exact rule code (e.g. `STU-001`).\n- The affected field.\n- Expected criteria versus actual masked values.\n- Concrete remediation steps.',
    relatedIds: ['val-01', 'sec-01'],
    followUpQuestions: [
      'What is data validation in EduVerify?',
      'How does duplicate detection work?',
    ],
  },

  // ==========================================
  // Category 4 — Duplicate Detection and Conflicts
  // ==========================================
  {
    id: 'dup-01',
    category: 'duplicates',
    categoryLabel: 'Duplicate Detection & Conflicts',
    canonicalQuestion: 'How does duplicate detection work in EduVerify?',
    synonyms: [
      'duplicate detection',
      'how duplicates work',
      'conflict detection',
      'collision detection',
      'cross institution duplicate',
    ],
    answer:
      'EduVerify computes a cryptographic salted SHA-256 digest of each normalized APAAR identifier upon ingestion. When a batch contains a digest that already exists in the national registry for an overlapping academic year, rule `STU-005` flags a **Cross-Institution Duplicate Candidate** and routes it to the human adjudication queue.',
    relatedIds: ['dup-02', 'dup-03'],
    followUpQuestions: [
      'Does EduVerify automatically merge or delete records?',
      'Why is human review necessary for duplicates?',
    ],
  },
  {
    id: 'dup-02',
    category: 'duplicates',
    categoryLabel: 'Duplicate Detection & Conflicts',
    canonicalQuestion: 'Does EduVerify automatically merge or delete duplicate records?',
    synonyms: [
      'auto delete duplicates',
      'automatic merge',
      'does it auto delete',
      'auto reject conflict',
    ],
    answer:
      '**No, never.** A hash collision is an indicator for review, not proof of fraud or error. During counselling rounds, students frequently switch colleges before withdrawal paperwork settles. Automatically deleting a record could unlawfully strip a student of admission. Resolution requires an authorized officer with documented rationale.',
    relatedIds: ['dup-01', 'dup-03', 'dup-04'],
    followUpQuestions: [
      'How should an administrator or regulator resolve a conflict?',
      'Why is human review necessary?',
    ],
  },
  {
    id: 'dup-03',
    category: 'duplicates',
    categoryLabel: 'Duplicate Detection & Conflicts',
    canonicalQuestion: 'Why is human review necessary for duplicate candidates?',
    synonyms: [
      'why human review',
      'human in the loop',
      'manual review rationale',
      'why not automate conflict',
    ],
    answer:
      'Human adjudication ensures due process. An officer must review counselling seat withdrawal receipts, transfer certificates, or student affidavits before making a legal decision. The system logs the reviewer email, timestamp, and audit justification to the immutable audit timeline.',
    relatedIds: ['dup-02', 'dup-04', 'sec-02'],
    followUpQuestions: [
      'How does a regulator adjudicate a conflict?',
      'What happens after a conflict is resolved?',
    ],
  },
  {
    id: 'dup-04',
    category: 'duplicates',
    categoryLabel: 'Duplicate Detection & Conflicts',
    canonicalQuestion: 'How does an authorized officer resolve a conflict?',
    synonyms: [
      'resolve conflict',
      'adjudicate duplicate',
      'conflict actions',
      'how to resolve a duplicate',
    ],
    answer:
      'Under **Student records → Duplicate review**, an authorized regulator officer can select an open candidate and execute one of three actions:\n1. **Confirm Transfer:** Recognizes valid seat migration and updates primary enrolment to VERIFIED.\n2. **Dismiss as Duplicate:** Rejects secondary roster entry after confirming non-attendance.\n3. **Request Verification:** Places both admissions on hold while requesting verification from the regional AICTE directorate.',
    relatedIds: ['dup-01', 'dup-03'],
    followUpQuestions: [
      'Why is the conflict queue restricted for institution operators?',
      'What happens after a conflict is resolved?',
    ],
  },
  {
    id: 'dup-05',
    category: 'duplicates',
    categoryLabel: 'Duplicate Detection & Conflicts',
    canonicalQuestion: 'Why is the conflict queue restricted or redacted for institution operators?',
    synonyms: [
      'why restricted',
      'counterpart redacted',
      'tenant isolation in conflict',
      'why cannot college see other college',
    ],
    answer:
      'To prevent industrial poaching and protect student privacy, institution-scoped users only see that their student has an active conflict. Counterpart institution names are redacted (`INST-REDACTED`). Only state/national regulators have cross-tenant visibility to review both institutions.',
    relatedIds: ['dup-04', 'sec-01'],
    followUpQuestions: [
      'Who uses EduVerify?',
      'What is data isolation between institutions?',
    ],
  },

  // ==========================================
  // Category 5 — Approved Intake and Enrolment Monitoring
  // ==========================================
  {
    id: 'int-01',
    category: 'intake',
    categoryLabel: 'Approved Intake & Enrolment',
    canonicalQuestion: 'What is approved intake in EduVerify?',
    synonyms: [
      'approved intake',
      'sanctioned seats',
      'seat cap',
      'intake capacity',
      'what is intake',
    ],
    answer:
      'Approved intake is the maximum number of students an institution is legally authorized by AICTE to admit into a specific academic program and batch year (for example, 180 seats in B.Tech Computer Science for AY 2026–27).',
    relatedIds: ['int-02', 'int-03'],
    followUpQuestions: [
      'What is enrolment monitoring?',
      'Why can enrolment totals differ from approved intake?',
    ],
  },
  {
    id: 'int-02',
    category: 'intake',
    categoryLabel: 'Approved Intake & Enrolment',
    canonicalQuestion: 'What is enrolment monitoring?',
    synonyms: [
      'enrolment monitoring',
      'capacity tracking',
      'intake monitoring screen',
      'seat utilization',
    ],
    answer:
      'Enrolment monitoring is EduVerify’s real-time comparison between committed, verified student enrolments and AICTE approved seat caps. It highlights programs approaching full capacity (≥90%), detects over-admission violations (rule STU-006), and provides regulators with cross-institution compliance metrics.',
    relatedIds: ['int-01', 'int-03'],
    followUpQuestions: [
      'What does an intake discrepancy or overflow mean?',
      'How can a regulator review an institution data?',
    ],
  },
  {
    id: 'int-03',
    category: 'intake',
    categoryLabel: 'Approved Intake & Enrolment',
    canonicalQuestion: 'Why can enrolment totals differ from approved intake?',
    synonyms: [
      'intake discrepancy',
      'over enrolment',
      'why over capacity',
      'supernumerary seats',
    ],
    answer:
      'Enrolment can differ from approved intake for several legitimate reasons:\n- **Counselling attrition:** Vacant seats remaining after final mop-up rounds.\n- **Supernumerary quotas:** Government-mandated allocations (EWS, Tuition Fee Waiver, PMSSS, NRI) that exceed normal sanctioned limits.\n- **Pending batch commits:** Students in uploaded rosters that have not yet completed deterministic validation.',
    relatedIds: ['int-01', 'int-02'],
    followUpQuestions: [
      'How does EduVerify flag intake violations?',
      'Where do I find the Program Registry?',
    ],
  },

  // ==========================================
  // Category 6 — Verification, Consent, and Attestations
  // ==========================================
  {
    id: 'ver-01',
    category: 'verification',
    categoryLabel: 'Verification, Consent & Attestations',
    canonicalQuestion: 'How does student-record verification work?',
    synonyms: [
      'how verification works',
      'attestation process',
      'verify student',
      'credential verification',
      'public verifier',
    ],
    answer:
      'Student record verification in EduVerify uses platform-issued, digitally signed Ed25519 attestations:\n1. An institution administrator issues a credential for a verified, consented student.\n2. The platform signs the payload with its Ed25519 private key and assigns an opaque token (e.g., `att-2026-901`).\n3. Verifiers visit `/verify/:token` or scan an opaque QR code to confirm cryptographic signature validity, active consent, and non-revocation without viewing raw identifiers.',
    relatedIds: ['ver-02', 'ver-03', 'ver-04'],
    followUpQuestions: [
      'What does a verification QR code contain?',
      'Can an attestation be revoked?',
      'What is consent-aware verification?',
    ],
  },
  {
    id: 'ver-02',
    category: 'verification',
    categoryLabel: 'Verification, Consent & Attestations',
    canonicalQuestion: 'What does a verification QR code contain?',
    synonyms: [
      'qr code content',
      'what is in the qr',
      'qr payload',
      'does qr leak apaar',
    ],
    answer:
      'A EduVerify QR code contains **only an opaque URL reference** (`https://weave.synth.edu/verify/att-2026-901`). It never encodes raw 12-digit APAAR numbers, student dates of birth, or private contact details, preventing harvesting if printed ID cards or certificates are lost.',
    relatedIds: ['ver-01', 'ver-03', 'sec-01'],
    followUpQuestions: [
      'Can an attestation be revoked?',
      'What is consent-aware verification?',
    ],
  },
  {
    id: 'ver-03',
    category: 'verification',
    categoryLabel: 'Verification, Consent & Attestations',
    canonicalQuestion: 'Can an attestation be revoked?',
    synonyms: [
      'revoke attestation',
      'cancel credential',
      'revocation process',
      'invalidate token',
    ],
    answer:
      'Yes. If a student withdraws admission, transfers institutes, or revokes verification consent, an Institution Administrator can revoke the credential in **Workspace → Settings & Credentials**. Revocation takes effect immediately, updates the public verifier status to `REVOKED`, and appends an auditable event to the hash chain.',
    relatedIds: ['ver-01', 'ver-04'],
    followUpQuestions: [
      'What happens if verification fails?',
      'What is consent-aware verification?',
    ],
  },
  {
    id: 'ver-04',
    category: 'verification',
    categoryLabel: 'Verification, Consent & Attestations',
    canonicalQuestion: 'What is consent-aware verification?',
    synonyms: [
      'student consent',
      'consent granted',
      'dpdp compliance',
      'why consent matters',
    ],
    answer:
      'In compliance with India’s Digital Personal Data Protection (DPDP) principles, EduVerify will not issue or verify an academic attestation unless active student consent is recorded (`consent_granted: true`). When a student revokes consent, external verification requests are blocked.',
    relatedIds: ['ver-01', 'sec-01'],
    followUpQuestions: [
      'Does EduVerify directly connect to government APAAR servers?',
      'How does student-record verification work?',
    ],
  },
  {
    id: 'ver-05',
    category: 'verification',
    categoryLabel: 'Verification, Consent & Attestations',
    canonicalQuestion: 'Does EduVerify directly connect to official APAAR or DigiLocker servers?',
    synonyms: [
      'live apaar connection',
      'digilocker integration',
      'is this official aicte',
      'real government api',
      'is this live data',
    ],
    answer:
      '**No.** EduVerify is an SIH26263 reference implementation and prototype. All data shown is 100% synthetic demonstration data. EduVerify does not connect to live government APAAR, DigiLocker, or AICTE production APIs, and does not claim official government endorsement.',
    relatedIds: ['und-01', 'sec-01'],
    followUpQuestions: [
      'What is SIH26263?',
      'How are identifiers masked?',
    ],
  },

  // ==========================================
  // Category 7 — Security, Privacy, and Audit
  // ==========================================
  {
    id: 'sec-01',
    category: 'security',
    categoryLabel: 'Security & Audit Integrity',
    canonicalQuestion: 'How does EduVerify protect student privacy?',
    synonyms: [
      'privacy protection',
      'data privacy',
      'apaar masking',
      'aadhaar blocking',
      'security features',
    ],
    answer:
      'EduVerify enforces four non-negotiable privacy boundaries:\n1. **Permanent APAAR Masking:** Identifiers are formatted as `****-****-XXXX`; full 12 digits are never returned in client state or tables.\n2. **Aadhaar Header Blocking:** Uploading files with Aadhaar, UID, or national identity columns triggers immediate rejection.\n3. **Tenant Isolation:** Institutions cannot view rosters or identifiers belonging to other colleges.\n4. **In-Memory Sessions:** Access tokens are stored strictly in memory—never in `localStorage` or `sessionStorage`.',
    relatedIds: ['sec-02', 'ver-04'],
    followUpQuestions: [
      'What is the tamper-evident audit timeline?',
      'What is in-memory authentication?',
    ],
  },
  {
    id: 'sec-02',
    category: 'security',
    categoryLabel: 'Security & Audit Integrity',
    canonicalQuestion: 'What is the tamper-evident audit timeline?',
    synonyms: [
      'audit trail',
      'hash chain',
      'sha 256 audit',
      'tamper evident',
      'audit timeline',
    ],
    answer:
      'Every major action (batch ingestion, row commit, duplicate adjudication, attestation issuance, and revocation) generates a cryptographic audit event. Each event includes the SHA-256 hash of the previous event (`previous_hash`), forming a verifiable hash chain. If any historical record is modified, the chain verification detects tampering immediately.',
    relatedIds: ['sec-01', 'und-04'],
    followUpQuestions: [
      'What can an auditor review?',
      'How do I re-verify the audit chain?',
    ],
  },

  // ==========================================
  // Category 8 — Dashboard, Roles, and Guidance
  // ==========================================
  {
    id: 'dash-01',
    category: 'dashboard',
    categoryLabel: 'Dashboard & Navigation',
    canonicalQuestion: 'How do I open the workspace and what should I do first?',
    synonyms: [
      'how to start',
      'getting started',
      'first steps',
      'open workspace',
      'new user guide',
    ],
    answer:
      'Click **Open workspace** from the top header or visit `/app`. On the welcome dashboard, first-time users can choose from three main actions:\n1. **Import student records:** Upload your first student CSV batch.\n2. **Review data issues:** Inspect flagged duplicate or format candidates.\n3. **Monitor enrolment:** Track sanctioned intake utilization.\n\nYou can also explore the 5-step onboarding checklist on the dashboard.',
    relatedIds: ['dash-02', 'imp-01'],
    followUpQuestions: [
      'What does the dashboard show?',
      'What are the user roles in EduVerify?',
    ],
  },
  {
    id: 'dash-02',
    category: 'dashboard',
    categoryLabel: 'Dashboard & Navigation',
    canonicalQuestion: 'What does the workspace dashboard show?',
    synonyms: [
      'dashboard overview',
      'what is on dashboard',
      'metrics on dashboard',
      'workspace contents',
    ],
    answer:
      'The simplified workspace dashboard displays:\n- **Three primary quick-action cards** (Import, Review Issues, Monitor Enrolment).\n- **Key summary counters:** Total student records processed, open conflicts, commit-eligible rows, and sanctioned capacity.\n- **First-time onboarding checklist** with direct jump links.\n- **Recent batch ledger:** Quick status of your last uploads.\n- **Enrolment comparison chart:** Sanctioned seats versus verified students.',
    relatedIds: ['dash-01', 'int-02'],
    followUpQuestions: [
      'How do I switch roles or test demo accounts?',
      'What can a regulator do?',
    ],
  },
  {
    id: 'dash-03',
    category: 'dashboard',
    categoryLabel: 'Dashboard & Navigation',
    canonicalQuestion: 'How do I switch roles or test demo accounts?',
    synonyms: [
      'switch persona',
      'change role',
      'demo accounts',
      'test as regulator',
      'switch to admin',
    ],
    answer:
      'In the authenticated workspace top header, use the **Role** dropdown to instantly switch between `institution_operator`, `institution_admin`, `regulator_officer`, `regulator_admin`, and `auditor`. The UI dynamically adapts permissions, navigation visibility, and tenant scopes.',
    relatedIds: ['und-04', 'dash-04'],
    followUpQuestions: [
      'What is the difference between an institution operator and administrator?',
      'What can an auditor review?',
    ],
  },
  {
    id: 'dash-04',
    category: 'dashboard',
    categoryLabel: 'Dashboard & Navigation',
    canonicalQuestion: 'What is the difference between an institution operator and an administrator?',
    synonyms: [
      'operator vs admin',
      'institution roles',
      'operator permissions',
      'admin permissions',
    ],
    answer:
      '- **Institution Operator:** Authorized to upload student batches, view batch error reports, and inspect student registries. Cannot finalize/commit batch rows or issue student attestations.\n- **Institution Administrator:** Holds full college authority to commit verified batch rows, manage sanctioned program lists, issue Ed25519 attestations, and revoke credentials.',
    relatedIds: ['und-04', 'dash-03'],
    followUpQuestions: [
      'What can a regulator do?',
      'What can an auditor review?',
    ],
  },
  {
    id: 'dash-05',
    category: 'dashboard',
    categoryLabel: 'Dashboard & Navigation',
    canonicalQuestion: 'What can a regulator do in EduVerify?',
    synonyms: [
      'regulator role',
      'regulator officer',
      'aicte regulator permissions',
      'regulatory authority',
    ],
    answer:
      'Regulator users have cross-institution oversight across all technical campuses in their jurisdiction:\n- Review unredacted conflict evidence when two colleges claim the same student.\n- Adjudicate duplicate cases (Confirm Transfer, Reject Duplicate, Request Info).\n- Audit college intake capacities and flag over-enrolment infractions.',
    relatedIds: ['und-04', 'dup-04'],
    followUpQuestions: [
      'How does an authorized officer resolve a conflict?',
      'What can an auditor review?',
    ],
  },
  {
    id: 'dash-06',
    category: 'dashboard',
    categoryLabel: 'Dashboard & Navigation',
    canonicalQuestion: 'What can an auditor review in EduVerify?',
    synonyms: [
      'auditor role',
      'auditor permissions',
      'read only audit',
      'what can auditor see',
    ],
    answer:
      'Auditors have strict read-only access across the entire platform. They can inspect all student records, view the chronological audit timeline, verify the mathematical SHA-256 hash chain, and inspect Ed25519 cryptographic signatures without the ability to modify, commit, or delete records.',
    relatedIds: ['sec-02', 'und-04'],
    followUpQuestions: [
      'What is the tamper-evident audit timeline?',
      'How do I re-verify the audit chain?',
    ],
  },
  {
    id: 'und-06',
    category: 'understanding',
    categoryLabel: 'Understanding EduVerify',
    canonicalQuestion: 'What is the 3D Interactive Spatial Apparatus?',
    synonyms: [
      '3d apparatus',
      'spatial scene',
      '3d topology',
      'three js view',
      'interactive 3d view',
      'what is 3d model',
    ],
    answer:
      'The 3D Interactive Spatial Apparatus is a full WebGL visualization of EduVerify’s physical-digital trust architecture. It models the decentralized institution nodes, cryptographic attestation vault, high-throughput verification bus, and audit ledger. You can inspect components, view exploded assembly layers, and switch camera angles smoothly.',
    relatedIds: ['und-01', 'ver-01'],
    followUpQuestions: [
      'Why is the 3D apparatus important?',
      'What are the components of the apparatus?',
    ],
  },
  {
    id: 'imp-06',
    category: 'imports',
    categoryLabel: 'Data Ingestion & CSV',
    canonicalQuestion: 'What happens when an uploaded CSV row has missing columns or bad delimiters?',
    synonyms: [
      'bad csv',
      'corrupt csv',
      'missing columns',
      'delimiter issue',
      'csv format error',
    ],
    answer:
      'The CSV parser performs a preflight structural audit before records reach the validation engine. If header names are missing or row lengths do not match the expected 7 columns, the parser flags syntax errors with exact line numbers. Clean rows proceed to validation, while invalid lines are rejected with explicit remediation tips.',
    relatedIds: ['imp-01', 'imp-02'],
    followUpQuestions: [
      'What CSV columns are required?',
      'Can I download an error report for failed rows?',
    ],
  },
  {
    id: 'val-06',
    category: 'validation',
    categoryLabel: 'Validation Rules (STU-001–006)',
    canonicalQuestion: 'What is rule STU-006 (Approved Intake Cap) and how does it prevent over-enrolment?',
    synonyms: [
      'stu-006',
      'seat cap rule',
      'over enrolment rule',
      'intake cap check',
      'stu 006',
    ],
    answer:
      'Rule STU-006 validates that committing a batch of students will not exceed the AICTE-sanctioned seat capacity for the specified program. If an institution attempts to commit 65 students into a program approved for 60 seats, STU-006 blocks the commit unless a supernumerary exemption (e.g. EWS or TFW) is attached.',
    relatedIds: ['val-01', 'int-01'],
    followUpQuestions: [
      'What happens when a program exceeds 100% capacity?',
      'How does duplicate detection work?',
    ],
  },
  {
    id: 'val-07',
    category: 'validation',
    categoryLabel: 'Validation Rules (STU-001–006)',
    canonicalQuestion: 'What is RULE-CONSENT-CHK and why is student consent required?',
    synonyms: [
      'consent rule',
      'rule-consent-chk',
      'student consent check',
      'dpdp compliance',
      'why consent is needed',
    ],
    answer:
      'Under the Digital Personal Data Protection (DPDP) Act and AICTE guidelines, academic verification must be consent-backed. RULE-CONSENT-CHK verifies that a valid cryptographic or logged consent token is associated with the student profile before any third-party attestation is issued.',
    relatedIds: ['sec-01', 'ver-01'],
    followUpQuestions: [
      'How does EduVerify protect student privacy?',
      'What is an Ed25519 attestation?',
    ],
  },
  {
    id: 'dup-06',
    category: 'duplicates',
    categoryLabel: 'Duplicate & Conflict Review',
    canonicalQuestion: 'What is the difference between an intra-batch duplicate (STU-004) and a cross-institution collision (STU-005)?',
    synonyms: [
      'stu-004 vs stu-005',
      'intra batch vs cross institution',
      'difference in duplicates',
      'types of duplicates',
    ],
    answer:
      '- **STU-004 (Intra-batch duplicate):** The same APAAR appears more than once within the *same* upload file. This is usually an institution data-entry mistake and is blocked immediately.\n- **STU-005 (Cross-institution collision):** The APAAR matches an active student already enrolled at a *different* institution. This triggers a regulatory conflict case for multi-round counselling adjudication.',
    relatedIds: ['dup-01', 'dup-02'],
    followUpQuestions: [
      'How do regulators resolve conflicts?',
      'Why is tenant isolation preserved during conflicts?',
    ],
  },
  {
    id: 'int-06',
    category: 'intake',
    categoryLabel: 'Approved Intake Monitoring',
    canonicalQuestion: 'How do supernumerary quota categories (EWS, TFW, PMSSS) interact with seat caps?',
    synonyms: [
      'supernumerary quota',
      'ews seats',
      'tfw quota',
      'pmsss scholarship',
      'extra seats allowed',
    ],
    answer:
      'AICTE permits statutory supernumerary allocations (such as +10% for Economically Weaker Sections and +5% Tuition Fee Waiver). In EduVerify, these seats are tagged with specific quota codes. They do not trigger STU-006 violations up to their legally designated ceiling when sanctioned by the regulatory authority.',
    relatedIds: ['int-01', 'int-04'],
    followUpQuestions: [
      'What happens when a program exceeds 100% capacity?',
      'What is rule STU-006?',
    ],
  },
  {
    id: 'ver-06',
    category: 'verification',
    categoryLabel: 'Verification & Attestations',
    canonicalQuestion: 'How does a third-party verifier inspect an attestation offline without revealing student identity?',
    synonyms: [
      'offline verification',
      'qr code verification',
      'third party verifier',
      'verify without internet',
      'public verification',
    ],
    answer:
      'The QR code or attestation payload contains the student’s masked identifier (****-****-XXXX), institution code, program code, enrollment year, expiry timestamp, and an Ed25519 cryptographic signature. Any verifier can check the mathematical signature against EduVerify’s public key offline without needing access to raw government databases or unmasked private data.',
    relatedIds: ['ver-01', 'ver-02'],
    followUpQuestions: [
      'What is an Ed25519 attestation?',
      'Can an attestation be revoked?',
    ],
  },
  {
    id: 'sec-06',
    category: 'security',
    categoryLabel: 'Security, Privacy & Audit',
    canonicalQuestion: 'What encryption and salt strategies are used for APAAR identifiers?',
    synonyms: [
      'salt strategy',
      'apaar hashing',
      'sha 256 salt',
      'how is apaar protected',
      'rainbow table protection',
    ],
    answer:
      'EduVerify uses salted SHA-256 digests. Raw 12-digit APAAR numbers are salted with an institutional secret before hashing. This prevents dictionary and rainbow-table attacks. The UI only ever displays masked formats (`****-****-XXXX`), ensuring zero plain-text leaks even in logs and database exports.',
    relatedIds: ['sec-01', 'sec-03'],
    followUpQuestions: [
      'How does EduVerify protect student privacy?',
      'What is the tamper-evident audit timeline?',
    ],
  },
  {
    id: 'dash-07',
    category: 'dashboard',
    categoryLabel: 'Dashboard & Navigation',
    canonicalQuestion: 'How is the workspace navigation organized into the 5 primary groups?',
    synonyms: [
      'sidebar organization',
      'navigation structure',
      '5 groups',
      'menu categories',
      'where to find things',
    ],
    answer:
      'The workspace navigation is cleanly structured into 5 functional groups:\n1. **Overview:** Central Dashboard (`/app`)\n2. **Student records:** Student Records Registry, Import Batches, Data Validation, Duplicate Review\n3. **Oversight:** Institutions & Programs, Enrolment Monitoring\n4. **Trust:** Verification, Consent, Audit Trail\n5. **Support:** EduVerify Assistant, Help & Guidance\n\nAdditionally, the **3D Spatial Topology** is accessible directly from navigation.',
    relatedIds: ['dash-01', 'dash-02'],
    followUpQuestions: [
      'What does the workspace dashboard show?',
      'What can a regulator do in EduVerify?',
    ],
  },
];

/**
 * Normalized intent matching helper.
 * Scores query against canonical question and synonyms with token overlap and substring matching.
 */
export function matchKnowledgeIntent(rawQuery: string): {
  matchedEntry: KnowledgeEntry | null;
  confidence: number;
  suggestedEntries: KnowledgeEntry[];
} {
  const clean = rawQuery
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .trim();

  if (!clean) {
    return {
      matchedEntry: null,
      confidence: 0,
      suggestedEntries: WEAVE_KNOWLEDGE_BASE.slice(0, 4),
    };
  }

  const queryTokens = clean.split(/\s+/).filter((t) => t.length > 1);

  let bestEntry: KnowledgeEntry | null = null;
  let bestScore = 0;

  const scoredEntries = WEAVE_KNOWLEDGE_BASE.map((entry) => {
    let score = 0;

    // Exact canonical or synonym match
    const canonicalClean = entry.canonicalQuestion.toLowerCase();
    if (canonicalClean.includes(clean) || clean.includes(canonicalClean)) {
      score += 80;
    }

    for (const syn of entry.synonyms) {
      const synClean = syn.toLowerCase();
      if (clean === synClean) {
        score += 100;
        break;
      }
      if (clean.includes(synClean) || synClean.includes(clean)) {
        score += 60;
      }
    }

    // Token intersection
    const targetText = `${entry.canonicalQuestion} ${entry.synonyms.join(' ')} ${entry.answer}`.toLowerCase();
    let tokenMatches = 0;
    for (const token of queryTokens) {
      if (targetText.includes(token)) {
        tokenMatches += 1;
      }
    }
    const tokenRatio = queryTokens.length > 0 ? tokenMatches / queryTokens.length : 0;
    score += tokenRatio * 50;

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }

    return { entry, score };
  });

  scoredEntries.sort((a, b) => b.score - a.score);

  const confidence = Math.min(100, Math.round(bestScore));
  const suggestedEntries = scoredEntries
    .slice(0, 4)
    .filter((s) => s.score > 15)
    .map((s) => s.entry);

  if (suggestedEntries.length === 0) {
    suggestedEntries.push(...WEAVE_KNOWLEDGE_BASE.slice(0, 4));
  }

  return {
    matchedEntry: confidence >= 40 ? bestEntry : null,
    confidence,
    suggestedEntries,
  };
}
