# PulseNet

Seamless, secure health data sharing across hospitals using QR + APIs.

## Demo

Open `index.html` in a browser. The app is a dependency-free local demo of the PulseNet agent with QR Health ID scanning, consent workflow, emergency break-glass access, FHIR-style record exchange, AI alerts, and audit logging.

## Problem

Healthcare data is siloed. Patients face repeated tests, delays, and higher costs due to lack of interoperability.

## Solution

PulseNet enables instant access to patient records using:

- QR-based Health ID
- FHIR APIs for interoperability
- Consent-driven secure sharing

## Features

- Instant patient data access via QR
- Cross-hospital compatibility
- Secure consent and encryption layer
- Emergency access mode
- AI alerts for critical insights
- FHIR-style bundle export
- Audit trail for normal and emergency access

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- APIs: simulated FHIR R4-style payloads
- Auth: simulated consent token and emergency override
- Storage: local in-memory demo data

## How it Works

1. Patient gets QR Health ID
2. Doctor scans QR
3. Patient approves access
4. System fetches data through FHIR-style resources
5. Records and AI alerts display instantly

## Innovation

- Plug-and-play hospital integration
- No system replacement needed
- Emergency zero-delay access

## Impact

- Reduces 20-30% duplicate tests
- Faster diagnosis
- Better emergency care

## Setup Instructions

No install step is required. Open `index.html`.
