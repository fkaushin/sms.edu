import fs from 'fs';
import crypto from 'crypto';

const uuidv4 = () => crypto.randomUUID();

const firstNames = [
  'Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Aryan', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya',
  'Diya', 'Ananya', 'Aadhya', 'Pihu', 'Khushi', 'Sara', 'Myra', 'Ira', 'Anvi', 'Riya',
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Sophia', 'Elijah', 'Isabella', 'James',
  'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'William', 'Harper', 'Alexander', 'Evelyn', 'Michael',
  'Abigail', 'Daniel', 'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Madison', 'Scarlett', 'Grace'
];

const lastNames = [
  'Sharma', 'Patel', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Joshi', 'Mehta', 'Rao', 'Reddy',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const departmentsData = [
  { name: 'Computer Science', id: '11111111-1111-1111-1111-111111111111' },
  { name: 'Information Technology', id: '22222222-2222-2222-2222-222222222222' },
  { name: 'Electronics', id: '33333333-3333-3333-3333-333333333333' },
  { name: 'Commerce', id: '44444444-4444-4444-4444-444444444444' }
];

const subjectsData = {
  'Computer Science': [
    'Data Structures', 'Database Systems', 'Operating Systems',
    'Computer Networks', 'Web Development', 'Software Engineering'
  ],
  'Information Technology': [
    'Programming Fundamentals', 'Information Security', 'Cloud Computing',
    'Mobile Development', 'Data Analytics', 'IT Project Management'
  ],
  'Electronics': [
    'Digital Electronics', 'Analog Circuits', 'Microprocessors',
    'Embedded Systems', 'Signal Processing', 'Communication Systems'
  ],
  'Commerce': [
    'Financial Accounting', 'Business Economics', 'Marketing Management',
    'Human Resource Management', 'Business Law', 'Entrepreneurship'
  ]
};

const genders = ['Male', 'Female'];
const examTypes = ['Mid-Term', 'End-Term', 'Quiz', 'Assignment'];

// Simple bcrypt hash for password "Password123"
const BCRYPT_HASH = '$2a$10$7EqJtDQOCG56U.g.x00KXu.n.Csn.63X59r8.tE7w27.7Z1v6C4y.';

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateData() {
  const sql = [];
  sql.push('-- ==========================================');
  sql.push('-- AUTO GENERATED DEMO DATA SEED FILE');
  sql.push('-- ==========================================');
  sql.push('');
  sql.push('');
  sql.push('-- Clean existing dynamic table data (except migrations)');
  sql.push('truncate table public.activities, public.marks, public.attendance, public.students, public.reports cascade;');
  sql.push('delete from public.profiles where role = \'STUDENT\';');
  sql.push('delete from auth.users where id not in (select id from public.profiles where role = \'ADMIN\');');
  sql.push('delete from public.subjects cascade;');
  sql.push('delete from public.departments cascade;');
  sql.push('');

  // 1. Insert Departments
  sql.push('-- 1. Insert Departments');
  departmentsData.forEach(dept => {
    sql.push(`insert into public.departments (id, name) values ('${dept.id}', '${dept.name}') on conflict (id) do update set name = excluded.name;`);
  });
  sql.push('');

  // 2. Insert Subjects
  sql.push('-- 2. Insert Subjects');
  const subjectsMap = {}; // departmentName -> array of subject IDs
  departmentsData.forEach(dept => {
    subjectsMap[dept.name] = [];
    const subjects = subjectsData[dept.name];
    subjects.forEach((subjName) => {
      const subjId = uuidv4();
      subjectsMap[dept.name].push(subjId);
      const credits = getRandomInt(3, 4);
      sql.push(`insert into public.subjects (id, name, department_id, credits) values ('${subjId}', '${subjName}', '${dept.id}', ${credits});`);
    });
  });
  sql.push('');

  // 3. Admin User Profile setup (make sure it exists)
  sql.push('-- 3. Ensure Admin User Profile Exists');
  const adminId = '00000000-0000-0000-0000-000000000000';
  sql.push(`
insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('${adminId}', '00000000-0000-0000-0000-000000000000', 'admin@university.edu', '${BCRYPT_HASH}', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"role":"ADMIN"}', now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, email, role)
values ('${adminId}', 'admin@university.edu', 'ADMIN')
on conflict (id) do update set role = 'ADMIN';
`);

  // 4. Generate 50 students
  sql.push('-- 4. Insert Student Users, Profiles, and Student Details');
  const students = [];
  const enrollmentNumbers = new Set();

  for (let i = 1; i <= 50; i++) {
    const studentId = uuidv4();
    const firstName = firstNames[i - 1] || getRandomElement(firstNames);
    const lastName = lastNames[i - 1] || getRandomElement(lastNames);
    
    // Choose department
    const dept = departmentsData[(i - 1) % departmentsData.length];
    
    // Unique Enrollment Number (format: DEPT-YEAR-XXX, e.g. CS-2026-001)
    const deptPrefix = dept.name.split(' ').map(w => w[0]).join('').toUpperCase();
    const startYear = getRandomInt(2023, 2026);
    let enrollmentNo = `${deptPrefix}${startYear}${String(i).padStart(3, '0')}`;
    while (enrollmentNumbers.has(enrollmentNo)) {
      enrollmentNo = `${deptPrefix}${startYear}${String(getRandomInt(100, 999))}`;
    }
    enrollmentNumbers.add(enrollmentNo);

    const email = `${enrollmentNo.toLowerCase()}@university.edu`;
    const dob = `${getRandomInt(2002, 2007)}-${String(getRandomInt(1, 12)).padStart(2, '0')}-${String(getRandomInt(1, 28)).padStart(2, '0')}`;
    const gender = getRandomElement(genders);
    const phone = `+1-555-${String(getRandomInt(100, 999))}-${String(getRandomInt(1000, 9999))}`;
    const address = `${getRandomInt(100, 9999)} Main Street, Suite ${getRandomInt(1, 100)}, Cityville`;
    const year = getRandomInt(1, 4);

    students.push({
      id: studentId,
      firstName,
      lastName,
      enrollmentNo,
      email,
      dept,
      year
    });

    // Insert into auth.users (triggers profile insert)
    sql.push(`insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values ('${studentId}', '00000000-0000-0000-0000-000000000000', '${email}', '${BCRYPT_HASH}', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{"role":"STUDENT"}', now(), now());`);
    
    // Explicitly insert into profiles as fallback or for deterministic order
    sql.push(`insert into public.profiles (id, email, role) values ('${studentId}', '${email}', 'STUDENT') on conflict (id) do nothing;`);

    // Insert into public.students
    sql.push(`insert into public.students (id, first_name, last_name, enrollment_no, date_of_birth, gender, phone, address, department_id, year, is_active) values ('${studentId}', '${firstName}', '${lastName}', '${enrollmentNo}', '${dob}', '${gender}', '${phone}', '${address}', '${dept.id}', ${year}, true);`);
  }
  sql.push('');

  // 5. Generate Attendance Records (~1200 records)
  // 50 students, each department has 6 subjects.
  // Let's generate ~24 attendance logs per student across their department subjects over a span of 10 days.
  sql.push('-- 5. Insert Attendance Records (~1200)');
  let attendanceCount = 0;
  const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE']; // ~80% present rate
  
  const datesList = [];
  for (let d = 1; d <= 12; d++) {
    datesList.push(`2026-06-${String(d).padStart(2, '0')}`);
  }

  students.forEach(student => {
    const deptSubjIds = subjectsMap[student.dept.name];
    deptSubjIds.forEach(subjId => {
      // Pick random dates for this student and subject
      const selectedDates = datesList.slice(0, getRandomInt(3, 5)); // 3-4 records per subject
      selectedDates.forEach(dateStr => {
        const status = getRandomElement(attendanceStatuses);
        sql.push(`insert into public.attendance (student_id, subject_id, date, status) values ('${student.id}', '${subjId}', '${dateStr}', '${status}') on conflict (student_id, subject_id, date) do nothing;`);
        attendanceCount++;
      });
    });
  });
  console.log(`Generated ${attendanceCount} attendance logs`);

  sql.push('');

  // 6. Generate Marks Records (~600 records)
  // 50 students, 6 subjects each.
  // We can insert 2 exam types (Mid-Term and End-Term) per subject for each student.
  // 50 * 6 * 2 = 600 records.
  sql.push('-- 6. Insert Marks Records (~600)');
  let marksCount = 0;
  students.forEach(student => {
    const deptSubjIds = subjectsMap[student.dept.name];
    deptSubjIds.forEach(subjId => {
      // Mid-term
      const midScore = getRandomInt(60, 100);
      const midGrade = midScore >= 90 ? 'A' : midScore >= 80 ? 'B' : midScore >= 70 ? 'C' : midScore >= 60 ? 'D' : 'F';
      sql.push(`insert into public.marks (student_id, subject_id, score, max_score, grade, exam_type) values ('${student.id}', '${subjId}', ${midScore}, 100, '${midGrade}', 'Mid-Term');`);
      marksCount++;

      // End-term
      const endScore = getRandomInt(55, 100);
      const endGrade = endScore >= 90 ? 'A' : endScore >= 80 ? 'B' : endScore >= 70 ? 'C' : endScore >= 60 ? 'D' : 'F';
      sql.push(`insert into public.marks (student_id, subject_id, score, max_score, grade, exam_type) values ('${student.id}', '${subjId}', ${endScore}, 100, '${endGrade}', 'End-Term');`);
      marksCount++;
    });
  });
  console.log(`Generated ${marksCount} marks logs`);
  sql.push('');

  // 7. Generate Activities (~100 records)
  sql.push('-- 7. Insert Activities (~100)');
  const activityTemplates = [
    { title: 'Joined Math Club', desc: 'Officially registered as a member of the university math club.', type: 'CLUB' },
    { title: 'Submitted Assignment', desc: 'Successfully uploaded final assignment for grading.', type: 'ACADEMIC' },
    { title: 'Attended Workshop', desc: 'Participated in the annual tech startup workshop.', type: 'WORKSHOP' },
    { title: 'Passed Exam', desc: 'Cleared the mid-term examinations with excellent performance.', type: 'ACADEMIC' },
    { title: 'Updated Profile', desc: 'Modified phone number and address in settings.', type: 'PROFILE' },
    { title: 'Paid Fees', desc: 'Completed semester tuition fee transaction.', type: 'FINANCE' },
    { title: 'Volunteered in Event', desc: 'Helped coordinate the annual department symposium.', type: 'VOLUNTEER' }
  ];

  for (let a = 0; a < 100; a++) {
    const student = getRandomElement(students);
    const template = getRandomElement(activityTemplates);
    const dateOffset = getRandomInt(0, 30);
    sql.push(`insert into public.activities (user_id, title, description, type, created_at) values ('${student.id}', '${template.title}', '${template.desc}', '${template.type}', now() - interval '${dateOffset} days');`);
  }
  sql.push('');

  // 8. Generate Reports (~20 records)
  sql.push('-- 8. Insert Reports (~20)');
  const reportTypes = ['Attendance', 'Performance', 'Summary', 'Departmental'];
  for (let r = 1; r <= 20; r++) {
    const type = getRandomElement(reportTypes);
    const title = `${type} Report - Q${getRandomInt(1, 4)} 2026`;
    const url = `https://pzplsngbdrwouqcovfuz.supabase.co/storage/v1/object/sign/reports/report_${r}.pdf`;
    sql.push(`insert into public.reports (title, type, file_url, created_at) values ('${title}', '${type}', '${url}', now() - interval '${getRandomInt(1, 15)} days');`);
  }
  sql.push('');

  sql.push('');

  fs.writeFileSync('./supabase/migrations/20260614000001_seed_data.sql', sql.join('\n'));
  console.log('Seed SQL file successfully written to ./supabase/migrations/20260614000001_seed_data.sql');
}

generateData();
