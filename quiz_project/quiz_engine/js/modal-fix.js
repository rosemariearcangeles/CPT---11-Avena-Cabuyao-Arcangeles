// Modal fix - Force login/register buttons to work
setTimeout(function() {
  const loginBtn = document.getElementById('nav-login-btn');
  const registerBtn = document.getElementById('nav-register-btn');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  
  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
  
  if (loginBtn) {
    loginBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (loginModal) {
        loginModal.classList.add('show');
        loginModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    };
  }
  
  if (registerBtn) {
    registerBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (registerModal) {
        registerModal.classList.add('show');
        registerModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    };
  }
  
  // Close buttons
  document.querySelectorAll('.close').forEach(btn => {
    btn.onclick = function() {
      closeModal(this.closest('.modal'));
    };
  });
  
  // Click outside to close
  if (loginModal) {
    loginModal.onclick = function(e) {
      if (e.target === loginModal) closeModal(loginModal);
    };
  }
  if (registerModal) {
    registerModal.onclick = function(e) {
      if (e.target === registerModal) closeModal(registerModal);
    };
  }
}, 100);
