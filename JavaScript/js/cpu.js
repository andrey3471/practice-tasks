// --- URL прокси или сервиса ---
const CPU_URL = 'http://localhost:3000/cpu'; // если есть свой прокси
// const CPU_URL = 'https://exercise.develop.maximaster.ru/service/cpu/'; // если без прокси

const ctx = document.getElementById('cpuChart').getContext('2d');

// --- История значений ---
let cpuHistory = [];
let labels = [];
const MAX_POINTS = 20;

// --- Статистика ---
let totalRequests = 0;
let errorRequests = 0;
let lastValidValue = null;

// --- Инициализация графика ---
const cpuChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Загрузка CPU (%)',
      data: cpuHistory,
      borderColor: '#1888f3',
      backgroundColor: 'rgba(24,136,243,0.07)',
      tension: 0.2,
      pointRadius: 2,
      fill: true
    }]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 }
      }
    },
    plugins: {
      legend: { display: false }
    }
  }
});

// --- Функция обновления графика и статистики ---
async function updateCPU() {
  totalRequests++;
  let value = 0;
  try {
    const response = await fetch(CPU_URL);
    value = parseInt(await response.text(), 10);
    if (!value) throw new Error('Ошибка данных (0)');
    lastValidValue = value;
  } catch (e) {
    errorRequests++;
    value = lastValidValue !== null ? lastValidValue : 0;
  }

  // --- Обновляем историю ---
  const now = new Date();
  labels.push(now.toLocaleTimeString().slice(0, 8));
  cpuHistory.push(value);

  if (cpuHistory.length > MAX_POINTS) {
    cpuHistory.shift();
    labels.shift();
  }

  cpuChart.data.labels = labels;
  cpuChart.data.datasets[0].data = cpuHistory;
  cpuChart.update();

  // --- Обновляем статистику ---
  const percentErrors = totalRequests ? Math.round(errorRequests / totalRequests * 100) : 0;
  document.getElementById('stats').innerHTML =
    `<b>Всего запросов:</b> ${totalRequests}<br>
     <b>Ошибок:</b> ${errorRequests} (${percentErrors}%)`;
}

// --- Запускаем обновление каждую 5-ю секунду ---
updateCPU();
setInterval(updateCPU, 5000);
