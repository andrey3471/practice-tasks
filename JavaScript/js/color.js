// Получение ссылок на элементы управления
const widthInput = document.getElementById('w');
const heightInput = document.getElementById('h');
const box = document.getElementById('box');
const randColorBtn = document.getElementById('randColorBtn');

/**
 * Устанавливает размеры квадрата на основе значений полей ввода.
 */
function updateBoxSize() {
  box.style.width = widthInput.value + 'px';
  box.style.height = heightInput.value + 'px';
}

/**
 * Генерирует случайный цвет в шестнадцатеричном формате (#RRGGBB).
 * @returns {string}
 */
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Применяет случайный цвет к фону квадрата.
 */
function setRandomColor() {
  box.style.background = getRandomColor();
}

// Привязка событий к элементам управления
widthInput.addEventListener('input', updateBoxSize);
heightInput.addEventListener('input', updateBoxSize);
randColorBtn.addEventListener('click', setRandomColor);

// Инициализация размеров квадрата при загрузке страницы
updateBoxSize();
