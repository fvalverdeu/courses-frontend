import { API_BASE_URL } from './config.js';

function setYear() {
  const el = document.getElementById('date');
  if (!el) return;
  el.textContent = `© ${new Date().getFullYear()} Cursos Online`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cardTemplate(course) {
  const id = encodeURIComponent(course.id);
  return `
    <article class="card">
      <img src="${escapeHtml(course.img)}" alt="${escapeHtml(course.title)}" class="card__img">
      <div class="card__content">
          <div class="card__body">
            <h3 class="card__title">${escapeHtml(course.title)}</h3>
            <p class="card__paragraph card__paragraph--subtitle"><strong>${escapeHtml(course.subtitle)}</strong></p>
            <p class="card__paragraph">${escapeHtml(course.description)}</p>
          </div>
          <div class="card__data">
            <span class="card__price">S/ ${escapeHtml(course.price)}</span>
            <span class="tag">${escapeHtml(course.tag)}</span>
          </div>
          <div class="card__actions">
            <a class="btn" href="./course.html?id=${id}">Ver detalle</a>
          </div>
      </div>
    </article>
  `;
}

async function loadCourses() {
  const container = document.querySelector('.main__courses');
  const message = document.getElementById('message');
  if (!container) return;

  try {
    if (message) message.textContent = 'Cargando cursos...';
    const res = await fetch(`${API_BASE_URL}/courses`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const courses = await res.json();

    container.innerHTML = courses.map(cardTemplate).join('');
    if (message) message.textContent = '';
  } catch (e) {
    if (message) message.textContent = '';
    container.innerHTML = `<div class="error">No se pudo cargar la lista de cursos. Verifica que el backend esté corriendo.</div>`;
  }
}

setYear();
loadCourses();

