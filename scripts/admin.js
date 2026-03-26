import { API_BASE_URL } from './config.js';

const TOKEN_KEY = 'courses_admin_token';

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setYear() {
  const el = $('date');
  if (!el) return;
  el.textContent = `© ${new Date().getFullYear()} Cursos Online`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function api(path, { method = 'GET', body = undefined, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

function showError(message) {
  const el = $('error');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = message;
}

function clearError() {
  const el = $('error');
  if (!el) return;
  el.style.display = 'none';
  el.textContent = '';
}

function formToCourse() {
  const price = Number($('price').value);
  const active = $('active').checked;
  return {
    img: $('img').value.trim(),
    title: $('title').value.trim(),
    subtitle: $('subtitle').value.trim(),
    description: $('description').value.trim(),
    price,
    tag: $('tag').value.trim(),
    duration: $('duration').value.trim() || null,
    instructor: $('instructor').value.trim() || null,
    schedule: $('schedule').value.trim() || null,
    active
  };
}

function fillForm(course) {
  $('courseId').value = course?.id ?? '';
  $('img').value = course?.img ?? '';
  $('title').value = course?.title ?? '';
  $('subtitle').value = course?.subtitle ?? '';
  $('description').value = course?.description ?? '';
  $('price').value = course?.price ?? '';
  $('tag').value = course?.tag ?? '';
  $('duration').value = course?.duration ?? '';
  $('instructor').value = course?.instructor ?? '';
  $('schedule').value = course?.schedule ?? '';
  $('active').checked = Boolean(course?.active ?? true);
}

function resetForm() {
  fillForm(null);
}

function renderCoursesTable(courses) {
  const tbody = $('coursesBody');
  if (!tbody) return;

  tbody.innerHTML = courses
    .map((c) => {
      const pillClass = c.active ? 'pill pill--on' : 'pill pill--off';
      const pillText = c.active ? 'Activo' : 'Inactivo';
      return `
        <tr>
          <td>${escapeHtml(c.id)}</td>
          <td>
            <div><strong>${escapeHtml(c.title)}</strong></div>
            <div class="muted">${escapeHtml(c.subtitle)}</div>
          </td>
          <td><span class="tag">${escapeHtml(c.tag)}</span></td>
          <td>S/ ${escapeHtml(c.price)}</td>
          <td><span class="${pillClass}">${pillText}</span></td>
          <td class="actions">
            <button class="btn" data-action="edit" data-id="${escapeHtml(c.id)}">Editar</button>
            <button class="btn btn--ghost" data-action="toggle" data-id="${escapeHtml(c.id)}">${c.active ? 'Desactivar' : 'Activar'}</button>
          </td>
        </tr>
      `;
    })
    .join('');
}

async function refreshCourses() {
  const courses = await api('/courses?active=all');
  renderCoursesTable(courses);
}

async function onTableClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = Number(btn.dataset.id);
  if (!Number.isFinite(id)) return;

  clearError();

  if (action === 'edit') {
    const course = await api(`/courses/${id}`);
    fillForm(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (action === 'toggle') {
    const course = await api(`/courses/${id}`);
    await api(`/courses/${id}/active`, { method: 'PATCH', body: { active: !course.active }, auth: true });
    await refreshCourses();
  }
}

async function onSave(e) {
  e.preventDefault();
  clearError();

  const id = $('courseId').value ? Number($('courseId').value) : null;
  const course = formToCourse();

  try {
    if (id) {
      await api(`/courses/${id}`, { method: 'PUT', body: course, auth: true });
    } else {
      await api('/courses', { method: 'POST', body: course, auth: true });
    }
    resetForm();
    await refreshCourses();
  } catch (err) {
    showError(err.message || 'Error al guardar');
  }
}

function onNew() {
  clearError();
  resetForm();
}

function onLogout() {
  clearToken();
  window.location.href = './login.html';
}

export async function initLogin() {
  setYear();
  const form = $('loginForm');
  const logoutBtn = $('logoutBtn');
  if (logoutBtn) logoutBtn.style.display = 'none';

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const username = $('username').value.trim();
    const password = $('password').value.trim();

    try {
      const data = await api('/login', { method: 'POST', body: { username, password } });
      setToken(data.token);
      window.location.href = './admin-courses.html';
    } catch (err) {
      showError(err.message || 'No se pudo iniciar sesión');
    }
  });
}

export async function initAdminCourses() {
  setYear();

  const token = getToken();
  if (!token) {
    window.location.href = './login.html';
    return;
  }

  const form = $('courseForm');
  const newBtn = $('newBtn');
  const logoutBtn = $('logoutBtn');
  const tbody = $('coursesBody');

  if (form) form.addEventListener('submit', onSave);
  if (newBtn) newBtn.addEventListener('click', onNew);
  if (logoutBtn) logoutBtn.addEventListener('click', onLogout);
  if (tbody) tbody.addEventListener('click', onTableClick);

  try {
    await refreshCourses();
  } catch (err) {
    showError(err.message || 'No se pudo cargar la lista');
  }
}

