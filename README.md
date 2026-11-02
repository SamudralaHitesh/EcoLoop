# 🌿 EcoLoop — BioWaste Neural-Grid Platform

> **Intelligent Commercial Food Waste Diversion & Anaerobic Digestion Intelligence Platform**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Overview

**EcoLoop** is a closed-loop organic waste diversion and bioenergy management platform designed for commercial hospitality, food retail, and industrial anaerobic digestion facilities.

By fusing computer vision waste auditing, biochemical methane yield modeling, and RAG-grounded anaerobic chemistry assistance, EcoLoop eliminates organic landfill waste, prevents digester souring, and monetizes carbon offsets via Green Energy Tokens (GET).

---

## 🚀 Key Modules & Personas

| Module | Target Persona | Functionality |
| :--- | :--- | :--- |
| **Vision Auditor** | Commercial Kitchens | Live image analysis of food waste bins, contamination risk scoring, and categorization. |
| **BMP & Carbon Calculator** | Sustainability Leads | Biochemical Methane Potential (BMP) forecasting and ISO-14064 verified carbon avoidance metrics. |
| **Logistics Dispatch Hub** | Fleet Drivers | Smart routing and pickup scheduling across registered commercial producers. |
| **Digester SCADA** | Plant Operators | Real-time monitoring of VFA/TIC ratios, C:N balance, pH, temperature, and biogas yield. |
| **Chemistry RAG Copilot** | Plant Engineers | AI-assisted troubleshooting of souring risks, buffering strategies, and feedstock recipes. |
| **ESG Token Marketplace** | Corporate ESG Admins | Green Energy Token issuance and certified Scope 1 & 3 carbon offset claims. |

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic, Uvicorn, Pytest
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Canvas Confetti
- **Architecture**: Modular REST API + Multi-Role SPA

---

## ⚡ Quickstart

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Start Both Backend & Frontend
Run the automated launcher:
```powershell
.\start_platform.ps1
```
Or with batch file:
```cmd
start_platform.bat
```

### 3. Manual Start

#### Backend:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: `http://127.0.0.1:8000/docs`

#### Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Web Dashboard: `http://localhost:5173/`

---

## 📄 License
MIT License. Built with ❤️ for zero-waste green energy transitions.
