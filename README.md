<div align="center">
  <h1>FoodSafe AI 🛡️</h1>
  <p><strong>AI Eyes for Every Kitchen — FSSAI Schedule 4 Compliance in 60 Seconds</strong></p>
  <p>Built with 💚 by <strong>Aura Architects | IIM Bangalore</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#setup--installation">Installation</a> •
    <a href="#how-it-works">How it Works</a>
  </p>
</div>

<hr/>

## Overview
FoodSafe AI is a production-ready, enterprise-grade food safety inspection platform powered by the **Google Gemini 2.0 Flash Vision API**. It maps real-world kitchen visuals to 23 critical FSSAI (Food Safety and Standards Authority of India) parameters across 5 categories, providing inspectors and restaurant owners with instant risk scoring, violation mapping, and financial remediation plans.

## ✨ Features
- ⚡ **Instant AI Audit**: Inspect kitchens against 23 FSSAI Schedule 4 parameters in under 60 seconds.
- 📊 **High-Density Risk Dashboard**: Get visual compliance scores (0-100), automated risk levels, and specific category breakdowns.
- 🚨 **Priority Violation Mapping**: Severity-coded cards point out critical, major, and minor violations with direct FSSAI protocol references and remediation steps.
- 💰 **Financial Estimates**: Receive approximate fix costs (in INR) and realistic timelines to become fully compliant.
- 📑 **Professional PDF Reports**: Export signed, detailed inspection findings via a dynamically generated, structured PDF.
- 🔗 **Shareability**: Built-in Web Share API for fast 1-click sharing of audit summaries to authorities or owners.

## 🛠️ Tech Stack
- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org)
- **AI Integration**: [Google Gemini 2.0 Flash Vision](https://ai.google.dev/) (via `@google/genai`)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com) (High-Density Theme)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Document Generation**: [jsPDF](https://parall.ax/products/jspdf) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)

## 🚀 Setup & Installation

Follow these steps to deploy the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/foodsafe-ai.git
   cd foodsafe-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your Google Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY="your_api_key_here"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 How it Works
1. **Upload**: Users upload an image of a kitchen environment (PNG, JPG).
2. **Scan**: The Gemini 2.0 Flash model conducts an intensive visual analysis, identifying hygiene, equipment, storage, and premises layout data.
3. **Parse**: Our strict prompt-engineering enforces a structured JSON response bounding the results within standard FSSAI requirements.
4. **Display**: The UI reacts dynamically, scoring the kitchen and filtering violations into an actionable "Repair/Remediation" checklist.

---
<div align="center">
  <p>A flagship prototype engineered during the <strong>IIM Bangalore Hackathon 2026</strong>.</p>
  <p><strong>Aura Architects</strong> - Building the future of automated compliance.</p>
</div>
