import { API_BASE_URL } from './config.js';

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getIdFromQuery() {
  const url = new URL(window.location.href);
  const id = url.searchParams.get('id');
  return id ? Number(id) : NaN;
}

function setYear() {
  const el = document.getElementById('date');
  if (!el) return;
  el.textContent = `© ${new Date().getFullYear()} Cursos Online`;
}

async function loadCourse() {
  const root = document.getElementById('course');
  const message = document.getElementById('message');
  if (!root) return;

  const id = getIdFromQuery();
  if (!Number.isFinite(id)) {
    root.innerHTML = `<div class="error">Falta el parámetro <code>id</code> en la URL.</div>`;
    return;
  }

  try {
    if (message) message.textContent = 'Cargando curso...';
    const res = await fetch(`${API_BASE_URL}/courses/${encodeURIComponent(id)}`);
    if (res.status === 404) {
      root.innerHTML = `<div class="error">Curso no encontrado.</div>`;
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const c = await res.json();

    document.title = `${c.title} - Cursos Online`;
    root.innerHTML = `
      <section class="course">
        <div>
          <img class="course__img" src="${escapeHtml(c.img)}" alt="${escapeHtml(c.title)}">
        </div>
        <div class="course__meta">
          <div class="tag" style="width: fit-content;">${escapeHtml(c.tag)}</div>
          <h1 class="course__title">${escapeHtml(c.title)}</h1>
          <div class="course__subtitle">${escapeHtml(c.subtitle)}</div>
          <p class="muted">${escapeHtml(c.description)}</p>

          <div class="course__kv">
            <div><strong>Precio</strong></div><div>S/ ${escapeHtml(c.price)}</div>
            <div><strong>Duración</strong></div><div>${escapeHtml(c.duration ?? '—')}</div>
            <div><strong>Instructor</strong></div><div>${escapeHtml(c.instructor ?? '—')}</div>
            <div><strong>Horario</strong></div><div>${escapeHtml(c.schedule ?? '—')}</div>
          </div>

          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <a class="btn" href="./index.html">Volver</a>
            <a class="btn btn--ghost" href="./login.html">Admin</a>
          </div>
        </div>
      </section>
    `;
    if (message) message.textContent = '';
  } catch (e) {
    if (message) message.textContent = '';
    root.innerHTML = `<div class="error">No se pudo cargar el curso. Verifica el backend.</div>`;
  }
}

setYear();
loadCourse();

