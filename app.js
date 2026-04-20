const patients = {
  "PN-AARAV-0426": {
    id: "PN-AARAV-0426",
    name: "Aarav Raman",
    age: 46,
    sex: "M",
    blood: "B+",
    hospital: "Cognizant CityCare",
    allergies: ["Penicillin", "Shellfish"],
    conditions: ["Type 2 diabetes", "Hypertension"],
    vitals: { bp: "158/96", spo2: "97%", glucose: "248", risk: "High" },
    timeline: [
      ["2026-04-12", "OP visit", "Reported dizziness and elevated fasting glucose."],
      ["2026-03-18", "Lab panel", "HbA1c rose from 7.8 to 8.9 in 90 days."],
      ["2026-01-22", "Cardiology", "ECG normal. Medication adherence issue noted."]
    ],
    labs: [
      ["HbA1c", "8.9%", "< 7%", "High"],
      ["Fasting glucose", "248 mg/dL", "70-110", "High"],
      ["LDL", "142 mg/dL", "< 100", "High"],
      ["Creatinine", "1.1 mg/dL", "0.7-1.3", "Normal"]
    ],
    meds: [
      ["Metformin", "1000 mg", "Twice daily", "Active"],
      ["Amlodipine", "5 mg", "Daily", "Active"],
      ["Atorvastatin", "20 mg", "Night", "Active"]
    ]
  },
  "PN-MEERA-3110": {
    id: "PN-MEERA-3110",
    name: "Meera Shah",
    age: 33,
    sex: "F",
    blood: "O-",
    hospital: "GreenLine Hospital",
    allergies: ["Ibuprofen"],
    conditions: ["Asthma"],
    vitals: { bp: "118/76", spo2: "92%", glucose: "96", risk: "Medium" },
    timeline: [
      ["2026-04-16", "Emergency", "Shortness of breath after pollen exposure."],
      ["2026-02-10", "Pulmonology", "Controller inhaler renewed."],
      ["2025-12-04", "Vaccination", "Influenza vaccine administered."]
    ],
    labs: [
      ["SpO2", "92%", "95-100", "Low"],
      ["Peak flow", "310 L/min", "> 380", "Low"],
      ["WBC", "7600/uL", "4500-11000", "Normal"],
      ["CRP", "3 mg/L", "< 5", "Normal"]
    ],
    meds: [
      ["Budesonide", "200 mcg", "Twice daily", "Active"],
      ["Salbutamol", "100 mcg", "As needed", "Active"],
      ["Cetirizine", "10 mg", "Night", "Paused"]
    ]
  },
  "PN-JOSEPH-8841": {
    id: "PN-JOSEPH-8841",
    name: "Joseph Mathew",
    age: 71,
    sex: "M",
    blood: "A+",
    hospital: "NorthStar Medical",
    allergies: ["None recorded"],
    conditions: ["Atrial fibrillation", "Chronic kidney disease"],
    vitals: { bp: "132/84", spo2: "96%", glucose: "112", risk: "High" },
    timeline: [
      ["2026-04-01", "Nephrology", "eGFR decreased; adjust renal dosing."],
      ["2026-03-01", "Cardiology", "Warfarin dose changed after INR review."],
      ["2026-02-19", "Imaging", "Chest X-ray clear."]
    ],
    labs: [
      ["INR", "3.7", "2.0-3.0", "High"],
      ["eGFR", "42", "> 60", "Low"],
      ["Potassium", "5.2 mmol/L", "3.5-5.1", "High"],
      ["Hemoglobin", "12.4 g/dL", "13-17", "Low"]
    ],
    meds: [
      ["Warfarin", "3 mg", "Daily", "Review"],
      ["Metoprolol", "25 mg", "Twice daily", "Active"],
      ["Furosemide", "20 mg", "Morning", "Active"]
    ]
  }
};

const state = {
  patient: patients["PN-AARAV-0426"],
  consent: false,
  fetched: false,
  emergency: false,
  tab: "timeline",
  audit: []
};

const els = {
  qrGrid: document.querySelector("#qr-grid"),
  code: document.querySelector("#patient-code"),
  patientSummary: document.querySelector("#patient-summary"),
  consentBox: document.querySelector("#consent-box"),
  insights: document.querySelector("#insights"),
  recordView: document.querySelector("#record-view"),
  toast: document.querySelector("#toast")
};

function init() {
  renderQr(state.patient.id);
  renderAll();
  bindEvents();
  log("Agent initialized for demo patient.");
}

function bindEvents() {
  document.body.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    const patientButton = event.target.closest("[data-patient]");
    const modeButton = event.target.closest("[data-mode]");
    const tabButton = event.target.closest("[data-tab]");

    if (patientButton) {
      els.code.value = patientButton.dataset.patient;
      scanPatient();
    }

    if (modeButton) {
      state.emergency = modeButton.dataset.mode === "emergency";
      document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("selected", button === modeButton));
      log(state.emergency ? "Emergency mode armed." : "Consent mode selected.");
      renderAll();
    }

    if (tabButton) {
      state.tab = tabButton.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((button) => button.classList.toggle("active", button === tabButton));
      renderRecords();
    }

    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === "scan") scanPatient();
    if (action === "grant") grantConsent();
    if (action === "fetch") fetchRecords();
    if (action === "emergency") emergencyAccess();
    if (action === "export") copyBundle();
    if (action === "reset-demo") resetDemo();
    if (action === "toggle-theme") document.body.classList.toggle("dark");
  });

  els.code.addEventListener("keydown", (event) => {
    if (event.key === "Enter") scanPatient();
  });
}

function scanPatient() {
  const code = els.code.value.trim().toUpperCase();
  if (!patients[code]) {
    toast("Unknown QR Health ID. Try one of the demo patients.");
    log(`Failed lookup for ${code || "empty scan"}.`);
    return;
  }

  state.patient = patients[code];
  state.consent = false;
  state.fetched = false;
  state.emergency = false;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("selected", button.dataset.mode === "normal"));
  renderQr(code);
  log(`QR Health ID matched: ${code}.`);
  toast(`${state.patient.name} matched. Consent required.`);
  renderAll();
}

function grantConsent() {
  state.consent = true;
  state.emergency = false;
  log(`Consent granted by ${state.patient.name} for clinical summary, labs, medications, and allergies.`);
  toast("Consent token issued for this session.");
  renderAll();
}

function fetchRecords() {
  if (!state.consent && !state.emergency) {
    toast("Records are locked until consent is granted or emergency access is used.");
    log("FHIR fetch blocked by consent policy.");
    renderAll();
    return;
  }
  state.fetched = true;
  log(`FHIR bundle fetched from ${state.patient.hospital}.`);
  toast("FHIR records fetched and normalized.");
  renderAll();
}

function emergencyAccess() {
  state.emergency = true;
  state.consent = false;
  state.fetched = true;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("selected", button.dataset.mode === "emergency"));
  log("Emergency break-glass access used. Audit escalation recorded.");
  toast("Emergency access opened with audit escalation.");
  renderAll();
}

function resetDemo() {
  state.patient = patients["PN-AARAV-0426"];
  state.consent = false;
  state.fetched = false;
  state.emergency = false;
  state.tab = "timeline";
  state.audit = [];
  els.code.value = state.patient.id;
  document.querySelectorAll("[data-tab]").forEach((button) => button.classList.toggle("active", button.dataset.tab === "timeline"));
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("selected", button.dataset.mode === "normal"));
  renderQr(state.patient.id);
  log("Demo reset.");
  renderAll();
}

function renderAll() {
  renderPatient();
  renderConsent();
  renderSteps();
  renderInsights();
  renderRecords();
}

function renderPatient() {
  const p = state.patient;
  els.patientSummary.innerHTML = `
    <div>
      <h2>${p.name}</h2>
      <div class="tags">
        <span class="tag">${p.id}</span>
        <span class="tag">${p.age} yrs / ${p.sex}</span>
        <span class="tag">${p.blood}</span>
        <span class="tag">${p.hospital}</span>
      </div>
    </div>
    <div class="metric-stack">
      <div class="metric"><span>BP</span><strong>${p.vitals.bp}</strong></div>
      <div class="metric"><span>SpO2</span><strong>${p.vitals.spo2}</strong></div>
      <div class="metric"><span>Glucose</span><strong>${p.vitals.glucose}</strong></div>
      <div class="metric"><span>Risk</span><strong>${p.vitals.risk}</strong></div>
    </div>
  `;
}

function renderConsent() {
  const title = state.emergency ? "Emergency access is active" : state.consent ? "Consent token active" : "Consent required";
  const body = state.emergency
    ? "The agent has opened a break-glass session for urgent care. Every record view and export is written to the audit trail."
    : state.consent
      ? "Access is limited to allergies, problems, medications, labs, encounters, and a generated care summary for this session."
      : "Patient approval is required before the agent can retrieve records from connected hospital systems.";

  els.consentBox.innerHTML = `
    <h3>${title}</h3>
    <p>${body}</p>
    <div class="tags">
      <span class="tag">${state.emergency ? "Break glass" : state.consent ? "Consent ID CN-2026-0420" : "Policy locked"}</span>
      <span class="tag">Minimum necessary data</span>
      <span class="tag">Encrypted exchange</span>
    </div>
  `;
}

function renderSteps() {
  setStep("identity", true, true, "QR Health ID matched");
  setStep("consent", state.consent || state.emergency, state.consent || state.emergency, state.emergency ? "Emergency override" : state.consent ? "Approved by patient" : "Awaiting approval");
  setStep("fhir", state.fetched, state.fetched, state.fetched ? "Bundle normalized" : "Records locked");
  setStep("insights", state.fetched, state.fetched, state.fetched ? "Insights generated" : "Ready after fetch");
}

function setStep(name, active, done, caption) {
  const step = document.querySelector(`[data-step="${name}"]`);
  step.classList.toggle("active", active && !done);
  step.classList.toggle("done", done);
  step.querySelector("small").textContent = caption;
}

function renderInsights() {
  if (!state.fetched) {
    els.insights.innerHTML = `<div class="locked">Fetch records to generate clinical alerts.</div>`;
    return;
  }

  const insights = buildInsights(state.patient);
  els.insights.innerHTML = insights.map((item) => `
    <article class="insight-card severity-${item.severity}">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function renderRecords() {
  if (!state.fetched && state.tab !== "audit") {
    els.recordView.innerHTML = `<div class="locked">Clinical records are locked by consent policy.</div>`;
    return;
  }

  if (state.tab === "timeline") renderTimeline();
  if (state.tab === "labs") renderLabs();
  if (state.tab === "meds") renderMeds();
  if (state.tab === "bundle") renderBundle();
  if (state.tab === "audit") renderAudit();
}

function renderTimeline() {
  els.recordView.innerHTML = state.patient.timeline.map(([date, type, note]) => `
    <article class="record-card">
      <strong>${date} - ${type}</strong>
      <p>${note}</p>
    </article>
  `).join("");
}

function renderLabs() {
  els.recordView.innerHTML = `
    <div class="table">
      <div class="table-row header"><span>Test</span><span>Value</span><span>Range</span><span>Status</span></div>
      ${state.patient.labs.map(([test, value, range, status]) => `
        <div class="table-row"><strong>${test}</strong><span>${value}</span><span>${range}</span><span>${status}</span></div>
      `).join("")}
    </div>
  `;
}

function renderMeds() {
  els.recordView.innerHTML = `
    <div class="table">
      <div class="table-row header"><span>Medication</span><span>Dose</span><span>Schedule</span><span>Status</span></div>
      ${state.patient.meds.map(([med, dose, schedule, status]) => `
        <div class="table-row"><strong>${med}</strong><span>${dose}</span><span>${schedule}</span><span>${status}</span></div>
      `).join("")}
    </div>
  `;
}

function renderBundle() {
  els.recordView.innerHTML = `<pre>${escapeHtml(JSON.stringify(makeBundle(), null, 2))}</pre>`;
}

function renderAudit() {
  const rows = state.audit.length ? state.audit : ["No audit events yet."];
  els.recordView.innerHTML = rows.map((row) => {
    if (typeof row === "string") return `<article class="audit-row"><p>${row}</p></article>`;
    return `<article class="audit-row"><strong>${row.time}</strong><p>${row.message}</p></article>`;
  }).join("");
}

function buildInsights(patient) {
  const abnormalLabs = patient.labs.filter((lab) => lab[3] !== "Normal").map((lab) => `${lab[0]} ${lab[1]}`);
  const allergy = patient.allergies.includes("None recorded") ? "No recorded allergies; confirm verbally before prescribing." : `Avoid ${patient.allergies.join(", ")}.`;
  const medReview = patient.meds.find((med) => med[3] === "Review");

  return [
    {
      severity: abnormalLabs.length > 1 ? "high" : "medium",
      title: abnormalLabs.length > 1 ? "Multiple abnormal signals" : "One abnormal signal",
      body: abnormalLabs.length ? abnormalLabs.join("; ") : "No abnormal labs in the shared bundle."
    },
    {
      severity: patient.vitals.risk === "High" ? "high" : "medium",
      title: "Care priority",
      body: patient.vitals.risk === "High" ? "Escalate review before discharge and reconcile medications." : "Monitor symptoms and verify home care plan."
    },
    {
      severity: medReview ? "high" : "medium",
      title: "Medication safety",
      body: medReview ? `${medReview[0]} is marked for review. Check latest dose and contraindications.` : allergy
    }
  ];
}

function makeBundle() {
  const p = state.patient;
  return {
    resourceType: "Bundle",
    type: "collection",
    meta: {
      source: "PulseNet Agent",
      consent: state.emergency ? "emergency-break-glass" : state.consent ? "patient-consent" : "locked",
      generatedAt: new Date().toISOString()
    },
    entry: [
      {
        resource: {
          resourceType: "Patient",
          id: p.id,
          name: [{ text: p.name }],
          gender: p.sex === "M" ? "male" : "female",
          extension: [{ url: "blood-group", valueString: p.blood }]
        }
      },
      {
        resource: {
          resourceType: "AllergyIntolerance",
          patient: { reference: `Patient/${p.id}` },
          code: { text: p.allergies.join(", ") }
        }
      },
      {
        resource: {
          resourceType: "Condition",
          patient: { reference: `Patient/${p.id}` },
          code: { text: p.conditions.join(", ") }
        }
      },
      ...p.labs.map(([name, value, range, status]) => ({
        resource: {
          resourceType: "Observation",
          status: status === "Normal" ? "final" : "preliminary",
          code: { text: name },
          valueString: value,
          referenceRange: [{ text: range }]
        }
      })),
      ...p.meds.map(([name, dose, schedule, status]) => ({
        resource: {
          resourceType: "MedicationStatement",
          status: status === "Paused" ? "on-hold" : "active",
          medicationCodeableConcept: { text: name },
          dosage: [{ text: `${dose}, ${schedule}` }]
        }
      }))
    ]
  };
}

async function copyBundle() {
  if (!state.fetched) {
    toast("Fetch records before exporting a FHIR bundle.");
    return;
  }
  const payload = JSON.stringify(makeBundle(), null, 2);
  try {
    await navigator.clipboard.writeText(payload);
    log("FHIR bundle copied for secure handoff.");
    toast("FHIR bundle copied.");
  } catch {
    log("FHIR bundle opened in export view.");
    state.tab = "bundle";
    document.querySelectorAll("[data-tab]").forEach((button) => button.classList.toggle("active", button.dataset.tab === "bundle"));
    renderRecords();
    toast("Clipboard unavailable. Bundle view opened.");
  }
}

function renderQr(seed) {
  const bits = Array.from({ length: 121 }, (_, index) => {
    const char = seed.charCodeAt(index % seed.length);
    const finder = isFinder(index);
    return finder || ((char + index * 7) % 5 < 2);
  });
  els.qrGrid.innerHTML = bits.map((on) => `<span class="qr-cell ${on ? "on" : ""}"></span>`).join("");
}

function isFinder(index) {
  const row = Math.floor(index / 11);
  const col = index % 11;
  return (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3);
}

function log(message) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  state.audit.unshift({ time, message });
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

init();
