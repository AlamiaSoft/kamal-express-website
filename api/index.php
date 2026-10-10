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
try {
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
        'options'   => [
            \PDO::ATTR_TIMEOUT => 2,
        ],
    ]);
    $capsule->setAsGlobal();
    $capsule->bootEloquent();

    // Auto-migrations if DB connection is available
    if (@$capsule->getConnection()->getPdo()) {
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

        if (!Capsule::schema()->hasTable('users')) {
            Capsule::schema()->create('users', function ($table) {
                $table->id();
                $table->string('username', 50)->unique();
                $table->string('password_hash', 255);
                $table->string('full_name', 100);
                $table->string('email', 100)->unique();
                $table->string('role', 50)->default('Staff');
                $table->string('status', 50)->default('Active');
                $table->timestamps();
            });

            Capsule::table('users')->insert([
                'username'      => ADMIN_USERNAME,
                'password_hash' => ADMIN_PASSWORD_HASH,
                'full_name'     => 'System Administrator',
                'email'         => ADMIN_EMAIL,
                'role'          => 'Admin',
                'status'        => 'Active',
                'created_at'    => date('Y-m-d H:i:s'),
                'updated_at'    => date('Y-m-d H:i:s')
            ]);
        }
    }
} catch (\Throwable $e) {
    error_log("Database Connection / Migration Note: " . $e->getMessage());
}

// 3. Initialize Slim App
$app = AppFactory::create();

// Set base path matching cPanel subdirectory structure (/api)
$app->setBasePath('/api');

// Add parsing and routing middleware
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();

// Add error middleware
$app->addErrorMiddleware(true, true, true);

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

// AI Support Chat Assistant Route — Proxies to KamalExpress-Agents platform
$app->post('/chat', function ($request, $response) {
    $rawInput = file_get_contents('php://input');
    $parsedBody = json_decode($rawInput, true) ?: $request->getParsedBody();
    $messages = isset($parsedBody['messages']) && is_array($parsedBody['messages']) ? $parsedBody['messages'] : [];

    $userMsg = '';
    $history = [];
    foreach ($messages as $m) {
        if (is_array($m)) {
            $role = strtolower($m['role'] ?? 'user');
            $content = $m['content'] ?? $m['text'] ?? '';
            if ($role === 'user') {
                $userMsg = (string)$content;
            } else {
                $history[] = ['role' => 'assistant', 'content' => (string)$content];
            }
        }
    }

    $agentsUrl = getenv('AI_AGENTS_URL') ?: 'http://host.docker.internal:8080/api/website/chat';
    $agentsToken = getenv('AI_AGENTS_TOKEN') ?: 'ke_website_secret_token_2026';

    $ch = curl_init($agentsUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'message' => $userMsg,
            'history' => $history,
            'session_id' => $parsedBody['session_id'] ?? 'public_website_user'
        ]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'X-Website-Token: ' . $agentsToken
        ],
        CURLOPT_TIMEOUT => 25
    ]);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $result) {
        $decoded = json_decode($result, true);
        $reply = $decoded['response'] ?? $decoded['reply'] ?? '';
        $response->getBody()->write(json_encode(['reply' => $reply]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Graceful fallback if Agents microservice is starting or unreachable
    $response->getBody()->write(json_encode([
        'reply' => "Thank you for reaching out to Kamal Express! Our AI travel team is currently assisting other travelers. Please submit an official inquiry or chat directly with our specialists on WhatsApp."
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Email Action Routes (Public)
$app->get('/sales/approve/{token}', [\App\Controllers\SalesController::class, 'approveViaEmail']);
$app->get('/sales/reject/{token}', [\App\Controllers\SalesController::class, 'rejectViaEmail']);

// Diagnostics Route (Secure)
$app->get('/diagnose', function ($request, $response) {
    $queryParams = $request->getQueryParams();
    $secret = isset($queryParams['secret']) ? $queryParams['secret'] : '';
    if ($secret !== 'kamal_secure_diagnose_2026') {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized access.']));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
    }

    $results = [];
    
    // 1. Test database connection
    try {
        $pdo = Capsule::connection()->getPdo();
        $results['db_connection'] = 'SUCCESS';
    } catch (\Exception $e) {
        $results['db_connection'] = 'FAILED: ' . $e->getMessage();
        $response->getBody()->write(json_encode($results));
        return $response->withHeader('Content-Type', 'application/json');
    }
    
    // 2. Test tables
    $tables = ['inquiries', 'sales_transactions', 'users'];
    foreach ($tables as $table) {
        try {
            $exists = Capsule::schema()->hasTable($table);
            $results['tables'][$table]['exists'] = $exists;
            if ($exists) {
                $columns = Capsule::schema()->getColumnListing($table);
                $results['tables'][$table]['columns'] = $columns;
                
                $count = Capsule::table($table)->count();
                $results['tables'][$table]['count'] = $count;
            }
        } catch (\Exception $e) {
            $results['tables'][$table]['error'] = $e->getMessage();
        }
    }
    
    // 3. Test User admin status
    try {
        if ($results['tables']['users']['exists'] ?? false) {
            $adminExists = Capsule::table('users')->where('role', 'Admin')->exists();
            $results['admin_user_exists'] = $adminExists;
        }
    } catch (\Exception $e) {
        $results['admin_check_error'] = $e->getMessage();
    }
    
    $response->getBody()->write(json_encode($results, JSON_PRETTY_PRINT));
    return $response->withHeader('Content-Type', 'application/json');
});

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
