# MedInsight AI – AI-Powered Medical Report Assistant

MedInsight AI is a full-stack AI-powered healthcare platform designed to help patients understand medical reports, receive AI-generated insights, request doctor consultations, and manage health updates securely.

The system includes three main roles: **Patient**, **Doctor**, and **Admin**. Patients can upload reports and view AI analysis, doctors can manage consultations and view feedback, while admins can verify doctors, manage users, and control uploaded reports.

---

## Project Overview

Many patients receive medical reports but struggle to understand medical terms, test results, and possible follow-up actions. MedInsight AI helps solve this problem by using AI to analyze uploaded medical reports and generate understandable summaries, key findings, and suggested questions for doctors.

This project combines AI report analysis with a real-world healthcare workflow, including secure authentication, email verification, role-based access control, doctor approval, consultation management, notifications, and admin control.

---

## Key Features

### Patient Features

- Email verification during registration
- Secure login with JWT authentication
- Upload medical reports
- View AI-generated report summaries
- View key findings from reports
- Generate suggested questions to ask doctors
- Compare medical reports
- Request doctor consultations
- View consultation status
- Chat with AI Doctor
- Receive notifications
- Reset password through email link

### Doctor Features

- Doctor registration with professional details
- Email verification before account review
- Admin approval required before dashboard access
- View assigned consultation requests
- Accept or decline consultation requests
- Manage consultation status
- View patient feedback and ratings
- Receive notifications

### Admin Features

- Admin dashboard
- View pending doctor registrations
- Approve or reject doctor accounts
- View uploaded patient reports
- Delete mistaken, duplicate, or unwanted reports
- View all user accounts
- Disable or reactivate user accounts
- Maintain platform safety and quality control

---

## AI Features

MedInsight AI uses AI to support medical report understanding.

AI-related features include:

- Medical report text analysis
- AI-generated report summaries
- Key findings extraction
- Suggested doctor questions
- AI Doctor chat support
- Report comparison support

### AI Workflow

```text
Patient uploads report
↓
Backend stores report file
↓
Text is extracted from the report
↓
AI model analyzes extracted medical content
↓
System generates summary, key findings, and doctor questions
↓
Patient can request a verified doctor consultation