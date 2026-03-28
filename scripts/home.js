import { API_BASE_URL } from './config.js';

function setYear() {
  document.getElementById('date').textContent = `© ${new Date().getFullYear()} Cursos Online`;
}

function cardTemplate(course) {
  const id = course.id;
  return `
    <article class="card">
      <img src="${course.img}" alt="${course.title}" class="card__img">
      <div class="card__content">
          <div class="card__body">
            <h3 class="card__title">${course.title}</h3>
            <p class="card__paragraph card__paragraph--subtitle"><strong>${course.subtitle}</strong></p>
            <p class="card__paragraph">${course.description}</p>
          </div>
          <div class="card__data">
            <span class="card__price">S/ ${course.price}</span>
            <span class="tag">${course.tag}</span>
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

  try {
    message.textContent = 'Cargando cursos...';
    message.style.display = 'block';
    const res = await fetch(`${API_BASE_URL}/courses`);
    if (!res.ok) throw new Error();
    const courses = await res.json();

    container.innerHTML = courses.map(cardTemplate).join('');
    message.textContent = '';
    message.style.display = 'none';
  } catch {
    container.innerHTML = '<div class="error">No se pudo cargar la lista de cursos.</div>';
    message.textContent = '';
    message.style.display = 'none';
  }
}

setYear();
loadCourses();

