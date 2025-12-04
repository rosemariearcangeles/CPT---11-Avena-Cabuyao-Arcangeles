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
    const response = await fetch('check_auth.php');
    const data = await response.json();
    if (!data.loggedIn) {
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = 'index.html';
  }
}

async function loadUserData() {
  try {
    const response = await fetch('api/get_user_role.php');
    const data = await response.json();
    if (data.success) {
      userRole = data.role;
      $id('userName').textContent = data.username;
      $id('userRole').textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
      $id('userAvatar').textContent = data.username.charAt(0).toUpperCase();
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

function loadClassInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  classId = urlParams.get('id') || sessionStorage.getItem('currentClassId');
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
        <h1>Class Quizzes</h1>
        <a href="index.html" class="btn-primary">
          <i class="fas fa-plus"></i> Create Quiz
        </a>
      </div>
      <div id="quizList" class="quiz-list">
        <p class="empty-state">No quizzes yet. Create a quiz to assign to this class!</p>
      </div>
    </section>
  `;
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
      </div>
      <div id="quizList" class="quiz-list">
        <p class="empty-state">No quizzes available yet.</p>
      </div>
    </section>
  `;
}
