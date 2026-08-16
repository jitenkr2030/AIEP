# AIEP Project Notes

## Tech Stack
- Client-side JavaScript (localStorage + cloud sync)
- Google Apps Script API backend
- No Node.js server needed - static files serve through web server

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
- topics.js - Topics data

## Admin Features
- Overview (stats)
- Faculty Management (Create/Edit/Delete faculty accounts)
- Review Questions (Approve/Reject faculty questions)
- User Management (Add/Edit/Delete students, tier management)
- Vouchers
- History (exam results)
- Settings (admin credentials)
- Backup/Restore

## Faculty Features
- Login with admin-generated credentials
- Add questions (pending admin approval)
- Preview questions
- Password change

## User Features
- Signup/Login
- Dashboard (Profile, Stats, Exam History)
- Take exams
- View results, download certificates

## Fixes Done (Session Date: 2026)
### Fix 1 - User Dashboard
- Syntax error in app.js line 88 (missing opening quote)
- NAV_AUTH_BTN click handler changed from doLogout to showProfile
- updateAuthUI button onclick changed to showProfile
- renderProfile → showProfile function name fix

### Fix 2 - Faculty System
- admin.js syntax errors (lines 56,57,58 - missing quotes)
- admin.html broken link (faculty.htm → faculty.html)
- faculty.js syntax errors (lines 34,59,183)

### Fix 3 - Admin Student Management
- Added deleteUser function in db.js
- Added tier support in updateUserProfile in db.js
- Expanded T_USERS section in admin.html (Add/Edit/Delete form)
- Added refreshUsers with Edit/Delete buttons in admin.js
- Added addOrUpdateStudent function in admin.js
- Added BTN_AS_ADD event binding in admin.js

## How to Share New Session Context
Copy-paste this file content to new chat and say:
"PROJECT_NOTES.md padho aur kaam shuru karo"
