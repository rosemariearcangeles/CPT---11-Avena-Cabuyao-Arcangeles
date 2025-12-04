// Education Dashboard JS
const $id = (id) => document.getElementById(id);

let userRole = 'student';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadUserData();
  renderDashboard();
  setupModalHandlers();
});

async function checkAuth() {
  try {
    const response = await fetch('check_auth.php', {
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    const data = await response.json();
    if (!data.loggedIn) {
      window.location.href = 'index.html';
      return;
    }
    
    // Only allow education users (student/teacher)
    if (data.role !== 'student' && data.role !== 'teacher') {
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
    console.log('Loading teacher classes...');
    const response = await fetch('api/get_teacher_classes.php?t=' + Date.now(), {
      credentials: 'same-origin',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });

    if (!response.ok) {
      console.error('API responded with error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('Classes data received:', data);
    const classList = $id('classList');

    if (data.success && data.classes && data.classes.length > 0) {
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
      console.log('Classes rendered:', data.classes.length);
    } else {
      console.log('No classes found, showing empty state');
      classList.innerHTML = `
        <div class="empty-state" style="text-align:center;padding:3rem 1rem;grid-column:1/-1;">
          <div style="font-size:4rem;margin-bottom:1rem;">📚</div>
          <h3 style="margin-bottom:0.5rem;color:var(--text-primary);">No Classes Created Yet</h3>
          <p style="color:var(--text-secondary);margin-bottom:1.5rem;">Create your first class to start teaching!</p>
          <button class="btn btn-primary" onclick="createClass()">
            <i class="fas fa-plus"></i> Create Class
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load classes:', error);
    // Show error state to user
    const classList = $id('classList');
    classList.innerHTML = `
      <div class="empty-state" style="text-align:center;padding:3rem 1rem;grid-column:1/-1;">
        <div style="font-size:4rem;margin-bottom:1rem;">⚠️</div>
        <h3 style="margin-bottom:0.5rem;color:var(--text-primary);">Error Loading Classes</h3>
        <p style="color:var(--text-secondary);margin-bottom:1.5rem;">Please refresh the page or try again.</p>
        <button class="btn btn-primary" onclick="loadTeacherClasses()">
          <i class="fas fa-refresh"></i> Retry
        </button>
      </div>
    `;
  }
}

async function loadStudentClasses() {
  try {
    console.log('Loading student classes...');
    const response = await fetch('api/get_student_classes.php?t=' + Date.now(), {
      credentials: 'same-origin',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });

    if (!response.ok) {
      console.error('API responded with error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('Student classes data received:', data);
    const classList = $id('classList');

    if (data.success && data.classes && data.classes.length > 0) {
      classList.innerHTML = data.classes.map(cls => `
        <div class="class-card" onclick="openClass(${cls.id}, '${cls.class_name}')" style="cursor: pointer;">
          <h3>${cls.class_name}</h3>
          <p>${cls.description || 'No description'}</p>
          <div class="class-teacher">Teacher: ${cls.teacher_name}</div>
        </div>
      `).join('');
      console.log('Student classes rendered:', data.classes.length);
    } else {
      console.log('No student classes found, showing empty state');
      classList.innerHTML = `
        <div class="empty-state" style="text-align:center;padding:3rem 1rem;grid-column:1/-1;">
          <div style="font-size:4rem;margin-bottom:1rem;">🎓</div>
          <h3 style="margin-bottom:0.5rem;color:var(--text-primary);">No Classes Joined Yet</h3>
          <p style="color:var(--text-secondary);margin-bottom:1.5rem;">Join a class using the code provided by your teacher.</p>
          <button class="btn btn-primary" onclick="joinClass()">
            <i class="fas fa-plus"></i> Join Class
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load student classes:', error);
    // Show error state to user
    const classList = $id('classList');
    classList.innerHTML = `
      <div class="empty-state" style="text-align:center;padding:3rem 1rem;grid-column:1/-1;">
        <div style="font-size:4rem;margin-bottom:1rem;">⚠️</div>
        <h3 style="margin-bottom:0.5rem;color:var(--text-primary);">Error Loading Classes</h3>
        <p style="color:var(--text-secondary);margin-bottom:1.5rem;">Please refresh the page or try again.</p>
        <button class="btn btn-primary" onclick="loadStudentClasses()">
          <i class="fas fa-refresh"></i> Retry
        </button>
      </div>
    `;
  }
}

window.createClass = function() {
  console.log('Create class button clicked');
  const modal = document.getElementById('createClassModal');
  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  } else {
    console.error('Create class modal not found');
  }
}

function handleCreateClass(e) {
  e.preventDefault();
  const className = document.getElementById('class-name').value.trim();
  const description = document.getElementById('class-description').value.trim();
  
  if (!className) {
    alert('Please enter a class name');
    return;
  }
  
  fetch('api/create_class.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ class_name: className, description })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`Class created! Code: ${data.class_code}`);
      window.location.reload();
    } else {
      alert('Failed to create class: ' + (data.message || 'Unknown error'));
    }
  })
  .catch(err => {
    alert('Failed to create class. Please try again.');
  });
}

window.joinClass = function() {
  console.log('Join class button clicked');
  const modal = document.getElementById('joinClassModal');
  if (modal) {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  } else {
    console.error('Join class modal not found');
  }
}

function handleJoinClass(e) {
  e.preventDefault();
  const classCode = document.getElementById('join-class-code').value.trim().toUpperCase();
  
  if (!classCode) {
    alert('Please enter a class code');
    return;
  }
  
  fetch('api/join_class.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ class_code: classCode })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Successfully joined class!');
      window.location.reload();
    } else {
      alert('Failed to join class: ' + (data.message || 'Unknown error'));
    }
  })
  .catch(err => {
    alert('Failed to join class. Please try again.');
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
  sessionStorage.setItem('currentClassId', classId);
  sessionStorage.setItem('currentClassName', className);
  window.location.href = `class_dashboard.html?id=${classId}`;
}

function setupModalHandlers() {
  const createForm = document.getElementById('createClassForm');
  const joinForm = document.getElementById('joinClassForm');
  
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateClass);
    createForm.addEventListener('submit', handleCreateClass);
  }
  if (joinForm) {
    joinForm.removeEventListener('submit', handleJoinClass);
    joinForm.addEventListener('submit', handleJoinClass);
  }
  
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.removeEventListener('click', closeModalHandler);
    btn.addEventListener('click', closeModalHandler);
  });
  
  document.querySelectorAll('.modal').forEach(modal => {
    modal.removeEventListener('click', closeOnBackdropClick);
    modal.addEventListener('click', closeOnBackdropClick);
  });
}

function closeModalHandler(e) {
  const modal = e.target.closest('.modal');
  if (modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function closeOnBackdropClick(e) {
  if (e.target === this) {
    this.classList.remove('show');
    this.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function updateSidebarBadge(role) {
  const badgeElement = document.querySelector('.sidebar .mode-badge');
  if (badgeElement) {
    // Determine the correct badge text based on user role
    const isEducationMode = role === 'student' || role === 'teacher';
    badgeElement.textContent = isEducationMode ? 'Education' : 'Personal';
  }
}
