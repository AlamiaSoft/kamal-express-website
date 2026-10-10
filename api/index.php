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
        if (!Capsule::schema()->hasTable('inquiries')) {
            Capsule::schema()->create('inquiries', function ($table) {
                $table->id();
                $table->string('reference_id', 50)->unique();
                $table->string('name', 100);
                $table->string('email', 100);
                $table->string('phone', 50);
                $table->string('service_type', 100);
                $table->string('destination', 100);
                $table->text('notes')->nullable();
                $table->text('admin_notes')->nullable();
                $table->string('status', 50)->default('Pending');
                $table->boolean('email_sent')->default(false);
                $table->string('ip_address', 45)->nullable();
                $table->timestamps();
            });
        }

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

        if (!Capsule::schema()->hasTable('chat_sessions')) {
            Capsule::schema()->create('chat_sessions', function ($table) {
                $table->id();
                $table->string('session_id', 64)->unique();
                $table->string('visitor_name', 100)->nullable();
                $table->string('visitor_phone', 50)->nullable();
                $table->string('visitor_email', 100)->nullable();
                $table->string('detected_service', 100)->nullable();
                $table->string('detected_destination', 100)->nullable();
                $table->unsignedBigInteger('inquiry_id')->nullable();
                $table->string('status', 50)->default('active');
                $table->integer('message_count')->default(0);
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamps();
            });
        }

        if (!Capsule::schema()->hasTable('chat_messages')) {
            Capsule::schema()->create('chat_messages', function ($table) {
                $table->id();
                $table->string('session_id', 64);
                $table->string('role', 20); // 'user', 'assistant', 'system'
                $table->text('content');
                $table->string('agent_name', 50)->default('orchestrator');
                $table->timestamp('created_at')->useCurrent();
                $table->index('session_id');
            });
        }
    }
} catch (\Throwable $e) {
    error_log("Database Connection / Migration Note: " . $e->getMessage());
}

// 3. Initialize Slim App
$app = AppFactory::create();

// Determine base path: if request path begins with /api, use /api; otherwise use root
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (strpos($requestUri, '/api') === 0) {
    $app->setBasePath('/api');
}

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

    $sessionId = isset($parsedBody['session_id']) && !empty($parsedBody['session_id'])
        ? trim($parsedBody['session_id'])
        : 'ses_' . substr(md5(uniqid(rand(), true)), 0, 16);

    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $ipAddress = $_SERVER['HTTP_CF_CONNECTING_IP'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipAddress = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    }
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

    // 1. Log incoming user message to database
    try {
        $session = \App\Models\ChatSession::firstOrCreate(
            ['session_id' => $sessionId],
            [
                'status' => 'active',
                'message_count' => 0,
                'ip_address' => $ipAddress,
                'user_agent' => substr($userAgent, 0, 500)
            ]
        );

        if (!empty($userMsg)) {
            \App\Models\ChatMessage::create([
                'session_id' => $sessionId,
                'role' => 'user',
                'content' => $userMsg,
                'agent_name' => 'client'
            ]);
            $session->increment('message_count');
        }
    } catch (\Throwable $e) {
        error_log("Chat Logging Error (User Turn): " . $e->getMessage());
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
            'session_id' => $sessionId
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

    $reply = '';
    $agentName = 'orchestrator';

    if ($httpCode === 200 && $result) {
        $decoded = json_decode($result, true);
        $reply = $decoded['response'] ?? $decoded['reply'] ?? '';
        $agentName = $decoded['agent'] ?? 'orchestrator';
    }

    if (empty($reply)) {
        $reply = "Thank you for reaching out to Kamal Express! Our AI travel team is currently assisting other travelers. Please submit an official inquiry or chat directly with our specialists on WhatsApp.";
    }

    // 2. Log assistant response & run lead capture check
    try {
        \App\Models\ChatMessage::create([
            'session_id' => $sessionId,
            'role' => 'assistant',
            'content' => $reply,
            'agent_name' => $agentName
        ]);

        if (isset($session)) {
            $session->increment('message_count');

            // Scan conversation for contact details & extract lead
            if (empty($session->inquiry_id)) {
                $allUserText = $userMsg;
                foreach ($history as $h) {
                    if (($h['role'] ?? '') === 'user') {
                        $allUserText .= ' ' . ($h['content'] ?? '');
                    }
                }

                // Check for phone number (Pakistan format or international)
                $phoneMatches = [];
                preg_match('/(?:\+?92|0)[0-9]{2,3}[- ]?[0-9]{7}/', $allUserText, $phoneMatches);
                $foundPhone = $phoneMatches[0] ?? null;

                // Check for email address
                $emailMatches = [];
                preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $allUserText, $emailMatches);
                $foundEmail = $emailMatches[0] ?? null;

                if ($foundPhone || $foundEmail) {
                    $year = date('Y');
                    $rand = rand(1000, 9999);
                    $refId = "KE-CHAT-{$year}-{$rand}";

                    // Detect destination keywords
                    $dest = 'General Inquiry';
                    if (preg_match('/china|beijing|shanghai|csc|jw201/i', $allUserText)) $dest = 'China';
                    elseif (preg_match('/greece|schengen|athens/i', $allUserText)) $dest = 'Greece';
                    elseif (preg_match('/umrah|makkah|madinah|saudi/i', $allUserText)) $dest = 'Saudi Arabia';
                    elseif (preg_match('/uk|london|britain/i', $allUserText)) $dest = 'United Kingdom';

                    $inquiry = \App\Models\Inquiry::create([
                        'reference_id' => $refId,
                        'name' => $session->visitor_name ?: 'Website Visitor (' . ($foundPhone ?: $foundEmail) . ')',
                        'email' => $foundEmail ?: 'chat-lead@kamalexpress.com.pk',
                        'phone' => $foundPhone ?: 'N/A',
                        'service_type' => 'AI Chat Lead',
                        'destination' => $dest,
                        'notes' => "Captured from AI chat session: {$sessionId}\nLatest message: {$userMsg}",
                        'status' => 'Pending',
                        'email_sent' => 0,
                        'ip_address' => $ipAddress
                    ]);

                    $session->inquiry_id = $inquiry->id;
                    $session->status = 'converted_lead';
                    $session->visitor_phone = $foundPhone;
                    $session->visitor_email = $foundEmail;
                    $session->detected_destination = $dest;
                    $session->save();
                }
            }
        }
    } catch (\Throwable $e) {
        error_log("Chat Logging Error (Assistant Turn & Lead): " . $e->getMessage());
    }

    $response->getBody()->write(json_encode([
        'reply' => $reply,
        'session_id' => $sessionId,
        'agent' => $agentName
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Admin CRM Routes
$app->post('/admin/login', [\App\Controllers\AdminController::class, 'login']);
$app->get('/admin/inquiries', [\App\Controllers\AdminController::class, 'getInquiries']);
$app->put('/admin/inquiries/{id}', [\App\Controllers\AdminController::class, 'updateInquiry']);

// Admin Chat Logs & Leads Routes
$app->get('/admin/chats', [\App\Controllers\AdminController::class, 'getChatSessions']);
$app->get('/admin/chats/{sessionId}', [\App\Controllers\AdminController::class, 'getChatTranscript']);
$app->post('/admin/chats/{sessionId}/convert', [\App\Controllers\AdminController::class, 'convertChatToLead']);

// Admin Users & Roles Routes
$app->get('/admin/users', [\App\Controllers\UserController::class, 'getUsers']);
$app->post('/admin/users', [\App\Controllers\UserController::class, 'createUser']);
$app->put('/admin/users/{id}', [\App\Controllers\UserController::class, 'updateUser']);
$app->delete('/admin/users/{id}', [\App\Controllers\UserController::class, 'deleteUser']);

// Admin Sales Routes
$app->post('/admin/sales', [\App\Controllers\SalesController::class, 'recordSale']);
$app->get('/admin/sales', [\App\Controllers\SalesController::class, 'getSales']);
$app->put('/admin/sales/{id}', [\App\Controllers\SalesController::class, 'updateSaleStatus']);

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
    $tables = ['inquiries', 'sales_transactions', 'users', 'chat_sessions', 'chat_messages'];
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
