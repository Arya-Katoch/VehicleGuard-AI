# 🌐 VehicleGuard AI - Free Cloud Deployment Guide

This guide explains how to host **VehicleGuard AI** on **100% free cloud servers** with zero cost and no credit card required, so evaluators and mentors can access the working application from a public URL.

---

## 🏆 The Recommended Architecture (Permanent 24/7 Free Hosting)

| Service | Hosting Platform | Cost | Free Tier Specs |
| :--- | :--- | :---: | :--- |
| **Backend (FastAPI & ML Engine)** | [Render.com](https://render.com) | **Free** | 512 MB RAM, free web services, auto-sleep after inactivity (wakes up in ~30s) |
| **Frontend (Next.js & UI)** | [Vercel.com](https://vercel.com) | **Free** | Unlimited deployments, fast global CDN, custom `.vercel.app` domain |

---

## Part 1: Push Local Changes to GitHub

Ensure all your latest files (including `Procfile`, `render.yaml`, and dependencies) are pushed to your GitHub repository:

```powershell
git add .
git commit -m "feat: add cloud deployment configuration for Render and Vercel"
git push origin feature/vehicle-guard-improvements
```

---

## Part 2: Deploy the Backend (FastAPI) on Render (Free)

1. Go to **[https://render.com](https://render.com)** and sign in with your GitHub account.
2. Click **"New +"** in the top navigation bar and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and select your repository: `Arya-Katoch/VehicleGuard-AI`.
4. Configure the Web Service settings:
   - **Name:** `vehicleguard-backend` (or any unique name)
   - **Region:** Any close to you (e.g., *Singapore* or *Frankfurt*)
   - **Branch:** `feature/vehicle-guard-improvements` (or `main`)
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Select **Free** ($0/month)
5. Click **"Create Web Service"**.
6. Wait 2–3 minutes for the build to finish. Once live, Render will give you a public URL like:
   ```
   https://vehicleguard-backend.onrender.com
   ```
7. Verify it by visiting:
   ```
   https://vehicleguard-backend.onrender.com/api/health
   ```
   *(It will display `{"status":"ok","service":"VehicleGuard AI Core API","version":"2.0.0"}`)*

---

## Part 3: Deploy the Frontend (Next.js) on Vercel (Free)

1. Go to **[https://vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository: `Arya-Katoch/VehicleGuard-AI`.
4. In the project configuration screen:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and select `frontend`
   - **Build Command:** `npm run build` (Default)
   - **Output Directory:** `.next` (Default)
5. Expand **"Environment Variables"** and add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://vehicleguard-backend.onrender.com` *(paste your exact Render backend URL from Part 2, without trailing slash)*
   - **Key:** `BACKEND_INTERNAL_URL`
   - **Value:** `https://vehicleguard-backend.onrender.com`
6. Click **"Deploy"**.
7. In ~60 seconds, Vercel will give you a live production link like:
   ```
   https://vehicleguard-ai.vercel.app
   ```

---

## ⚡ Quick Alternative: Instant Public Link (Demo in 30 Seconds)

If you need to show your mentor or evaluators **right now** while the project is running on your laptop, you can generate an immediate public HTTPS URL without registering for cloud accounts:

1. Keep your backend (`http://127.0.0.1:8000`) and frontend (`http://localhost:3000`) running.
2. In a new PowerShell terminal, run:
   ```powershell
   npx -y localtunnel --port 3000
   ```
3. It will print an instant public link:
   ```
   your url is: https://nervous-frog-12.loca.lt
   ```
4. Share that link with your mentor or evaluators. When they open it, they will see a friendly password check page: they just enter your public IP (which localtunnel will show them) or click "Click to Continue".

---

## 📋 What to Share with Your Evaluators

When submitting your project, provide:
1. **Live Web Application URL:** `https://vehicleguard-ai.vercel.app`
2. **Interactive API Documentation:** `https://vehicleguard-backend.onrender.com/docs` (Swagger UI)
3. **GitHub Repository:** `https://github.com/Arya-Katoch/VehicleGuard-AI`
