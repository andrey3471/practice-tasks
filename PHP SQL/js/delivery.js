// ----------------------------
// Delivery form: AJAX + UI
// ----------------------------

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('deliveryForm');
  const citySelect = document.getElementById('citySelect');
  const weightInput = document.getElementById('weightInput');
  const resultDiv = document.getElementById('deliveryResult');

  // --- Загрузка городов через PHP ---
  fetch('js/delivery.php?action=cities')
    .then(res => res.json())
    .then(data => {
      citySelect.innerHTML = '';
      if (!Array.isArray(data)) {
        citySelect.innerHTML = '<option>Ошибка загрузки</option>';
        return;
      }
      data.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
      });
      // Установить "Москва" по умолчанию
      if (data.includes('Москва')) citySelect.value = 'Москва';
    })
    .catch(() => {
      citySelect.innerHTML = '<option>Ошибка загрузки</option>';
    });

  // --- AJAX отправка формы ---
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    resultDiv.textContent = '';
    resultDiv.className = '';

    // Собираем данные для POST
    const city = citySelect.value;
    const weight = weightInput.value.trim();

    // Простая валидация
    if (!city || !weight || isNaN(weight) || weight <= 0) {
      resultDiv.className = 'error';
      resultDiv.textContent = 'Укажите город и положительный вес!';
      return;
    }

    // Готовим данные
    const postData = new URLSearchParams();
    postData.append('city', city);
    postData.append('weight', weight);

    fetch('js/delivery.php?action=calc', {
      method: 'POST',
      body: postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'OK') {
          resultDiv.className = '';
          resultDiv.textContent = data.message;
        } else {
          resultDiv.className = 'error';
          resultDiv.textContent = data.message || 'Ошибка расчёта доставки';
        }
      })
      .catch(() => {
        resultDiv.className = 'error';
        resultDiv.textContent = 'Ошибка связи с сервером';
      });
  });
});
