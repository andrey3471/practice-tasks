// Получение ссылок на элементы формы
const form = document.getElementById('orderForm');
const fio = document.getElementById('fio');
const phone = document.getElementById('phone');
const email = document.getElementById('email');
const comment = document.getElementById('comment');
const formMessage = document.getElementById('formMessage');

let map, markerCoords = null, marker, coordHint;

// Инициализация Яндекс.Карты
ymaps.ready(() => {
  map = new ymaps.Map('map', {
    center: [55.751574, 37.573856], // Центр - Москва
    zoom: 11,
    controls: []
  });

  // Установка или перемещение маркера по клику на карте
  map.events.add('click', function (e) {
    const coords = e.get('coords');
    markerCoords = coords;

    if (marker) {
      marker.geometry.setCoordinates(coords);
    } else {
      marker = new ymaps.Placemark(coords, {}, { preset: 'islands#redDotIcon' });
      map.geoObjects.add(marker);
    }

    showCoordsHint(coords);
  });
});

/**
 * Отображает подсказку с координатами точки доставки.
 * @param {Array<number>} coords - Координаты точки на карте
 */
function showCoordsHint(coords) {
  if (coordHint) coordHint.options.set('visible', false);
  coordHint = new ymaps.Balloon(map);
  map.balloon.open(coords, {
    contentHeader: 'Координаты доставки',
    contentBody: `Широта: ${coords[0].toFixed(5)}<br>Долгота: ${coords[1].toFixed(5)}`
  }, { closeButton: true });
}

/**
 * Обработка отправки формы, валидация полей и отображение сообщения.
 */
form.addEventListener('submit', function (e) {
  e.preventDefault();
  let errors = [];

  // Валидация ФИО
  if (!fio.value.trim()) {
    errors.push('Не заполнено поле ФИО');
  }

  // Валидация телефона: только цифры и не пусто
  if (!phone.value.trim()) {
    errors.push('Не заполнено поле Телефон');
  } else if (!/^\d+$/.test(phone.value.trim())) {
    errors.push('Телефон должен содержать только цифры');
  }

  // Валидация email (наличие символа "@")
  if (email.value && !email.value.includes('@')) {
    errors.push('Email должен содержать символ "@"');
  }

  // Проверка, что точка на карте выбрана
  if (!markerCoords) {
    errors.push('Не отмечен адрес доставки на карте');
  }

  // Проверка длины комментария
  if (comment.value.length > 500) {
    errors.push('Комментарий должен быть не длиннее 500 символов');
  }

  // Отображение сообщений пользователю
  if (errors.length > 0) {
    formMessage.className = 'error';
    formMessage.innerHTML = errors.map(e => `<div>${e}</div>`).join('');
  } else {
    formMessage.className = 'success';
    formMessage.textContent = 'Заказ оформлен!';
    form.reset();
    if (marker) {
      map.geoObjects.remove(marker);
      marker = null;
      markerCoords = null;
    }
    map.balloon.close();
  }
});
