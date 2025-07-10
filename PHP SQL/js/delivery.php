<?php
// Для запуска перейти в PHP SQL
// Потом php -S localhost:8000
// Ссылка http://localhost:8000/delivery.html
header('Content-Type: application/json; charset=utf-8');

// Конфигурация сервисов и кэша
$cityCacheFile = __DIR__ . '/../city.cache';
$cityUrl = 'https://exercise.develop.maximaster.ru/service/city/';
$deliveryUrl = 'https://exercise.develop.maximaster.ru/service/delivery/';
$auth = 'Basic ' . base64_encode('cli:12344321');
$action = $_GET['action'] ?? '';

// Получение списка городов с кэшированием (обновление раз в сутки)
if ($action === 'cities') {
    $opts = [
        "http" => [
            "method" => "GET",
            "header" => "Authorization: $auth\r\n"
        ],
        "ssl" => [
            "verify_peer" => false,
            "verify_peer_name" => false
        ]
    ];
    $context = stream_context_create($opts);

    if (file_exists($cityCacheFile) && filemtime($cityCacheFile) > strtotime('today')) {
        // Использовать кэш, если он актуален
        $cities = json_decode(file_get_contents($cityCacheFile), true);
    } else {
        // Получить список городов с сервиса и сохранить в кэш
        $citiesJson = file_get_contents($cityUrl, false, $context);
        $cities = json_decode($citiesJson, true);
        file_put_contents($cityCacheFile, json_encode($cities, JSON_UNESCAPED_UNICODE));
    }
    echo json_encode($cities, JSON_UNESCAPED_UNICODE);
    exit;
}

// Расчёт стоимости доставки
if ($action === 'calc') {
    $city = trim($_POST['city'] ?? '');
    $weight = intval($_POST['weight'] ?? 0);

    // Валидация параметров формы
    if ($city === '' || $weight <= 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Укажите город и вес груза'
        ]);
        exit;
    }

    $params = http_build_query(['city' => $city, 'weight' => $weight]);
    $url = $deliveryUrl . '?' . $params;

    $opts = [
        "http" => [
            "method" => "GET",
            "header" => "Authorization: $auth\r\n"
        ],
        "ssl" => [
            "verify_peer" => false,
            "verify_peer_name" => false
        ]
    ];
    $context = stream_context_create($opts);

    // Запрос к внешнему сервису
    $resp = file_get_contents($url, false, $context);
    echo $resp;
    exit;
}

// Некорректный запрос (нет action)
http_response_code(400);
echo json_encode(['error' => 'Некорректный запрос']);
