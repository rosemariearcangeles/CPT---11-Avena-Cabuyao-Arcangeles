// Class Dashboard JS
const $id = (id) => document.getElementById(id);

let userRole = 'student';
let classId = null;
let className = '';

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadUserData();
  loadClassInfo();
  renderClassDashboard();
});

async function checkAuth() {
  try {
    const response = await fetch('check_auth.php', {
      credentials: 'same-origin'
    });
    const data = await response.json();
    if (!data.loggedIn) {
      window.location.href = 'index.html';
      return;
    }
    
    if (data.role === 'personal') {
      window.location.href = 'dashboard.html';
      return;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = 'index.html';
  }
}

async function loadUserData() {
  try {
    const response = await fetch('api/get_user_role.php', {
      credentials: 'same-origin'
    });
    const data = await response.json();
    if (data.success) {
      userRole = data.role;
      $id('userName').textContent = data.username;
      $id('userRole').textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
      $id('userAvatar').textContent = data.username.charAt(0).toUpperCase();

      // Update sidebar mode badge based on role
      updateSidebarBadge(data.role);
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

function loadClassInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  classId = urlParams.get('id') || sessionStorage.getItem('currentClassId');
  
  if (!classId) {
    alert('No class selected');
    window.location.href = 'education_dashboard.html';
    return;
  }
  
  className = sessionStorage.getItem('currentClassName') || 'Class';
  $id('className').textContent = className;
}

function renderClassDashboard() {
  if (userRole === 'teacher') {
    renderTeacherClassDashboard();
  } else {
    renderStudentClassDashboard();
  }
}

function renderTeacherClassDashboard() {
  $id('sidebarNav').innerHTML = `
    <a href="#" class="nav-item active" data-section="quizzes">
      <i class="fas fa-clipboard-list"></i>
      <span>Quizzes</span>
    </a>
    <a href="#" class="nav-item" data-section="students">
      <i class="fas fa-users"></i>
      <span>Students</span>
    </a>
  `;

  $id('mainContent').innerHTML = `
    <section id="quizzes" class="section active">
      <div class="section-header">
        <h1>Assigned Quizzes</h1>
        <div style="display:flex;gap:0.5rem;">
          <a href="create_class_quiz.html" class="btn-primary">
            <i class="fas fa-plus"></i> Create Quiz
          </a>
          <button class="btn-primary" onclick="assignQuiz()" style="background:#10b981;">
            <i class="fas fa-link"></i> Assign Existing
          </button>
        </div>
      </div>
      <div id="quizList" class="quiz-list"></div>
    </section>
    <section id="students" class="section">
      <div class="section-header">
        <h1>Students</h1>
      </div>
      <div id="studentList" class="student-list"></div>
    </section>
  `;

  attachNavListeners();
  loadAssignments();
  loadStudents();
}

function renderStudentClassDashboard() {
  $id('sidebarNav').innerHTML = `
    <a href="#" class="nav-item active" data-section="quizzes">
      <i class="fas fa-clipboard-list"></i>
      <span>Quizzes</span>
    </a>
    <a href="#" class="nav-item" data-section="grades">
      <i class="fas fa-chart-line"></i>
      <span>My Grades</span>
    </a>
  `;

  $id('mainContent').innerHTML = `
    <section id="quizzes" class="section active">
      <div class="section-header">
        <h1>Available Quizzes</h1>
        <button class="btn btn-secondary" onclick="leaveCurrentClass()">
          <i class="fas fa-door-open"></i> Leave Class
        </button>
      </div>
      <div id="quizList" class="quiz-list"></div>
    </section>
    <section id="grades" class="section">
      <div class="section-header">
        <h1>My Grades</h1>
      </div>
      <div id="gradesList" class="grades-list"></div>
    </section>
  `;

  attachNavListeners();
  loadAssignments();
  loadGrades();
}

function attachNavListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      $id(section)?.classList.add('active');
    });
  });
}

async function loadStudents() {
  try {
    const response = await fetch('api/get_class_students.php?class_id=' + encodeURIComponent(classId), {
      credentials: 'same-origin'
    });
    const data = await response.json();
    const list = $id('studentList');
    
    if (data.success && data.students.length > 0) {
      list.innerHTML = data.students.map(s => `
        <div class="student-item">
          <div class="student-avatar">${s.username.charAt(0).toUpperCase()}</div>
          <div class="student-info">
            <h4>${s.username}</h4>
            <p>${s.email}</p>
          </div>
          <div class="student-date">Joined ${new Date(s.joined_at).toLocaleDateString()}</div>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p class="empty-state">No students enrolled yet.</p>';
    }
  } catch (error) {
    console.error('Failed to load students:', error);
  }
}

async function loadAssignments() {
  try {
    const response = await fetch('api/get_class_assignments.php?class_id=' + encodeURIComponent(classId), {
      credentials: 'same-origin'
    });
    const data = await response.json();
    const list = $id('quizList');
    
    if (data.success && data.assignments.length > 0) {
      list.innerHTML = data.assignments.map(a => `
        <div class="quiz-item" onclick="${userRole === 'student' ? `takeQuiz(${a.id}, '${a.quiz_name}')` : ''}" style="${userRole === 'student' ? 'cursor:pointer' : ''}">
          <div class="quiz-info">
            <h3>${a.title || a.quiz_name}</h3>
            <div class="quiz-meta">
              <span><i class="fas fa-question-circle"></i> ${a.total_questions} questions</span>
              ${a.due_date ? `<span><i class="fas fa-calendar"></i> Due ${new Date(a.due_date).toLocaleDateString()}</span>` : ''}
            </div>
          </div>
          ${userRole === 'teacher' ? `<div class="quiz-actions"><button class="btn btn-danger btn-sm btn-delete" data-quiz-id="${a.quiz_id}" data-title="${a.title || a.quiz_name}"><i class="fas fa-trash"></i></button></div>` : ''}
        </div>
      `).join('');
      if (userRole === 'teacher') {
        document.querySelectorAll('#quizList .btn-delete').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const quizId = parseInt(btn.dataset.quizId, 10);
            const title = btn.dataset.title || 'this quiz';
            await deleteQuizFromClass(quizId, title);
          });
        });
      }
    } else {
      list.innerHTML = '<p class="empty-state">No quizzes assigned yet.</p>';
    }
  } catch (error) {
    console.error('Failed to load assignments:', error);
  }
}

async function deleteQuizFromClass(quizId, title) {
  if (!confirm(`Delete quiz "${title}"? This will remove its assignments and submissions.`)) return;
  try {
    const csrfToken = await getCSRFToken();
    const response = await fetch('api/delete_quiz.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'same-origin',
      body: JSON.stringify({ quiz_id: quizId })
    });
    const data = await response.json();
    if (data.success) {
      alert('Quiz deleted.');
      loadAssignments();
    } else {
      alert('Failed to delete quiz: ' + (data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Delete quiz error:', err);
    alert('Error deleting quiz. Please try again.');
  }
}

async function loadGrades() {
  try {
    const response = await fetch('api/get_student_grades.php?class_id=' + encodeURIComponent(classId), {
      credentials: 'same-origin'
    });
    const data = await response.json();
    const list = $id('gradesList');
    
    if (data.success && data.grades.length > 0) {
      list.innerHTML = data.grades.map(g => {
        const percentage = g.total_questions > 0 ? Math.round((g.score / g.total_questions) * 100) : 0;
        return `
          <div class="grade-item">
            <div class="grade-info">
              <h4>${g.title || g.quiz_name}</h4>
              <p>Submitted ${new Date(g.submitted_at).toLocaleDateString()}</p>
            </div>
            <div class="grade-score">
              <span class="score-badge ${percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low'}">${percentage}%</span>
              <p>${g.score}/${g.total_questions}</p>
            </div>
          </div>
        `;
      }).join('');
    } else {
      list.innerHTML = '<p class="empty-state">No grades yet.</p>';
    }
  } catch (error) {
    console.error('Failed to load grades:', error);
  }
}

async function assignQuiz() {
  try {
    const response = await fetch('api/get_teacher_quizzes.php', {
      credentials: 'same-origin'
    });
    const data = await response.json();
    
    if (!data.success || data.quizzes.length === 0) {
      alert('No completed quizzes available. Create a quiz first!');
      return;
    }
    
    const quizOptions = data.quizzes.map((q, i) => `${i + 1}. ${q.quiz_name} (${q.total_questions} questions)`).join('\n');
    const selection = prompt(`Select quiz to assign:\n${quizOptions}\n\nEnter number:`);
    
    if (!selection) return;
    
    const index = parseInt(selection) - 1;
    if (index < 0 || index >= data.quizzes.length) {
      alert('Invalid selection');
      return;
    }
    
    const quiz = data.quizzes[index];
    const title = prompt('Assignment title:', quiz.quiz_name);
    
    if (!title) return;
    
    const csrfToken = await getCSRFToken();
    const assignResponse = await fetch('api/assign_quiz.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'same-origin',
      body: JSON.stringify({ class_id: classId, quiz_id: quiz.id, title })
    });
    
    const assignData = await assignResponse.json();
    
    if (assignData.success) {
      alert('Quiz assigned successfully!');
      loadAssignments();
    } else {
      alert('Failed to assign quiz: ' + assignData.message);
    }
  } catch (error) {
    console.error('Failed to assign quiz:', error);
    alert('Error assigning quiz');
  }
}

function takeQuiz(assignmentId, quizName) {
  sessionStorage.setItem('currentAssignmentId', assignmentId);
  sessionStorage.setItem('currentAssignmentName', quizName);
  window.location.href = 'take_quiz.html?assignment=' + assignmentId;
}

function updateSidebarBadge(role) {
  const badgeElement = document.querySelector('.sidebar .mode-badge');
  if (badgeElement) {
    const isEducationUser = role === 'student' || role === 'teacher';
    if (isEducationUser) {
      badgeElement.textContent = role === 'teacher' ? 'Teacher' : 'Student';
    } else {
      badgeElement.textContent = 'Personal';
    }
  }
}

async function leaveCurrentClass() {
  if (!confirm('Leave this class? You will no longer see its quizzes and grades.')) return;

  try {
    const csrfToken = await getCSRFToken();
    const response = await fetch('api/leave_class.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'same-origin',
      body: JSON.stringify({ class_id: classId })
    });

    const data = await response.json();
    if (data.success) {
      alert('You left the class.');
      sessionStorage.removeItem('currentClassId');
      sessionStorage.removeItem('currentClassName');
      window.location.href = 'education_dashboard.html';
    } else {
      alert('Failed to leave class: ' + (data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Leave class error:', err);
    alert('Error leaving class. Please try again.');
  }
}
