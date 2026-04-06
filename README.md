# 🚗 RideSync — Cloud-Based Carpool Discovery System

> **Design and Implementation of a Cloud-Based Carpool Discovery System Using Azure**

A full-stack web application that helps users discover carpool partners traveling the same route. Built with React + Azure cloud services for a Cloud Computing college mini-project.

---

## ☁️ Architecture

```
┌─────────────────────────────────────────────────────┐
│               Azure Static Web Apps                  │
│  ┌──────────────────┐    ┌────────────────────────┐  │
│  │  React Frontend   │───▶│  Azure Functions (API)  │  │
│  │  (Vite build)     │    │  7 serverless endpoints │  │
│  └──────────────────┘    └────────┬───────────────┘  │
│                                    │                  │
└────────────────────────────────────┼──────────────────┘
                                     │
                           ┌─────────▼──────────┐
                           │  Azure Cosmos DB    │
                           │  (NoSQL - Free tier)│
                           │  ┌───────────────┐  │
                           │  │ users          │  │
                           │  │ travelPlans    │  │
                           │  └───────────────┘  │
                           └────────────────────┘
```

### Cloud Services Mapping

| Feature          | Azure Service                  | Purpose                       |
|------------------|-------------------------------|-------------------------------|
| Authentication   | Custom JWT + Azure Functions   | User signup/login             |
| Database         | Azure Cosmos DB (NoSQL)        | Store users & travel plans    |
| API / Backend    | Azure Functions (serverless)   | 7 REST API endpoints          |
| Hosting          | Azure Static Web Apps          | Host React app + API together |

---

## 📁 Folder Structure

```
198C/
├── package.json                    # Frontend dependencies
├── vite.config.js                  # Vite config (proxy /api → Functions)
├── index.html                      # HTML entry point
├── staticwebapp.config.json        # Azure SWA routing
├── .env.example                    # Environment variable template
├── README.md                       # This file
│
├── api/                            # Azure Functions (serverless API)
│   ├── package.json
│   ├── host.json
│   ├── local.settings.json.example
│   ├── lib/
│   │   ├── cosmosClient.js         # Cosmos DB client (auto-creates DB)
│   │   └── auth.js                 # JWT + bcrypt helpers
│   └── src/functions/
│       ├── signup.js               # POST /api/signup
│       ├── login.js                # POST /api/login
│       ├── addTravelPlan.js        # POST /api/travel-plans
│       ├── getTravelPlans.js       # GET  /api/travel-plans-list
│       ├── getMyPlans.js           # GET  /api/my-plans
│       ├── deletePlan.js           # DELETE /api/travel-plans/{id}
│       └── getMatches.js           # GET  /api/matches
│
└── src/                            # React frontend
    ├── main.jsx
    ├── App.jsx
    ├── index.css                   # Premium dark theme
    ├── context/AuthContext.jsx     # Auth state management
    ├── services/api.js             # Axios + JWT interceptor
    ├── components/
    │   ├── Navbar.jsx
    │   └── ProtectedRoute.jsx
    └── pages/
        ├── Login.jsx
        ├── Signup.jsx
        ├── Dashboard.jsx
        ├── AddPlan.jsx
        ├── MyPlans.jsx
        └── Matches.jsx
```

---

## 🔧 SECTION 7 — AZURE SETUP (Step-by-Step)

### Step 1: Create Azure Cosmos DB

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → search **"Azure Cosmos DB"** → click **Create**
3. Select **"Azure Cosmos DB for NoSQL"** → click **Create**
4. Fill in:
   - **Subscription**: Your student subscription
   - **Resource Group**: Create new → `carpool-rg`
   - **Account Name**: `carpool-cosmosdb` (must be globally unique)
   - **Location**: Pick closest to you (e.g., `Central India`)
   - **Capacity mode**: **Serverless** (important for free tier!)
5. Click **Review + Create** → **Create**
6. Wait for deployment → click **Go to Resource**
7. In the left menu, click **Keys**
8. **Copy these values:**

| What to copy       | Where to paste                              |
|---------------------|---------------------------------------------|
| **URI**             | `COSMOS_ENDPOINT` in `api/local.settings.json` |
| **PRIMARY KEY**     | `COSMOS_KEY` in `api/local.settings.json`     |

> ⚠️ The database and containers (`users`, `travelPlans`) are created **automatically** when the app runs for the first time. You do NOT need to create them manually.

### Step 2: Create `api/local.settings.json`

Copy the example file and fill in your values:

```bash
cd api
copy local.settings.json.example local.settings.json
```

Edit `local.settings.json`:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_ENDPOINT": "https://carpool-cosmosdb.documents.azure.com:443/",
    "COSMOS_KEY": "your-primary-key-from-azure-portal",
    "JWT_SECRET": "any-random-string-like-MySecretKey123"
  },
  "Host": {
    "CORS": "*"
  }
}
```

### Step 3: Deploy to Azure Static Web Apps

1. Push this project to a **GitHub repository**
2. Go to [Azure Portal](https://portal.azure.com)
3. Click **"Create a resource"** → search **"Static Web Apps"** → click **Create**
4. Fill in:
   - **Subscription**: Your student subscription
   - **Resource Group**: `carpool-rg`
   - **Name**: `carpool-app`
   - **Plan type**: **Free**
   - **Source**: **GitHub** → authorize and select your repo
   - **Branch**: `main`
   - **Build Preset**: **React**
   - **App location**: `/`
   - **API location**: `api`
   - **Output location**: `dist`
5. Click **Review + Create** → **Create**
6. After deployment, go to your Static Web App → **Configuration** → **Application settings**
7. Add these settings:

| Name             | Value                                      |
|------------------|--------------------------------------------|
| COSMOS_ENDPOINT  | Your Cosmos DB URI                         |
| COSMOS_KEY       | Your Cosmos DB PRIMARY KEY                 |
| JWT_SECRET       | A random secret string                     |

8. Your app will auto-deploy on every GitHub push!

---

## 🖥️ SECTION 6 — LOCAL RUN INSTRUCTIONS

### Prerequisites
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Azure Functions Core Tools**: Install with:
  ```bash
  npm install -g azure-functions-core-tools@4 --unsafe-perm true
  ```

### Install & Run

```bash
# 1. Install frontend dependencies
cd c:\Users\mouni\OneDrive\Desktop\198C
npm install

# 2. Install API dependencies
cd api
npm install
cd ..

# 3. Create local.settings.json (fill in your Azure values)
cd api
copy local.settings.json.example local.settings.json
# Edit local.settings.json with your Cosmos DB values
cd ..

# 4. Start the API (Azure Functions local server)
cd api
func start
# This starts on http://localhost:7071

# 5. In a NEW terminal, start the frontend
cd c:\Users\mouni\OneDrive\Desktop\198C
npm run dev
# This starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## ✅ SECTION 9 — TEST CHECKLIST

| #  | Test                                | Expected Result                      |
|----|-------------------------------------|--------------------------------------|
| 1  | Open app in browser                 | Login page with dark theme           |
| 2  | Click "Sign Up"                     | Signup page renders                  |
| 3  | Register new user                   | Redirects to Dashboard               |
| 4  | Logout and Login again              | Login works, Dashboard shows         |
| 5  | Add a travel plan                   | Success message, redirects to My Plans |
| 6  | View My Plans                       | Shows created plan                   |
| 7  | Search for matches                  | Shows matching users (or empty)      |
| 8  | Delete a plan                       | Plan removed from list               |
| 9  | Check Azure Portal → Cosmos DB      | Data visible in Data Explorer        |
| 10 | Open on mobile                      | Responsive layout works              |

---

## 🎯 Features

- ✅ User signup & login with JWT authentication
- ✅ Add travel plans (source, destination, time slot)
- ✅ View & delete your own plans
- ✅ Find matching carpool partners by route & time
- ✅ Match count display
- ✅ Search & filter travel entries
- ✅ Premium dark-theme UI with glassmorphism
- ✅ Responsive design (mobile-friendly)
- ✅ 100% Azure cloud-powered (Cosmos DB, Functions, Static Web Apps)

---

## 📝 Common Mistakes

| Mistake                                    | Fix                                          |
|--------------------------------------------|-----------------------------------------------|
| `COSMOS_ENDPOINT` still says `YOUR_VALUE`  | Replace with your actual URI from Azure Portal |
| API returns 500 errors                     | Check `api/local.settings.json` has correct keys |
| `func start` fails                         | Install Azure Functions Core Tools v4          |
| CORS errors in browser                     | Ensure `Host.CORS` is `"*"` in local.settings |
| Database not created                       | It auto-creates on first API call              |
