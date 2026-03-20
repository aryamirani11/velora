# Velora

Velora is an AI-powered post-visit follow-up agent that helps healthcare providers monitor patients after discharge and intelligently escalate care when needed.

## Problem

After discharge, patients are often left without structured follow-up. Hospitals rely on manual check-ins, which are time-consuming, inconsistent, and prone to missing early warning signs — leading to complications and readmissions.

## Solution

Velora automates patient follow-up using agentic AI.

Patients complete simple check-ins, and Velora:

* analyzes patient condition
* detects potential risk patterns
* determines the appropriate next step
* escalates critical cases to clinicians

## How It Works

1. Patient completes a follow-up check-in
2. watsonx.ai analyzes symptoms, severity, and patient input
3. watsonx Orchestrate coordinates decision-making:

   * Low risk → continue monitoring
   * Moderate risk → recommend follow-up
   * High risk → escalate to provider
4. Velora generates a concise, clinician-ready summary

## Key Features

* Intelligent post-discharge monitoring
* Automated risk detection and triage
* Agent-based escalation workflow
* Clinician-facing summaries
* Simple, accessible patient interface

## Tech Stack

* Frontend: Next.js
* AI Reasoning: IBM watsonx.ai
* Workflow Orchestration: IBM watsonx Orchestrate
* Development: Cursor

## Impact

Velora improves care continuity, reduces clinician workload, and enables earlier intervention by identifying at-risk patients before complications escalate.

## Responsible AI

Velora does not provide diagnoses. It supports healthcare delivery by assisting in patient monitoring and surfacing when additional care may be needed.

## Future Improvements

* Integration with hospital EHR systems
* Real-time clinician dashboard
* Personalized monitoring for chronic conditions
* SMS-based patient follow-ups

---

Built at the IBM SkillsBuild Hackathon
