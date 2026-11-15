/* ==========================================================================
   NABHALEARN - Interactive Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initSubjectCards();
  initModal();
  initHeroInteractivity();
  initStudentAuth();
  initDashboardProfile();
});

/* 1. Theme Switcher */
function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem('nabha_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(themeBtn, savedTheme);

  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nabha_theme', next);
    updateThemeIcon(themeBtn, next);
  });
}

function updateThemeIcon(btn, theme) {
  btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

/* 2. Mobile Nav */
function initMobileNav() {
  const toggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const isVisible = navLinks.style.display === 'flex';
    navLinks.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) {
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = 'var(--card-bg)';
      navLinks.style.padding = '1.5rem';
      navLinks.style.boxShadow = 'var(--shadow-card)';
    }
  });
}

/* 3. Subject Data & Interactive Cards */
const subjectDetails = {
  math: {
    title: "Mathematics (Class 6 – 10)",
    icon: "🧮",
    color: "#f43f5e",
    topics: [
      { name: "Algebra & Equations", duration: "15 mins", type: "Video Lesson" },
      { name: "Geometry & Shapes", duration: "20 mins", type: "Interactive Practice" },
      { name: "Fractions & Decimals", duration: "12 mins", type: "Quiz" }
    ]
  },
  science: {
    title: "Science (Class 6 – 10)",
    icon: "🧪",
    color: "#10b981",
    topics: [
      { name: "Physics: Light & Reflection", duration: "18 mins", type: "Virtual Lab" },
      { name: "Chemistry: Elements & Compounds", duration: "22 mins", type: "Video Lesson" },
      { name: "Biology: Plants & Photosynthesis", duration: "15 mins", type: "Quiz" }
    ]
  },
  english: {
    title: "English (Class 6 – 10)",
    icon: "📖",
    color: "#eab308",
    topics: [
      { name: "Grammar: Tenses & Active/Passive", duration: "14 mins", type: "Video Lesson" },
      { name: "Spoken English & Pronunciation", duration: "18 mins", type: "Audio Practice" },
      { name: "Reading Comprehension", duration: "10 mins", type: "Quiz" }
    ]
  },
  cs: {
    title: "Computer Science (Class 6 – 10)",
    icon: "💻",
    color: "#a855f7",
    topics: [
      { name: "Introduction to Coding & Algorithms", duration: "25 mins", type: "Interactive Code" },
      { name: "HTML & CSS Web Creation", duration: "30 mins", type: "Project" },
      { name: "Cyber Safety & Internet Rules", duration: "15 mins", type: "Quiz" }
    ]
  },
  gk: {
    title: "General Knowledge (Class 6 – 10)",
    icon: "🌍",
    color: "#0284c7",
    topics: [
      { name: "Indian History & Heritage", duration: "16 mins", type: "Video Lesson" },
      { name: "World Geography & Oceans", duration: "20 mins", type: "Interactive Map" },
      { name: "Current Affairs & Inventions", duration: "12 mins", type: "Quiz" }
    ]
  }
};

function initSubjectCards() {
  const cards = document.querySelectorAll('.subject-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const subjectKey = card.dataset.subject;
      if (subjectDetails[subjectKey]) {
        openSubjectModal(subjectDetails[subjectKey]);
      }
    });
  });
}

function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

function openSubjectModal(subject) {
  const overlay = document.getElementById('modalOverlay');
  const titleEl = document.getElementById('modalSubjectTitle');
  const bodyEl = document.getElementById('modalSubjectBody');

  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.innerHTML = `<span style="font-size: 1.8rem; vertical-align: middle;">${subject.icon}</span> ${subject.title}`;
  
  bodyEl.innerHTML = `
    <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-weight: 600;">
      Start learning with bite-sized lessons, interactive practice, and instant quizzes!
    </p>
    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
      ${subject.topics.map((t, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.2rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 16px;">
          <div>
            <div style="font-weight: 800; font-size: 1rem; color: var(--text-dark);">${idx + 1}. ${t.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">⏱️ ${t.duration} • <span style="color: ${subject.color}">${t.type}</span></div>
          </div>
          <button class="btn-pill btn-register" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="completeLesson('${t.name}')">
            Start ▶
          </button>
        </div>
      `).join('')}
    </div>
  `;

  overlay.classList.add('active');
}

window.completeLesson = function(lessonTitle) {
  closeModal();
  
  // Dynamically update user learning journey stats!
  const lessonCountEl = document.getElementById('completedLessonsCount');
  const progressFillEl = document.getElementById('progressTrackFill');
  const progressTextEl = document.getElementById('progressTextLabel');
  const overallPercentEl = document.getElementById('overallProgressPercent');

  if (lessonCountEl) {
    let current = parseInt(lessonCountEl.textContent) || 18;
    if (current < 25) {
      current += 1;
      lessonCountEl.textContent = `${current} / 25`;
      
      const newPercent = Math.round((current / 25) * 100);
      if (progressFillEl) progressFillEl.style.width = `${newPercent}%`;
      if (progressTextEl) progressTextEl.textContent = `${newPercent}%`;
      if (overallPercentEl) overallPercentEl.textContent = `${newPercent}%`;
    }
  }

  alert(`🎉 Lesson Completed: "${lessonTitle}"!\nYour Learning Journey progress has been updated!`);
};

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
}

/* 4. Hero Illustration Interactivity & Parallax */
function initHeroInteractivity() {
  const heroBox = document.querySelector('.hero-illustration-box');
  const tooltip = document.getElementById('heroTooltip');
  const heroObjs = document.querySelectorAll('.hero-obj');

  if (!heroBox) return;

  // Smooth 3D Parallax Tilt on Mouse Move
  heroBox.addEventListener('mousemove', (e) => {
    const rect = heroBox.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const tiltX = (y / (rect.height / 2)) * -5;
    const tiltY = (x / (rect.width / 2)) * 5;

    heroBox.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
  });

  heroBox.addEventListener('mouseleave', () => {
    heroBox.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (tooltip) tooltip.classList.remove('active');
  });

  // Tooltip & Click Handlers for Interactive Objects
  heroObjs.forEach(obj => {
    obj.addEventListener('mouseenter', () => {
      const title = obj.dataset.title || 'Interactive Element';
      if (tooltip) {
        tooltip.textContent = title;
        tooltip.classList.add('active');
      }
    });

    obj.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.remove('active');
    });

    obj.addEventListener('click', () => {
      const subjectKey = obj.dataset.subject;
      if (subjectKey && subjectDetails[subjectKey]) {
        openSubjectModal(subjectDetails[subjectKey]);
      }
    });
  });
}

/* 5. Cute Student Auth Card Logic */
let isRegisterMode = false;

function initStudentAuth() {
  const tabLogin = document.getElementById('tabLoginBtn');
  const tabRegister = document.getElementById('tabRegisterBtn');
  const linkToggle = document.getElementById('linkToggleAuth');
  const togglePwd = document.getElementById('togglePwdBtn');
  const pwdInput = document.getElementById('authPassword');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => setAuthMode(false));
    tabRegister.addEventListener('click', () => setAuthMode(true));
  }

  if (linkToggle) {
    linkToggle.addEventListener('click', () => setAuthMode(!isRegisterMode));
  }

  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      const currentType = pwdInput.getAttribute('type');
      const newType = currentType === 'password' ? 'text' : 'password';
      pwdInput.setAttribute('type', newType);
      togglePwd.textContent = newType === 'password' ? '👁️' : '🙈';
    });
  }
}

function setAuthMode(registerMode) {
  isRegisterMode = registerMode;

  const tabLogin = document.getElementById('tabLoginBtn');
  const tabRegister = document.getElementById('tabRegisterBtn');
  const fullNameGroup = document.getElementById('fullNameGroup');
  const classSelectGroup = document.getElementById('classSelectGroup');
  const submitBtn = document.getElementById('authSubmitBtn');
  const footerText = document.getElementById('authFooterText');
  const linkToggle = document.getElementById('linkToggleAuth');

  if (tabLogin && tabRegister) {
    if (isRegisterMode) {
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
    } else {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
    }
  }

  if (fullNameGroup && classSelectGroup) {
    fullNameGroup.style.display = isRegisterMode ? 'block' : 'none';
    classSelectGroup.style.display = isRegisterMode ? 'block' : 'none';
  }

  if (submitBtn) {
    submitBtn.textContent = isRegisterMode ? '✨ Create Account & Start' : '🚀 Log In & Start Learning';
  }

  if (footerText && linkToggle) {
    footerText.textContent = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
    linkToggle.textContent = isRegisterMode ? 'Login Here 🔑' : 'Register Here ✨';
  }
}

window.handleHeroAuth = function(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('authUsername');
  const userVal = usernameInput ? usernameInput.value.trim() : '';

  let studentName = 'Rahul Sharma';
  let studentClass = 'Class 6th';

  if (isRegisterMode) {
    const fullNameInput = document.getElementById('authFullName');
    const classSelect = document.getElementById('authClassSelect');
    if (fullNameInput && fullNameInput.value.trim()) {
      studentName = fullNameInput.value.trim();
    }
    if (classSelect) {
      studentClass = `Class ${classSelect.value}th`;
    }
    localStorage.setItem('nabha_student_name', studentName);
    localStorage.setItem('nabha_student_class', studentClass);

    alert(`🎉 Welcome to NabhaLearn, ${studentName}!\n\nRegistration successful! Taking you to your Student Dashboard...`);
  } else {
    studentName = userVal ? (userVal.charAt(0).toUpperCase() + userVal.slice(1).replace('_', ' ')) : 'Rahul Sharma';
    localStorage.setItem('nabha_student_name', studentName);
    localStorage.setItem('nabha_student_class', 'Class 6th');

    alert(`👋 Welcome back, ${studentName}!\n\nLogin successful! Taking you directly to your Student Dashboard...`);
  }

  // Redirect directly to Page 2 (Dashboard)
  window.location.href = 'dashboard.html';
};

window.fillDemoStudent = function() {
  setAuthMode(false);

  const usernameInput = document.getElementById('authUsername');
  const pwdInput = document.getElementById('authPassword');

  if (usernameInput) usernameInput.value = 'rahul_class6';
  if (pwdInput) pwdInput.value = 'nabha123';

  alert('✨ Demo student credentials filled!\n\nUsername: rahul_class6\nPassword: ●●●●●●●●\n\nClick "Log In & Start Learning" to proceed to Dashboard!');
};

/* 6. Dashboard Profile & Logout Handlers */
function initDashboardProfile() {
  const nameEl = document.getElementById('displayStudentName');
  const classEl = document.getElementById('displayStudentClass');
  const heroNameEl = document.getElementById('dashHeroStudentName');

  if (nameEl) {
    const savedName = localStorage.getItem('nabha_student_name') || 'Rahul Sharma';
    const savedClass = localStorage.getItem('nabha_student_class') || 'Class 6th';

    nameEl.textContent = savedName;
    if (classEl) classEl.textContent = savedClass.includes('Class') ? savedClass : `Class ${savedClass}th`;
    if (heroNameEl) heroNameEl.textContent = `${savedName.split(' ')[0]}!`;
  }
}

window.handleLogout = function() {
  alert('👋 Logged out successfully! Returning to Login/Register page...');
  window.location.href = 'index.html';
};



