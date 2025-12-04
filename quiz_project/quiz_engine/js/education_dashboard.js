// Education Dashboard JS
const $id = (id) => document.getElementById(id);

let userRole = 'student';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadUserData();
  renderDashboard();
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
    }
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

function renderDashboard() {
  if (userRole === 'teacher') {
    renderTeacherDashboard();
  } else {
    renderStudentDashboard();
  }
}

function renderTeacherDashboard() {
  $id('sidebarNav').innerHTML = `
    <a href="#" class="nav-item active" data-section="classes">
      <i class="fas fa-chalkboard"></i>
      <span>My Classes</span>
    </a>
    <a href="#" class="nav-item" data-section="assignments">
      <i class="fas fa-tasks"></i>
      <span>Assignments</span>
    </a>
    <a href="#" class="nav-item" data-section="students">
      <i class="fas fa-users"></i>
      <span>Students</span>
    </a>
  `;

  $id('mainContent').innerHTML = `
    <section id="classes" class="section active">
      <div class="section-header">
        <h1>My Classes</h1>
        <button class="btn-primary" onclick="createClass()">
          <i class="fas fa-plus"></i> Create Class
        </button>
      </div>
      <div id="classList" class="class-grid"></div>
    </section>
  `;

  loadTeacherClasses();
  attachNavListeners();
}

function renderStudentDashboard() {
  $id('sidebarNav').innerHTML = `
    <a href="#" class="nav-item active" data-section="classes">
      <i class="fas fa-chalkboard"></i>
      <span>My Classes</span>
    </a>
    <a href="#" class="nav-item" data-section="assignments">
      <i class="fas fa-clipboard-list"></i>
      <span>Assignments</span>
    </a>
    <a href="#" class="nav-item" data-section="grades">
      <i class="fas fa-chart-line"></i>
      <span>Grades</span>
    </a>
  `;

  $id('mainContent').innerHTML = `
    <section id="classes" class="section active">
      <div class="section-header">
        <h1>My Classes</h1>
        <button class="btn-primary" onclick="joinClass()">
          <i class="fas fa-plus"></i> Join Class
        </button>
      </div>
      <div id="classList" class="class-grid"></div>
    </section>
  `;

  loadStudentClasses();
  attachNavListeners();
}

async function loadTeacherClasses() {
  try {
    const response = await fetch('api/get_teacher_classes.php', {
      credentials: 'same-origin',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await response.json();
    const classList = $id('classList');
    
    if (data.success && data.classes.length > 0) {
      classList.innerHTML = data.classes.map(cls => `
        <div class="class-card" onclick="openClass(${cls.id}, '${cls.class_name}')" style="cursor: pointer;">
          <h3>${cls.class_name}</h3>
          <p>${cls.description || 'No description'}</p>
          <div class="class-code">Code: ${cls.class_code}</div>
          <div class="class-stats">
            <span><i class="fas fa-users"></i> ${cls.student_count || 0} students</span>
          </div>
        </div>
      `).join('');
    } else {
      classList.innerHTML = '<p class="empty-state">No classes yet. Create your first class!</p>';
    }
  } catch (error) {
    console.error('Failed to load classes:', error);
  }
}

async function loadStudentClasses() {
  try {
    const response = await fetch('api/get_student_classes.php', {
      credentials: 'same-origin',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await response.json();
    const classList = $id('classList');
    
    if (data.success && data.classes.length > 0) {
      classList.innerHTML = data.classes.map(cls => `
        <div class="class-card" onclick="openClass(${cls.id}, '${cls.class_name}')" style="cursor: pointer;">
          <h3>${cls.class_name}</h3>
          <p>${cls.description || 'No description'}</p>
          <div class="class-teacher">Teacher: ${cls.teacher_name}</div>
        </div>
      `).join('');
    } else {
      classList.innerHTML = '<p class="empty-state">No classes yet. Join a class to get started!</p>';
    }
  } catch (error) {
    console.error('Failed to load classes:', error);
  }
}

function createClass() {
  const className = prompt('Enter class name:');
  if (!className) return;
  
  const description = prompt('Enter class description (optional):');
  
  fetch('api/create_class.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ class_name: className, description })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      if (window.DataCache) window.DataCache.invalidateClasses();
      alert(`Class created! Code: ${data.class_code}`);
      loadTeacherClasses();
    } else {
      alert('Failed to create class: ' + data.message);
    }
  })
  .catch(err => {
    console.error('Create class error:', err);
    alert('Failed to create class');
  });
}

function joinClass() {
  const classCode = prompt('Enter class code:');
  if (!classCode) return;
  
  fetch('api/join_class.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ class_code: classCode })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      if (window.DataCache) window.DataCache.invalidateClasses();
      alert('Successfully joined class!');
      loadStudentClasses();
    } else {
      alert('Failed to join class: ' + data.message);
    }
  })
  .catch(err => {
    console.error('Join class error:', err);
    alert('Failed to join class');
  });
}

function attachNavListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function openClass(classId, className) {
  // Store class info in sessionStorage
  sessionStorage.setItem('currentClassId', classId);
  sessionStorage.setItem('currentClassName', className);
  // Redirect to class dashboard
  window.location.href = `class_dashboard.html?id=${classId}`;
}
