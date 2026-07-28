<?php

// Vercel filesystem is read-only; redirect all writable Laravel paths to /tmp
$tmpBase = '/tmp/laravel';

$dirs = [
    "$tmpBase/storage/logs",
    "$tmpBase/storage/framework/sessions",
    "$tmpBase/storage/framework/views",
    "$tmpBase/storage/framework/cache/data",
    "$tmpBase/bootstrap/cache",
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Set working directory to project root
chdir(dirname(__DIR__));

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

// Override storage and bootstrap/cache paths to writable /tmp location
$app->useStoragePath("$tmpBase/storage");
$app->useBootstrapPath("$tmpBase/bootstrap");
$app->instance('path.bootstrap', "$tmpBase/bootstrap");

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
