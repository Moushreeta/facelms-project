# FACE Prep Campus LMS - README

## 1. Overview

This is a Learning Management System (LMS) designed to track and manage mentor performance within FACE Prep's campus programs. It provides role-based access for different employees, from CEO to Mentors, and includes features for performance tracking, attendance marking, and user management.

This version is integrated with Google Firebase to provide a secure, real-time, and persistent database.

**Tech Stack:**
- React 19
- TypeScript
- Tailwind CSS
- Google Firebase (Authentication & Firestore)
- Recharts (for charts)
- Lucide React (for icons)

## 2. Firebase Setup (Required)

You must create a Firebase project to run this application.

### Step 2.1: Create Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the on-screen instructions to create a new project.

### Step 2.2: Create a Web App
1.  Inside your new project, click the Web icon (`</>`) to add a new web app.
2.  Give it a nickname (e.g., "LMS Frontend") and click **"Register app"**.
3.  Firebase will provide you with a `firebaseConfig` object. **Copy this object.** You will need it in the next section.

### Step 2.3: Enable Authentication
1.  In the left-hand menu, go to **Build > Authentication**.
2.  Click **"Get started"**.
3.  Under the "Sign-in method" tab, select **"Email/Password"** from the list.
4.  Enable it and click **"Save"**.

### Step 2.4: Enable Firestore Database
1.  In the left-hand menu, go to **Build > Firestore Database**.
2.  Click **"Create database"**.
3.  Start in **Production mode**.
4.  Choose a location for your database (e.g., `us-central`).
5.  Click **"Enable"**.

## 3. Local Project Setup

### Step 3.1: Configure Firebase in the App
1.  In the project's root directory, create a new file named `firebase.ts`.
2.  Paste the following code into `firebase.ts`, replacing the placeholder values with the `firebaseConfig` object you copied in Step 2.2.

```typescript
// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:XXXXXXXXXXXXXXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

```

### Step 3.2: Run the Application
This project is a static web app and does not require a build process. You can run it using any simple local server. If you use VS Code, the **"Live Server"** extension is a great option.
1.  Install the "Live Server" extension in VS Code.
2.  Right-click on `index.html` in the file explorer.
3.  Select **"Open with Live Server"**.

## 4. Data Seeding (CRITICAL STEP)

Your app will be empty initially. You need to add the initial data to Firestore and create user accounts in Firebase Authentication.

### Step 4.1: Add Data to Firestore
For each of the collections below (`users`, `subjects`, etc.), follow these steps:
1.  Go to your **Firestore Database** in the Firebase Console.
2.  Click **"+ Start collection"**.
3.  Enter the collection ID (e.g., `users`).
4.  Instead of adding one document, we will add them with specific IDs. For each object in the JSON data below, click **"Add document"**.
5.  Enter the object's `id` as the **Document ID**.
6.  Copy the fields and values from the JSON object into the Firestore fields.
7.  Repeat for all documents in the collection.

---
**Collection: `users`**
```json
[
  {"id": "admin", "employeeId": "Admin", "name": "System Admin", "role": "Admin", "reportsTo": null},
  {"id": "ceo-kr", "employeeId": "FPC-CEO-KR", "name": "Karthik Raja", "role": "CEO", "reportsTo": null},
  {"id": "pm-ak", "employeeId": "FPC-PM-AK", "name": "Ashok Kumar", "role": "PM", "reportsTo": "ceo-kr"},
  {"id": "sme-kau", "employeeId": "FPC-SME-KAU", "name": "Kaustav", "role": "SME", "reportsTo": "pm-ak", "department": "Data Science"},
  {"id": "sme-amr", "employeeId": "FPC-SME-AMR", "name": "Amrita", "role": "SME", "reportsTo": "pm-ak", "department": "English"},
  {"id": "ld-001", "employeeId": "FPC-LD-01", "name": "Anjali Mehta", "role": "L&D Manager", "reportsTo": "pm-ak"},
  {"id": "cm-tn-01", "employeeId": "FPC-CM-TN-01", "name": "Karthik Raja Sr.", "role": "Campus Manager", "reportsTo": "pm-ak", "state": "Tamil Nadu", "smeId": "sme-kau"},
  {"id": "cm-mh-01", "employeeId": "FPC-CM-MH-01", "name": "Suresh Patil", "role": "Campus Manager", "reportsTo": "pm-ak", "state": "Maharashtra", "smeId": "sme-amr"},
  {"id": "cicm-psg-01", "employeeId": "FPC-CICM-PSG-01", "name": "Deepa Kumar", "role": "Campus In-charge", "reportsTo": "cm-tn-01", "campus": "PSG College", "state": "Tamil Nadu", "department": "CSE", "smeId": "sme-kau"},
  {"id": "cicm-vit-01", "employeeId": "FPC-CICM-VIT-01", "name": "Vijay Nair", "role": "Campus In-charge", "reportsTo": "cm-tn-01", "campus": "VIT Vellore", "state": "Tamil Nadu", "department": "IT", "smeId": "sme-kau"},
  {"id": "cicm-coep-01", "employeeId": "FPC-CICM-COEP-01", "name": "Pooja Desai", "role": "Campus In-charge", "reportsTo": "cm-mh-01", "campus": "COEP Pune", "state": "Maharashtra", "department": "Mechanical", "smeId": "sme-amr"},
  {"id": "m-psg-cse-01", "employeeId": "FPC-M-PSG-01", "name": "Arun Pandian", "role": "Mentor", "reportsTo": "cicm-psg-01", "campus": "PSG College", "state": "Tamil Nadu", "department": "CSE", "smeId": "sme-kau"},
  {"id": "m-psg-cse-02", "employeeId": "FPC-M-PSG-02", "name": "Saranya Devi", "role": "Mentor", "reportsTo": "cicm-psg-01", "campus": "PSG College", "state": "Tamil Nadu", "department": "CSE", "smeId": "sme-kau"},
  {"id": "m-vit-it-01", "employeeId": "FPC-M-VIT-01", "name": "Rajesh Kumar", "role": "Mentor", "reportsTo": "cicm-vit-01", "campus": "VIT Vellore", "state": "Tamil Nadu", "department": "IT", "smeId": "sme-kau"},
  {"id": "m-coep-mech-01", "employeeId": "FPC-M-COEP-01", "name": "Ganesh Joshi", "role": "Mentor", "reportsTo": "cicm-coep-01", "campus": "COEP Pune", "state": "Maharashtra", "department": "Mechanical", "smeId": "sme-amr"}
]
```

---
**Collection: `subjects`**
```json
[
  {"id": "subj-dsa", "name": "Data Structures & Algorithms"},
  {"id": "subj-web", "name": "Advanced Web Development"},
  {"id": "subj-eng", "name": "Business English"}
]
```

---
**Collection: `mentorScores`** (Click "Auto-ID" for the Document ID for these)
```json
[
  {"scoreId": "s01", "mentorId": "m-psg-cse-01", "subjectId": "subj-dsa", "module": 1, "type": "Viva", "assessmentNumber": 1, "score": 30},
  {"scoreId": "s02", "mentorId": "m-psg-cse-01", "subjectId": "subj-dsa", "module": 1, "type": "Viva", "assessmentNumber": 2, "score": 100},
  {"scoreId": "s03", "mentorId": "m-psg-cse-01", "subjectId": "subj-dsa", "module": 2, "type": "Test", "assessmentNumber": 1, "score": 88},
  {"scoreId": "s04", "mentorId": "m-psg-cse-02", "subjectId": "subj-dsa", "module": 1, "type": "Test", "assessmentNumber": 1, "score": 72},
  {"scoreId": "s05", "mentorId": "m-vit-it-01", "subjectId": "subj-dsa", "module": 1, "type": "Viva", "assessmentNumber": 1, "score": 95},
  {"scoreId": "s06", "mentorId": "m-coep-mech-01", "subjectId": "subj-eng", "module": 1, "type": "Presentation", "assessmentNumber": 1, "score": 85}
]
```

---
**Collection: `dailyAttendance`** (Click "Auto-ID" for the Document ID)
```json
[
  {"attendanceId": "a01", "mentorId": "m-psg-cse-01", "date": "2025-07-07", "status": "Present", "recordedBy": "sme-kau"},
  {"attendanceId": "a02", "mentorId": "m-psg-cse-02", "date": "2025-07-07", "status": "Absent", "recordedBy": "sme-kau"},
  {"attendanceId": "a03", "mentorId": "m-vit-it-01", "date": "2025-07-07", "status": "Leave", "recordedBy": "sme-kau"}
]
```

---
**Collection: `pendingChanges`** (Click "Auto-ID" for the Document ID)
```json
[
  {"changeId": "c01", "proposedBy": "ld-001", "mentorId": "m-vit-it-01", "fieldToChange": "campus", "oldValue": "VIT Vellore", "newValue": "VIT Chennai", "status": "pending", "smeId": "sme-kau"}
]
```
---

### Step 4.2: Create Login Accounts
For each user in your `users` collection, you must create a corresponding login account.
1. Go to the **Authentication** section in the Firebase Console.
2. Click **"Add user"**.
3. For the **Email**, use the user's `employeeId`. For example, for the user with `employeeId: "FPC-CEO-KR"`, you will enter `FPC-CEO-KR@faceprep.lms` (the domain part can be anything, but keep it consistent). For the admin, use `Admin@faceprep.lms`.
4. Enter a **Password**.
5. Click **"Add user"**.
6. **IMPORTANT**: After creating the user, you will see a **User UID** in the table. You must go back to your Firestore `users` collection and **change the Document ID of that user to match this new User UID**. This links the authentication record to the database record.

## 5. Administrative Actions

For security, creating new users and resetting passwords must be done from the Firebase Console.
- **To Add a New User**: Follow the process in Step 4.2 to create an Auth account, then follow Step 4.1 to create their document in the `users` collection in Firestore, making sure the Document ID matches the User UID.
- **To Reset a Password**: In the **Authentication** tab, find the user, click the three dots at the end of the row, and select **"Reset password"**.

