# PulseVision 3D / CardioVision AI

> **Tagline:** REVEAL. EXPLAIN. VISUALIZE.  
> **Technical Project Identity:** CardioVision AI  
> **Platform Name:** PulseVision 3D  

An AI-powered cardiovascular risk visualization and decision-support interface that transforms structured clinical data into explainable coronary artery predictions and interactive 3D anatomical visualization.

---

## 🫀 Key Capabilities

1. **Interactive 3D Anatomical Human Heart Viewer**
   - High-fidelity realistic anatomical human heart model (`.glb`) with realistic muscle striations, aortic arch, pulmonary trunk, and venous geometry.
   - PBR (Physically Based Rendering) living-tissue textures with normal maps, specular highlights, and studio medical lighting.
   - Distinct coronary artery branches (**LAD**, **LCX**, and **RCA**) mapped along the anatomical interventricular and coronary sulci.
   - Real-time vessel selection, dynamic 360° rotation, zoom, camera reset, cardiac contraction pulsation, and calibrated risk highlight shaders.
   - Explicit 1:1 mapping: each highlighted vessel links directly to its model prediction.

2. **Multi-Target Prediction Engine**
   - Simultaneous risk assessment across 4 clinically verified targets:
     - **Cath / Overall CAD** (Coronary Artery Disease detection)
     - **LAD** (Left Anterior Descending Artery stenosis ≥50%)
     - **LCX** (Left Circumflex Artery stenosis ≥50%)
     - **RCA** (Right Coronary Artery stenosis ≥50%)
   - Calibrated statistical risk probability percentages (explicitly not claimed as physical millimeter stenosis).

3. **Explainable AI (SHAP Feature Attributions)**
   - Additive feature attribution waterfall/bar charts for each target vessel.
   - Distinguishes features that **increase risk (+)** from those that **decrease risk (−)**.
   - Transparently labeled local deterministic benchmark attributions vs. live ML model outputs.

4. **"What Changed?" Scenario Sensitivity Simulator**
   - Real-time adjustment of clinical variables (Blood Pressure, Smoking status, LDL Cholesterol, Ejection Fraction %).
   - Side-by-side baseline vs. simulated predictions with dynamic delta badges.
   - Clear disclosure that simulations demonstrate model responsiveness, not medical treatment outcomes.

5. **Multi-Case Comparative Analysis**
   - Side-by-side comparison of two clinical profiles with verified baseline markers.

6. **Role-Tailored Workflows**
   - **Patient Mode:** Accessible language, simplified terminology, intuitive 3D heart exploration.
   - **Nurse Mode:** Rapid intake workflows, range validation, missing-value alerts, pre-submission review checklist.
   - **Doctor Mode:** Comprehensive probability analytics, SHAP attributions, scenario modeling, and full clinical deep-dive.

7. **Target Leakage Safeguard & Data Safety**
   - Strictly isolates target labels (`CAD`, `LAD`, `LCX`, `RCA`) from model inputs.
   - Pre-loaded with validated patient profiles from the benchmark **Z-Alizadeh Sani CAD** cohort (303 patient records).

---

## 🛠️ Prerequisites

Before running the application, make sure you have installed:
- **Node.js** (v18.0.0 or higher; tested on v26.7.0)
- **npm** (comes with Node.js)
- A modern WebGL-compatible web browser (Chrome, Edge, Firefox, Brave, Safari)

---

## 🚀 How to Run the Project (Windows Terminal Commands)

Open **PowerShell** or **Command Prompt** in Windows and navigate to the project directory:

```powershell
cd "e:\ANTIGRAVITY\New folder\cardiovision"
```

### 1. Install Dependencies
```powershell
npm.cmd install
```
*(On standard bash/Linux/macOS, simply run `npm install`)*

### 2. Start the Development Server
```powershell
npm.cmd run dev
```

The terminal will display a local address (typically `http://localhost:5173`). Open that URL in your browser.

### 3. Build for Production
To build optimized static assets:
```powershell
npm.cmd run build
```
The compiled files will be saved in the `dist/` directory.

### 4. Preview the Production Build
```powershell
npm.cmd run preview
```

---

## ⚙️ Configuration & Backend Integration

### Running in Demo Mode (Standalone)
PulseVision 3D includes a **built-in deterministic clinical intelligence engine** based on the 303-patient Z-Alizadeh Sani benchmark dataset.
- **No external server is required** to run demonstrations, presentations, or evaluations.
- When the backend is offline, simulated results are clearly marked with a persistent banner:  
  `DEMO DATA — NOT A REAL PREDICTION`

### Connecting the FastAPI Backend (Optional)
If you have a FastAPI backend implementing the clinical API contract:

1. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
2. Edit `.env` to set your backend URL:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
3. The expected API contract endpoints are:
   - `GET /health` — Service health check
   - `GET /model-info` — Model architecture, version, and training cohort
   - `POST /predict` — JSON assessment payload returning 4 target probabilities
   - `POST /explain` — SHAP feature attribution vectors
   - `POST /extract-report` — Optional OCR report document parsing
4. Use the **Settings & Diagnostics** page in the application to test connectivity in real-time.

---

## 📂 Project Architecture

```
cardiovision/
├── index.html                           # Application entry with custom branding & typography
├── package.json                         # Dependencies & scripts
├── vite.config.ts                       # Vite 8 + Tailwind CSS v4 config
├── tsconfig.app.json                    # TypeScript strict mode configuration
├── .env.example                         # Environment template
├── src/
│   ├── main.tsx                         # React 19 root
│   ├── App.tsx                          # Core application state & routing controller
│   ├── index.css                        # Clinical dark theme & glassmorphic design system
│   ├── types/
│   │   └── clinical.ts                  # Typed schemas for Demographics, ECG, Echo, Labs, Predictions, SHAP
│   ├── services/
│   │   ├── demoService.ts               # Deterministic benchmark prediction engine & sample patient cases
│   │   └── apiService.ts                # FastAPI client with auto-fallback and health check diagnostics
│   └── components/
│       ├── landing/
│       │   └── LandingPage.tsx          # Cinematic hero, 3-step workflow, role previews, safety statement
│       ├── layout/
│       │   ├── ClinicalWorkspaceLayout.tsx # Collapsible sidebar shell, breadcrumbs, demo badge
│       │   └── RoleSelectionModal.tsx   # Patient, Nurse, and Doctor mode switcher
│       ├── anatomy/
│       │   └── CoronaryAnatomyViewer.tsx# 3D Three.js coronary visualizer with LAD/LCX/RCA risk shaders
│       ├── dashboard/
│       │   └── ResultsDashboard.tsx     # 4-target probability meters, data quality, and CTAs
│       ├── forms/
│       │   └── PatientIntakeForm.tsx    # Sections A-F, auto BMI, validation, preset loader, mock OCR
│       ├── charts/
│       │   └── ExplainabilitySection.tsx# SHAP waterfall attribution & role-adaptive narratives
│       ├── simulation/
│       │   └── ScenarioSimulator.tsx    # "What Changed?" interactive sensitivity sliders & delta badges
│       ├── comparison/
│       │   └── AssessmentComparison.tsx # Side-by-side multi-case evaluation
│       └── settings/
│           └── SettingsView.tsx         # Backend diagnostics, typography scale, reduced motion, disclaimer
```

---

## 🎨 Visual Design Palette

- **Background:** `#07111F` (Dark Navy)
- **Secondary Surface:** `#0B1728`
- **Panel Surface:** `#101F33`
- **Accent Cyan:** `#35D8F2` (Primary Brand & Normal Vessel Status)
- **Accent Blue:** `#528BFF`
- **Accent Violet:** `#8B7CFF`
- **Warning Amber:** `#F59E0B` (Borderline Risk)
- **Critical Danger:** `#F43F5E` (Stenosis ≥50% Risk)
- **Primary Text:** `#F4F8FF`
- **Secondary Text:** `#9BAFC5`
- **Borders:** `#1E2F45` / `#24374D`

---

## 🩺 Medical & Regulatory Safety Notice

> **"For decision-support and educational purposes only. Predictions are not a substitute for formal diagnostic imaging or professional medical diagnosis."**

- **Not FDA/CE Approved:** This is a hackathon prototype designed for scientific visualization and educational modeling.
- **No Direct Causality:** Feature attributions represent associative statistical weights in the training distribution, not mechanical clinical causation.
- **Anatomical Representation:** The 3D coronary anatomy viewer is an illustrative educational model and does not represent an individualized patient CT angiogram reconstruction.
