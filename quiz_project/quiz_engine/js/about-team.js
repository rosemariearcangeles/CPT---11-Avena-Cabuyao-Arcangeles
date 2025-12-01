// about-team.js - enhance team showcase interactions
document.addEventListener('DOMContentLoaded', () => {
  const members = Array.from(document.querySelectorAll('.team-member'));
  const infoImg = document.getElementById('infoImg');
  const infoName = document.getElementById('infoName');
  const infoRole = document.getElementById('infoRole');
  const infoBio = document.getElementById('infoBio');

  if (!members.length || !infoImg) return;

  // Helper to resolve path relative to About page
  function resolvePath(p) {
    // If path is already absolute or starts with ../ or ./, return as-is
    if (!p) return p;
    return p;
  }

  // Preload images and inject avatar elements
  members.forEach((m, idx) => {
    const imgPath = m.dataset.img || null;
    const name = m.dataset.name || (m.querySelector('h3') && m.querySelector('h3').textContent) || `Member ${idx+1}`;
    const role = m.dataset.role || (m.querySelector('p') && m.querySelector('p').textContent) || '';
    const bio = m.dataset.bio || '';

    // Create avatar element
    const avatar = document.createElement('div');
    avatar.className = 'member-avatar';
    if (imgPath) avatar.style.backgroundImage = `url('${resolvePath(imgPath)}')`;

    // Wrap existing text into member-content for alignment
    const content = document.createElement('div');
    content.className = 'member-content';

    // Move h3 and p into content
    const h3 = m.querySelector('h3');
    const p = m.querySelector('p');
    if (h3) content.appendChild(h3);
    if (p) content.appendChild(p);

    // Insert avatar at top
    m.insertBefore(avatar, m.firstChild);
    m.appendChild(content);

    // Preload
    if (imgPath) {
      const im = new Image();
      im.src = imgPath;
    }

    // Accessibility
    if (!m.hasAttribute('role')) m.setAttribute('role', 'button');
    if (!m.hasAttribute('tabindex')) m.setAttribute('tabindex', '0');

    // Click / keyboard behavior
    function activate() {
      // update info box
      if (imgPath) infoImg.src = imgPath;
      if (infoName) infoName.textContent = name;
      if (infoRole) infoRole.textContent = role;
      if (infoBio) infoBio.textContent = bio;

      // mark active
      members.forEach(x => x.classList.remove('active'));
      m.classList.add('active');
    }

    m.addEventListener('click', activate);
    m.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        activate();
      }
    });
  });

  // Optionally activate first member for initial view
  const first = members[0];
  if (first) first.click();
});
