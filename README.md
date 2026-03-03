# 🌿 PlantGuardian – Plant Disease Identifier & Care Advisor

An AI-powered web app that helps you identify plant diseases and get practical care advice from a simple photo upload. Built entirely with **Google AI Studio** and the **Gemini API** (free tier friendly!).

Upload a picture of a leaf, stem, or whole plant → get instant analysis: plant type, health status, likely disease/pest/deficiency, severity, treatment steps, and prevention tips.

Perfect for home gardeners, urban farmers, students, and anyone who wants to keep their plants healthy without guessing.

## ✨ Features

- **Photo-based Diagnosis** — Upload any plant image (leaves show best results)
- **Multimodal AI Analysis** — Uses Gemini's image + text understanding
- **Structured Output** — Clear, readable results with:
  - Plant name & confidence
  - Health assessment & severity
  - Detailed diagnosis (symptoms observed)
  - Step-by-step remedies (natural/organic first)
  - Ideal growing conditions recap
  - Eat-safe notes for edibles
- **Encouraging & Conservative** — Only flags real issues, asks for better photos if needed
- **No login required** — Instant use
- **Mobile-friendly** — Works great on phones for in-garden scanning




## 🛠️ How It Was Built

- **Frontend / Interface**: Generated via Google AI Studio's vibe coding (no-code/low-code builder)
- **AI Backend**: Google Gemini 2.5 Flash / Flash-Lite (multimodal – handles images + text)
- **Core Prompt Engineering**: Custom system prompt that forces structured, reliable output
- **Deployment**: Static export from AI Studio → hosted on [Vercel / Netlify / Cloud Run / GitHub Pages]
- **Zero server needed** for basic version (runs client-side via Gemini API calls)

No heavy ML training, no datasets, no backend servers – pure prompting + Gemini magic!
