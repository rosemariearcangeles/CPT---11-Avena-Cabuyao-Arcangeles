# Education Mode Implementation

## Overview
Education Mode transforms the quiz engine into a classroom management system where teachers can create classes, assign quizzes, and students can join classes and complete assignments.

## Features Implemented

### 1. Homepage Mode Toggle
- **Location**: Hero section on index.html
- **Functionality**: Switch between Personal Mode and Education Mode
- **Behavior**: 
  - Changes hero text based on mode
  - Shows/hides role selection in registration
  - Persists mode selection in localStorage

### 2. Role-Based Registration
- **Student Role**: Can join classes and view assigned quizzes
- **Teacher Role**: Can create classes and assign quizzes
- **Implementation**: Role selection appears only in Education Mode

### 3. Separate Dashboards
- **Personal Dashboard** (`dashboard.html`): For individual quiz creation
- **Education Dashboard** (`education_dashboard.html`): For class management

### 4. Teacher Features
- Create classes with auto-generated 6-character codes
- View all created classes with student counts
- Assign quizzes to classes (to be implemented)
- View student submissions (to be implemented)

### 5. Student Features
- Join classes using class codes
- View enrolled classes with teacher names
- View assigned quizzes (to be implemented)
- Submit quiz attempts (to be implemented)

## Database Schema

### Tables Created
1. **users** - Added `role` column (student/teacher/admin)
2. **classes** - Stores class information
3. **class_members** - Links students to classes
4. **assignments** - Links quizzes to classes
5. **submissions** - Stores student quiz submissions

## API Endpoints

### Authentication
- `check_auth.php` - Check login status
- `login.php` - User login
- `register.php` - User registration (with role)
- `logout.php` - User logout

### Education Mode
- `api/get_user_role.php` - Get user's role
- `api/create_class.php` - Create a new class (teachers)
- `api/get_teacher_classes.php` - Get teacher's classes
- `api/get_student_classes.php` - Get student's classes
- `api/join_class.php` - Join a class (students)

## User Flow

### Teacher Flow
1. Toggle to Education Mode on homepage
2. Register/Login as Teacher
3. Redirected to Education Dashboard
4. Create classes
5. Share class codes with students
6. Create quizzes within classes
7. View student submissions

### Student Flow
1. Toggle to Education Mode on homepage
2. Register/Login as Student
3. Redirected to Education Dashboard
4. Join class using code
5. View assigned quizzes
6. Complete quizzes
7. View grades

## Next Steps (To Implement)

### High Priority
1. **Quiz Assignment System**
   - Teachers can assign existing quizzes to classes
   - Set due dates for assignments
   - API: `api/assign_quiz.php`

2. **Student Quiz View**
   - Students see assigned quizzes in their dashboard
   - Filter by class
   - Show due dates and completion status

3. **Quiz Submission**
   - Students complete assigned quizzes
   - Submissions linked to assignments
   - Auto-grading system

4. **Grade Book**
   - Teachers view all student submissions
   - See class performance analytics
   - Export grades

### Medium Priority
5. **Class Management**
   - Edit class details
   - Remove students from class
   - Delete classes

6. **Quiz Creation in Class Context**
   - Create quizzes directly within a class
   - Quiz templates
   - Question banks

7. **Notifications**
   - Email notifications for new assignments
   - Reminder for due dates
   - Grade notifications

### Low Priority
8. **Advanced Features**
   - Class announcements
   - Discussion boards
   - File sharing
   - Calendar integration

## File Structure
```
quiz_engine/
├── index.html (with mode toggle)
├── dashboard.html (personal mode)
├── education_dashboard.html (education mode)
├── education_mode.sql (database migration)
├── js/
│   ├── auth.js (updated with role handling)
│   ├── education_dashboard.js (new)
│   └── ...
├── api/
│   ├── get_user_role.php
│   ├── create_class.php
│   ├── get_teacher_classes.php
│   ├── get_student_classes.php
│   └── join_class.php
└── css/
    ├── dashboard.css (updated with education styles)
    └── index.css (updated with mode toggle styles)
```

## Testing Checklist

### Mode Toggle
- [ ] Toggle switches between Personal and Education
- [ ] Hero text changes appropriately
- [ ] Mode persists on page reload
- [ ] Role selection shows/hides correctly

### Registration
- [ ] Can register as Student
- [ ] Can register as Teacher
- [ ] Role is saved to database
- [ ] Redirects to correct dashboard

### Teacher Features
- [ ] Can create class
- [ ] Class code is generated
- [ ] Can view all classes
- [ ] Student count displays correctly

### Student Features
- [ ] Can join class with valid code
- [ ] Cannot join with invalid code
- [ ] Can view enrolled classes
- [ ] Teacher name displays correctly

## Known Issues
None currently

## Support
For issues or questions, contact the development team.
