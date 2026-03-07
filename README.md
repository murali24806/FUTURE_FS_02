# LeadFlow CRM

A simple and powerful CRM system to manage your business leads and customers.

---

## What is this?

LeadFlow CRM is a web application that helps businesses:
- Track leads coming from their website
- Manage customer information
- Schedule follow-ups with customers
- Work as a team with multiple agents

---

## What can it do?

### For Admin
- See all leads from all agents
- Add, edit and delete leads
- Create agent accounts
- View charts and statistics on dashboard
- See monthly lead reports

### For Agents
- See only their own assigned leads
- Add notes to leads
- Schedule follow-ups
- Update lead status

### Lead Tracking
Every lead can be tracked through these stages:
```
New → Contacted → Qualified → Converted → Lost
```

---

## Technologies Used

- **Frontend** — React.js (what you see in the browser)
- **Backend** — Node.js + Express (the server)
- **Database** — MongoDB (where data is stored)
- **Authentication** — JWT (secure login system)

---

## How to Install

### Step 1 — Get MongoDB (Free)
1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a free database cluster
4. Copy your connection string

### Step 2 — Setup the project
Download or clone this project to your computer

### Step 3 — Configure database
Open `backend/.env` file and add your MongoDB link:
```
MONGODB_URI=your_mongodb_link_here
```

### Step 4 — Run the backend
Open terminal in the `backend` folder and run:
```
npm install
npm start
```

### Step 5 — Run the frontend
Open a new terminal in the `frontend` folder and run:
```
npm install
npm run dev
```

### Step 6 — Open in browser
Go to: **http://localhost:3000**

---

## Login Details

Default login (set in backend/.env):
```
Email:    admin@crm.com
Password: Admin@123
```

---

## Project Files

```
crm/
├── backend/        → Server & database code
│   ├── .env        → Your settings & MongoDB link
│   ├── server.js   → Main server file
│   ├── models/     → Database structure
│   └── routes/     → API endpoints
│
└── frontend/       → Website code
    └── src/
        └── pages/
            ├── Login.jsx       → Login page
            ├── Dashboard.jsx   → Home with charts
            ├── Leads.jsx       → All leads list
            ├── LeadDetail.jsx  → Single lead info
            ├── Agents.jsx      → Manage agents
            └── Settings.jsx    → Settings page
```

---

## How to add leads from your website

Add this code to your website contact form:

```javascript
fetch('http://localhost:5000/api/leads/public/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Customer Name',
    email: 'customer@email.com',
    phone: '1234567890',
    message: 'I am interested'
  })
})
```

The lead will automatically appear in your CRM!

---

## Admin vs Agent

| What they can do | Admin | Agent |
|---|---|---|
| See all leads | ✅ Yes | ❌ No (own only) |
| Add leads | ✅ Yes | ✅ Yes |
| Delete leads | ✅ Yes | ❌ No |
| Add notes | ✅ Yes | ✅ Yes |
| Schedule follow-ups | ✅ Yes | ✅ Yes |
| Manage agents | ✅ Yes | ❌ No |
| View dashboard | ✅ Yes | ✅ Yes |

---

## Common Problems

**Login failed?**
- Make sure backend is running on port 5000
- Check your MongoDB URI in `.env` file

**MongoDB not connecting?**
- Check username and password in MongoDB Atlas
- Make sure Network Access allows 0.0.0.0/0 in Atlas

**Page not loading?**
- Make sure frontend is running on port 3000
- Open http://localhost:3000 in browser

---

Made with React, Node.js and MongoDB
