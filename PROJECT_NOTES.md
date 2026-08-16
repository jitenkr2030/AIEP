# AIEP Project Notes

## Tech Stack
- Client-side JavaScript (localStorage + cloud sync)
- Google Apps Script API backend
- Static files serve through web server

## Roles
- Admin - admin.html (default: admin / admin@2026)
- Faculty - faculty.html (admin creates accounts)
- User - index.html (signup or admin adds)

## Key Files
- index.html + app.js - Student portal
- admin.html + admin.js - Admin panel
- faculty.html + faculty.js - Faculty panel
- db.js - Database (localStorage + cloud API)
- exams.js - Exam questions data
- monthly-exams.js - 12 Month Exam Series
- topics.js - Topics data
- security.js - Anti-cheating & platform security

## Features
### Admin Panel
- Overview (stats)
- Faculty Management (Create/Edit/Delete)
- Review Questions (Approve/Reject)
- User Management (Add/Edit/Delete students, tier)
- Vouchers
- Exam History
- Settings (admin credentials)
- Backup/Restore

### Faculty Panel
- Login with admin-generated credentials
- Add questions (pending admin approval)
- Preview questions
- Password change

### Student Portal
- Signup/Login with password hashing (SHA-256)
- Dashboard (Profile, Stats, Exam History)
- Take exams with anti-cheating
- View results, download certificates

### Monthly Exam Series (12 Months)
- January: National Scholarship Exam
- February: Science & Tech Olympiad
- March: Commerce & Business Challenge
- April: Language & Communication Skills
- May: Summer National Mega Exam
- June: History Geography & Civics Challenge
- July: Reasoning & Aptitude Challenge
- August: Computer & Maths Challenge
- September: AI & Digital Skills Challenge
- October: Excel & Data Analysis Challenge
- November: General Knowledge Challenge
- December: National Mega Online Exam

### Security (security.js)
- SHA-256 password hashing
- Login rate limiting (5 attempts, 15 min lockout)
- Session timeout (120 min)
- Anti-cheating during exams:
  - Tab switch detection (3 warnings then auto-submit)
  - Fullscreen enforcement
  - Right-click disabled
  - Copy/Paste/Cut disabled
  - Keyboard shortcuts disabled (F12, Ctrl+C, etc.)
  - Text selection disabled
  - DevTools detection
  - Browser back button disabled
  - Question randomization
  - Option randomization
- Result tampering prevention (checksum)
- Audit logging
- Input sanitization (XSS prevention)

## Fixes Done
### Fix 1 - User Dashboard
- Syntax error app.js line 88 (missing quote)
- NAV_AUTH_BTN click opens profile not logout
- renderProfile to showProfile function name fix

### Fix 2 - Faculty System
- admin.js syntax errors (lines 56,57,58)
- admin.html broken link (faculty.htm to faculty.html)
- faculty.js syntax errors (lines 34,59,183)

### Fix 3 - Admin Student Management
- deleteUser function in db.js
- tier support in updateUserProfile
- Expanded T_USERS section in admin.html
- refreshUsers with Edit/Delete buttons
- addOrUpdateStudent function
- BTN_AS_ADD event binding

### Fix 4 - Monthly Exam Series
- 12 monthly exams with 30+ papers and 1500+ questions
- Monthly category in buildCats filter
- monthly-exams.js loaded in all HTML files

### Fix 5 - Security Implementation
- security.js module (16 security features)
- Integrated into app.js (login, exam, submit)
- Password hashing for new signups
- Backward-compatible login for existing users
- migratePasswords for database upgrade

## How to Start New Session
Copy-paste this file to new chat and say:
"PROJECT_NOTES.md padho aur kaam shuru karo"
