<?php
/**
 * Kamal Express Slim API Entrypoint
 */

use Slim\Factory\AppFactory;
use Illuminate\Database\Capsule\Manager as Capsule;

// 1. Autoload & Configurations
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/config.php';

// 2. Setup Eloquent ORM Capsule Connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => DB_DRIVER,
    'host'      => DB_HOST,
    'database'  => DB_NAME,
    'username'  => DB_USER,
    'password'  => DB_PASS,
    'charset'   => DB_CHARSET,
    'collation' => DB_COLLATION,
    'prefix'    => DB_PREFIX,
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Auto-migration for sales_transactions table if not exists
try {
    if (!Capsule::schema()->hasTable('sales_transactions')) {
        Capsule::schema()->create('sales_transactions', function ($table) {
            $table->id();
            $table->string('reference_id', 50)->unique();
            $table->string('full_name', 100);
            $table->date('date');
            $table->string('serial_number', 100);
            $table->text('services');
            $table->string('vendor_name', 100);
            $table->string('country', 100);
            $table->string('sector', 100);
            $table->decimal('total_amount', 15, 2);
            $table->decimal('received_amount', 15, 2);
            $table->decimal('remaining_amount', 15, 2);
            $table->string('collectors_name', 100);
            $table->string('status', 50)->default('Pending Approval');
            $table->string('approval_token', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }
} catch (\Exception $e) {
    error_log("Eloquent Schema Migration Error: " . $e->getMessage());
}

// 3. Initialize Slim App
$app = AppFactory::create();

// Set base path matching cPanel subdirectory structure (/api)
$app->setBasePath('/api');

// Add parsing and routing middleware
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

// 4. CORS Setup for dynamic requests
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// 5. App Routes
$app->post('/inquiry', [\App\Controllers\FormController::class, 'inquiry']);
$app->post('/contact', [\App\Controllers\FormController::class, 'contact']);

// Admin CRM Routes
$app->post('/admin/login', [\App\Controllers\AdminController::class, 'login']);
$app->get('/admin/inquiries', [\App\Controllers\AdminController::class, 'getInquiries']);
$app->put('/admin/inquiries/{id}', [\App\Controllers\AdminController::class, 'updateInquiry']);

// Admin Sales Routes
$app->post('/admin/sales', [\App\Controllers\SalesController::class, 'recordSale']);
$app->get('/admin/sales', [\App\Controllers\SalesController::class, 'getSales']);
$app->put('/admin/sales/{id}', [\App\Controllers\SalesController::class, 'updateSaleStatus']);

// Email Action Routes (Public)
$app->get('/sales/approve/{token}', [\App\Controllers\SalesController::class, 'approveViaEmail']);
$app->get('/sales/reject/{token}', [\App\Controllers\SalesController::class, 'rejectViaEmail']);

// Define default route fallback
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/', function ($request, $response) {
    $response->getBody()->write(json_encode([
        'status' => 'online',
        'message' => 'Kamal Express Backend API Services running smoothly.'
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// 6. Run Application
$app->run();
