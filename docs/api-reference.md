# API Reference (Concise)

Base: `/api`

## Auth
- POST `/auth/login` { email, password } -> { token }
- GET `/auth/me` (Bearer) -> user profile

## Students
- GET `/students` (Admin/Teacher)
- POST `/students` (Admin)

## Courses
- GET `/courses` (All roles)
- POST `/courses` (Admin)

## Enrollments
- POST `/enrollments` (Admin)
- GET `/enrollments/course/:courseId` (Teacher)

## Assessments
- GET `/assessments/course/:courseId` (Teacher)
- POST `/assessments/course/:courseId` (Teacher)
- PUT `/assessments/:id` (Teacher)
- DELETE `/assessments/:id` (Teacher)

## Marks
- GET `/marks/course/:courseId` (Teacher)
- POST `/marks` (Teacher)
- GET `/marks/export/:courseId` (Teacher) -> CSV
- POST `/marks/import/:courseId` (Teacher) (text/csv)

## Results
- GET `/results/student/:studentId` (Student sees own, Teacher/Admin allowed)
- GET `/results/student/:studentId/pdf` (PDF)

## Users
- POST `/users/student` (Admin) -> create student login

Notes:
- All protected routes require `Authorization: Bearer <token>`
- Role checks enforced in middleware
