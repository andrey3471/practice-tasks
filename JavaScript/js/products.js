// Для запуска в терменале cd JavaScript
// Затем set NODE_TLS_REJECT_UNAUTHORIZED=0 (отключение проверки SSL)
// ----------------------
// Загрузка и фильтрация товаров с внешнего сервиса
// ----------------------

const tableArea = document.getElementById('tableArea');
const form = document.getElementById('filterForm');
const priceFromInput = document.getElementById('priceFrom');
const priceToInput = document.getElementById('priceTo');
const updateBtn = document.getElementById('updateBtn');

let productsData = []; // данные с сервиса

/**
 * Формирует и выводит таблицу товаров с расчетом суммы и фильтрацией по цене
 * @param {Array} data - массив товаров
 * @param {number} from - минимальная цена
 * @param {number} to - максимальная цена
 */
function renderTable(data, from, to) {
  // Фильтрация
  let filtered = data;
  if (!(from === 0 && to === 0)) {
    filtered = data.filter(item => item.price >= from && item.price <= to);
  }

  if (filtered.length === 0) {
    tableArea.innerHTML = `<div class="table-message">
      Нет данных, попадающих под условие фильтра
    </div>`;
    return;
  }

  let html = `<table class="data-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Название</th>
        <th>Количество</th>
        <th>Цена за единицу</th>
        <th>Сумма</th>
      </tr>
    </thead>
    <tbody>
  `;

  filtered.forEach((item, idx) => {
    const sum = item.price * item.quantity;
    html += `<tr>
      <td>${idx + 1}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price}</td>
      <td>${sum}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  tableArea.innerHTML = html;
}

/**
 * Валидация фильтра и обработка формы
 */
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const from = parseInt(priceFromInput.value, 10) || 0;
  const to = parseInt(priceToInput.value, 10) || 0;
  let error = '';

  if (from < 0) error = 'Поле "Цена от" не может быть меньше нуля.';
  if (to < 0) error = 'Поле "до" не может быть меньше нуля.';
  if (!error && to !== 0 && from > to) error = '"Цена от" не может быть больше "до".';

  if (error) {
    tableArea.innerHTML = `<div class="table-message">${error}</div>`;
    return;
  }

  renderTable(productsData, from, to);
});

// -------- Получение данных с сервиса ---------
async function fetchProducts() {
  try {
    // Делаем GET-запрос
    const response = await fetch('http://localhost:3000/products');
    if (!response.ok) throw new Error('Ошибка при получении данных');
    const data = await response.json();

    // Проверяем структуру
    if (!Array.isArray(data)) throw new Error('Некорректный формат данных сервиса');

    // Добавляем необходимые поля для таблицы (ID будет по индексу)
    productsData = data.map(item => ({
      name: item.name || '',
      price: typeof item.price === 'number' ? item.price : 0,
      quantity: typeof item.quantity === 'number' ? item.quantity : 0
    }));

    renderTable(productsData, 0, 0);

  } catch (err) {
    tableArea.innerHTML = `<div class="table-message" style="color:#d70000;">Ошибка загрузки данных: ${err.message}</div>`;
  }
}

// ----------- Инициализация -----------
fetchProducts();
