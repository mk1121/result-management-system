import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const api = {
  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  async me(token) {
    const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Me failed');
    return res.json();
  },
  async results(token, studentId) {
    const res = await fetch(`/api/results/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Results failed');
    return res.json();
  },
  async resultsPdf(token, studentId) {
    const res = await fetch(`/api/results/student/${studentId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('PDF failed');
    return res.blob();
  },
  async courses(token) {
    const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Courses failed');
    return res.json();
  },
  async students(token) {
    const res = await fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Students failed');
    return res.json();
  },
  async assessmentsByCourse(token, courseId) {
    const res = await fetch(`/api/assessments/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Assessments failed');
    return res.json();
  },
  async createAssessment(token, courseId, body) {
    const res = await fetch(`/api/assessments/course/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Create assessment failed');
    return res.json();
  },
  async updateAssessment(token, id, body) {
    const res = await fetch(`/api/assessments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Update assessment failed');
    return res.json();
  },
  async deleteAssessment(token, id) {
    const res = await fetch(`/api/assessments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Delete assessment failed');
    return res.json();
  },
  async enrollmentsByCourse(token, courseId) {
    const res = await fetch(`/api/enrollments/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Enrollments failed');
    return res.json();
  },
  async marksByCourse(token, courseId) {
    const res = await fetch(`/api/marks/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Marks failed');
    return res.json();
  },
  async exportMarks(token, courseId) {
    const res = await fetch(`/api/marks/export/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Export failed');
    return res.text();
  },
  async importMarks(token, courseId, csvText) {
    const res = await fetch(`/api/marks/import/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv', Authorization: `Bearer ${token}` },
      body: csvText,
    });
    if (!res.ok) throw new Error('Import failed');
    return res.json();
  },
  async saveMark(token, payload) {
    const res = await fetch('/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Save mark failed');
    return res.json();
  },
  async createStudent(token, body) {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Create student failed');
    return res.json();
  },
  async createCourse(token, body) {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Create course failed');
    return res.json();
  },
  async enrollStudent(token, body) {
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Enroll failed');
    return res.json();
  },
  async createStudentLogin(token, body) {
    const res = await fetch('/api/users/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Create student login failed');
    return res.json();
  },
};

function App() {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('student123');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .me(token)
      .then((u) => setUser(u))
      .catch(() => {
        setToken('');
        localStorage.removeItem('token');
      });
  }, [token]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    api
      .results(token, user.studentId)
      .then((r) => setResults(r))
      .catch((e) => setError(e.message));
  }, [user, token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              !user ? (
                <div style={{ padding: 24 }}>Loading...</div>
              ) : user.role === 'student' ? (
                <StudentDashboard user={user} token={token} results={results} onLogout={() => { localStorage.removeItem('token'); setToken(''); setUser(null); }} />
              ) : user.role === 'teacher' ? (
                <TeacherDashboard token={token} onLogout={() => { localStorage.removeItem('token'); window.location.href = '/'; }} />
              ) : (
                <AdminDashboard token={token} onLogout={() => { localStorage.removeItem('token'); window.location.href = '/'; }} />
              )
            ) : (
              <LoginPage email={email} setEmail={setEmail} password={password} setPassword={setPassword} setToken={setToken} error={error} setError={setError} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export function RMSApp() { return <App />; }
const mountNode = typeof document !== 'undefined' ? document.getElementById('root') : null;
if (mountNode) {
  createRoot(mountNode).render(<RMSApp />);
}

function LoginPage({ email, setEmail, password, setPassword, setToken, error, setError }) {
  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>RMS Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
      <button
        onClick={async () => {
          setError('');
          try {
            const { token: t } = await api.login(email, password);
            localStorage.setItem('token', t);
            setToken(t);
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        Login
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12, color: '#555' }}>
        Demo users: alice@example.com/student123, teacher@example.com/teacher123, admin@example.com/admin123
      </div>
    </div>
  );
}

function StudentDashboard({ user, token, results, onLogout }) {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Welcome, {user.name || user.email}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={async () => {
              const blob = await api.resultsPdf(token, user.studentId);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'results.pdf';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
          >
            Download PDF
          </button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div>Role: {user.role}</div>
      {results && (
        <div style={{ marginTop: 24 }}>
          <h3>Your Results</h3>
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Percent</th>
                <th>Grade</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((r) => (
                <tr key={r.course.id}>
                  <td>{r.course.code} - {r.course.title}</td>
                  <td>{r.percent}%</td>
                  <td>{r.letter}</td>
                  <td>{r.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8 }}>
            GPA: <strong>{results.gpa}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherDashboard({ token, onLogout }) {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Teacher Panel</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <TeacherView token={token} />
    </div>
  );
}

function AdminDashboard({ token, onLogout }) {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Admin Panel</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <AdminView token={token} />
    </div>
  );
}

function TeacherView({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [marks, setMarks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [csv, setCsv] = useState('');
  const [newAssessment, setNewAssessment] = useState({ name: '', weightPercent: 0, maxScore: 100 });
  const [assessmentMsg, setAssessmentMsg] = useState('');

  useEffect(() => {
    api.courses(token).then(setCourses).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!selectedCourseId) return;
    Promise.all([
      api.assessmentsByCourse(token, selectedCourseId),
      api.enrollmentsByCourse(token, selectedCourseId),
      api.marksByCourse(token, selectedCourseId),
    ]).then(([a, e, m]) => {
      setAssessments(a);
      setEnrollments(e);
      setMarks(m);
    });
  }, [selectedCourseId, token]);

  const marksMap = useMemo(() => {
    const map = new Map();
    for (const m of marks) map.set(`${m.student}-${m.assessment}`, m);
    return map;
  }, [marks]);

  const weightTotal = useMemo(() => assessments.reduce((s, a) => s + Number(a.weightPercent || 0), 0), [assessments]);

  const onChangeScore = async (studentId, assessmentId, courseId, score) => {
    setSaving(true);
    try {
      const num = Number(score);
      if (Number.isNaN(num)) return;
      const saved = await api.saveMark(token, { student: studentId, course: courseId, assessment: assessmentId, score: num });
      setMarks((prev) => {
        const next = [...prev];
        const idx = next.findIndex((x) => x.student === studentId && x.assessment === assessmentId);
        if (idx >= 0) next[idx] = saved;
        else next.push(saved);
        return next;
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Teacher Panel</h3>
      <div style={{ marginBottom: 12 }}>
        <label>
          Course:{' '}
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
            <option value="">Select…</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedCourseId && (
        <div>
          <div style={{ margin: '16px 0', padding: 12, border: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0 }}>Assessments</h4>
              <div>Total weight: <strong style={{ color: weightTotal > 100 ? 'red' : 'inherit' }}>{weightTotal}%</strong></div>
            </div>
            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', marginTop: 8 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Weight %</th>
                  <th>Max Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <AssessmentRow
                    key={a._id}
                    a={a}
                    onSave={async (updated) => {
                      setAssessmentMsg('');
                      const saved = await api.updateAssessment(token, a._id, updated);
                      setAssessments((prev) => prev.map((x) => (x._id === a._id ? saved : x)));
                      setAssessmentMsg('Assessment updated');
                    }}
                    onDelete={async () => {
                      setAssessmentMsg('');
                      await api.deleteAssessment(token, a._id);
                      setAssessments((prev) => prev.filter((x) => x._id !== a._id));
                      setAssessmentMsg('Assessment deleted');
                    }}
                  />
                ))}
                <tr>
                  <td>
                    <input value={newAssessment.name} onChange={(e) => setNewAssessment({ ...newAssessment, name: e.target.value })} />
                  </td>
                  <td>
                    <input type="number" value={newAssessment.weightPercent} onChange={(e) => setNewAssessment({ ...newAssessment, weightPercent: Number(e.target.value) })} />
                  </td>
                  <td>
                    <input type="number" value={newAssessment.maxScore} onChange={(e) => setNewAssessment({ ...newAssessment, maxScore: Number(e.target.value) })} />
                  </td>
                  <td>
                    <button onClick={async () => {
                      setAssessmentMsg('');
                      const created = await api.createAssessment(token, selectedCourseId, newAssessment);
                      setAssessments((prev) => [...prev, created]);
                      setNewAssessment({ name: '', weightPercent: 0, maxScore: 100 });
                      setAssessmentMsg('Assessment created');
                    }}>Add</button>
                  </td>
                </tr>
              </tbody>
            </table>
            {assessmentMsg && <div style={{ marginTop: 8, color: 'green' }}>{assessmentMsg}</div>}
          </div>

          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Student</th>
                {assessments.map((a) => (
                  <th key={a._id}>
                    {a.name} ({a.weightPercent}%)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrollments.map((en) => (
                <tr key={en._id}>
                  <td>{en.student.name}</td>
                  {assessments.map((a) => {
                    const key = `${en.student._id}-${a._id}`;
                    const existing = marksMap.get(key);
                    return (
                      <td key={a._id}>
                        <input
                          type="number"
                          min={0}
                          max={a.maxScore}
                          defaultValue={existing ? existing.score : ''}
                          onBlur={(e) => onChangeScore(en.student._id, a._id, en.course._id, e.target.value)}
                          style={{ width: 80 }}
                        />
                        <div style={{ color: '#666', fontSize: 12 }}>/{a.maxScore}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {saving && <div style={{ marginTop: 8 }}>Saving…</div>}

          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button onClick={async () => {
              const text = await api.exportMarks(token, selectedCourseId);
              setCsv(text);
            }}>Export CSV</button>
            <button onClick={async () => {
              if (!csv.trim()) return;
              await api.importMarks(token, selectedCourseId, csv);
              // refresh marks
              const m = await api.marksByCourse(token, selectedCourseId);
              setMarks(m);
            }}>Import CSV</button>
          </div>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="CSV area (student,assessment,score)" style={{ width: '100%', height: 120, marginTop: 8 }} />
        </div>
      )}
    </div>
  );
}

function AssessmentRow({ a, onSave, onDelete }) {
  const [edit, setEdit] = useState({ name: a.name, weightPercent: a.weightPercent, maxScore: a.maxScore });
  const [busy, setBusy] = useState(false);
  return (
    <tr>
      <td>
        <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
      </td>
      <td>
        <input type="number" value={edit.weightPercent} onChange={(e) => setEdit({ ...edit, weightPercent: Number(e.target.value) })} />
      </td>
      <td>
        <input type="number" value={edit.maxScore} onChange={(e) => setEdit({ ...edit, maxScore: Number(e.target.value) })} />
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>
        <button disabled={busy} onClick={async () => { setBusy(true); try { await onSave(edit); } finally { setBusy(false); } }}>Save</button>{' '}
        <button disabled={busy} onClick={async () => { if (!confirm('Delete assessment?')) return; setBusy(true); try { await onDelete(); } finally { setBusy(false); } }}>Delete</button>
      </td>
    </tr>
  );
}

function AdminView({ token }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [newStudent, setNewStudent] = useState({ studentId: '', name: '', program: '', batch: '' });
  const [newCourse, setNewCourse] = useState({ code: '', title: '', credits: 3 });
  const [enroll, setEnroll] = useState({ student: '', course: '', semester: 'S1' });
  const [msg, setMsg] = useState('');
  const [loginForm, setLoginForm] = useState({ studentId: '', email: '', password: '' });

  const refresh = async () => {
    const [s, c] = await Promise.all([api.students(token), api.courses(token)]);
    setStudents(s);
    setCourses(c);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Admin Panel</h3>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid #ddd', padding: 12, minWidth: 280 }}>
          <h4>Create Student</h4>
          <input placeholder="Student ID" value={newStudent.studentId} onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })} />
          <input placeholder="Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
          <input placeholder="Program" value={newStudent.program} onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })} />
          <input placeholder="Batch" value={newStudent.batch} onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })} />
          <button
            onClick={async () => {
              setMsg('');
              await api.createStudent(token, newStudent);
              setNewStudent({ studentId: '', name: '', program: '', batch: '' });
              await refresh();
              setMsg('Student created');
            }}
          >
            Create
          </button>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 12, minWidth: 280 }}>
          <h4>Create Course</h4>
          <input placeholder="Code" value={newCourse.code} onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })} />
          <input placeholder="Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} />
          <input type="number" placeholder="Credits" value={newCourse.credits} onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })} />
          <button
            onClick={async () => {
              setMsg('');
              await api.createCourse(token, newCourse);
              setNewCourse({ code: '', title: '', credits: 3 });
              await refresh();
              setMsg('Course created');
            }}
          >
            Create
          </button>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 12, minWidth: 280 }}>
          <h4>Enroll Student</h4>
          <select value={enroll.student} onChange={(e) => setEnroll({ ...enroll, student: e.target.value })}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.studentId} - {s.name}
              </option>
            ))}
          </select>
          <select value={enroll.course} onChange={(e) => setEnroll({ ...enroll, course: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
          <input placeholder="Semester" value={enroll.semester} onChange={(e) => setEnroll({ ...enroll, semester: e.target.value })} />
          <button
            onClick={async () => {
              setMsg('');
              await api.enrollStudent(token, enroll);
              setEnroll({ student: '', course: '', semester: 'S1' });
              setMsg('Enrolled');
            }}
          >
            Enroll
          </button>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 12, minWidth: 280 }}>
          <h4>Create Student Login</h4>
          <select value={loginForm.studentId} onChange={(e) => setLoginForm({ ...loginForm, studentId: e.target.value })}>
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.studentId} - {s.name}
              </option>
            ))}
          </select>
          <input placeholder="Email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
          <input type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button
            onClick={async () => {
              setMsg('');
              await api.createStudentLogin(token, loginForm);
              setLoginForm({ studentId: '', email: '', password: '' });
              setMsg('Student login created');
            }}
          >
            Create Login
          </button>
        </div>
      </div>

      {msg && <div style={{ marginTop: 12, color: 'green' }}>{msg}</div>}
    </div>
  );
}


