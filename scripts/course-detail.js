import { API_BASE_URL } from './config.js';

function setYear() {
  document.getElementById('date').textContent = `© ${new Date().getFullYear()} Cursos Online`;
}

async function loadCourse() {
  const root = document.getElementById('course');
  const message = document.getElementById('message');

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    root.innerHTML = `<div class="error">Falta el parámetro <code>id</code> en la URL.</div>`;
    return;
  }

  try {
    message.textContent = 'Cargando curso...';
    message.style.display = 'block';

    const res = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (res.status === 404) {
      root.innerHTML = `<div class="error">Curso no encontrado.</div>`;
      return;
    }
    if (!res.ok) throw new Error();

    const c = await res.json();

    document.title = `${c.title} - Cursos Online`;
    root.innerHTML = `
      <section class="course">
        <div>
          <img class="course__img" src="${c.img}" alt="${c.title}">
        </div>
        <div class="course__meta">
          <div class="tag" style="width: fit-content;">${c.tag}</div>
          <h1 class="course__title">${c.title}</h1>
          <div class="course__subtitle">${c.subtitle}</div>
          <p class="muted">${c.description}</p>

          <div class="course__kv">
            <div><strong>Precio</strong></div><div>S/ ${c.price}</div>
            <div><strong>Duración</strong></div><div>${c.duration || '—'}</div>
            <div><strong>Instructor</strong></div><div>${c.instructor || '—'}</div>
            <div><strong>Horario</strong></div><div>${c.schedule || '—'}</div>
          </div>

          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <a class="btn" href="./index.html">Volver</a>
            <a class="btn btn--ghost" href="./login.html">Admin</a>
          </div>
        </div>
      </section>
    `;
    message.textContent = '';
    message.style.display = 'none';
  } catch {
    root.innerHTML = '<div class="error">No se pudo cargar el curso.</div>';
    message.textContent = '';
    message.style.display = 'none';
  }
}

setYear();
loadCourse();

