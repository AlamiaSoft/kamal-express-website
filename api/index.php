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

// Auto-migration for users table and default user seeding if not exists
try {
    if (!Capsule::schema()->hasTable('users')) {
        Capsule::schema()->create('users', function ($table) {
            $table->id();
            $table->string('username', 50)->unique();
            $table->string('password_hash', 255);
            $table->string('full_name', 100);
            $table->string('email', 100)->unique();
            $table->string('role', 50)->default('Staff'); // 'Admin', 'Staff', 'Viewer'
            $table->string('status', 50)->default('Active'); // 'Active', 'Suspended'
            $table->timestamps();
        });

        // Seed the default Admin user using config credentials
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
} catch (\Exception $e) {
    error_log("Users Schema Migration/Seeding Error: " . $e->getMessage());
}

// Auto-migration for content management tables
try {
    // Rename pages_seo to pages if it exists
    if (Capsule::schema()->hasTable('pages_seo') && !Capsule::schema()->hasTable('pages')) {
        Capsule::schema()->rename('pages_seo', 'pages');
    }

    // 1. pages (renamed/created)
    if (!Capsule::schema()->hasTable('pages')) {
        Capsule::schema()->create('pages', function ($table) {
            $table->id();
            $table->string('route_path', 100)->unique();
            $table->json('content')->nullable();
            $table->string('meta_title', 150);
            $table->string('meta_description', 255);
            $table->string('meta_keywords', 255)->nullable();
            $table->timestamps();
        });

        // Seed initial default pages SEO metadata & content blocks
        Capsule::table('pages')->insert([
            [
                'route_path' => '',
                'content' => json_encode([
                    'hero_title' => "Your Trusted Visa Consultant & Travel Agency in Pakistan.",
                    'hero_desc' => "From stress-free visa processing to custom international tour packages, Kamal Express & Holidays ensures your travel plans are in safe hands. Let our experts handle the paperwork while you pack your bags."
                ]),
                'meta_title' => 'Kamal Express - Approved Visas, Lowest Fares & Custom Tours',
                'meta_description' => 'Your Trusted Visa Consultant & Travel Agency in Pakistan. From stress-free visa processing to custom international tour packages, Kamal Express & Holidays ensures your travel plans are in safe hands.',
                'meta_keywords' => 'visa consultancy Islamabad, travel agency Blue Area, Umrah packages Pakistan, discount flights Islamabad',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'route_path' => 'about',
                'content' => json_encode([
                    'story_title' => "The Journey of Kamal Express",
                    'story_p1' => "Founded with a dedicated mission to simplify complicated visa routes and optimize sky travel fares, Kamal Express has evolved from a boutique ticketing agency into raw power inside Islamabad's Blue Area travel ecosystem.",
                    'story_p2' => "From our corporate offices inside Aalay Plaza, Blue Area, we have successfully drafted thousands of application folders representing tourist, business, student, and family migration streams. We maintain active direct integration with major regional and global travel networks, unlocking discounted wholesale room supplies and secure transport lines for our pilgrims.",
                    'story_p3' => "We do not just hand over itinerary plans; we take complete end-to-end accountability. That means checking your active bank records prior to dossier submission, conducting live mock physical interviews, scheduling biometric checkpoints early, and having physical on-ground coordinators travel alongside our Umrah and Northern Area retreat caravans.",
                    'vision' => "To be recognized as the most reliable, transparent, and profile-focused travel consulting agency in South Asian, enabling hassle-free visual gateways to the world while preserving authentic spiritual and cultural exploration values.",
                    'mission' => "To deliver pristine flight ticketing, customized near-Haram Umrah logistics, and comprehensive, highly audited visa consultancy operations that maximize success ratios through personalized profiles, transparent pricing, and stellar direct physical care."
                ]),
                'meta_title' => 'About Us - Decades of Travel Industry Heritage | Kamal Express',
                'meta_description' => 'Learn about the history, vision, and Mufti-led leadership team of Kamal Express, a certified IATA and Ministry-licensed agency.',
                'meta_keywords' => 'about Kamal Express, travel history, leadership team, IATA certified travel agent Islamabad',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'route_path' => 'services',
                'content' => null,
                'meta_title' => 'Our Services - Visa Consulting, Tickets & Lodging | Kamal Express',
                'meta_description' => 'Explore our core ticketing, hotel reservation, travel insurance, apostille stamp verification, and embassy slot coordinates.',
                'meta_keywords' => 'visa services, flight booking, hotel reservation, travel insurance, document legalization',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'route_path' => 'umrah',
                'content' => json_encode([
                    'intro_desc' => "Kamal Express brings decades of dedicated spiritual travel experience. Our Umrah experts design economy, executive, and bespoke VIP packages with priority flights, proximate hotel layouts, secure ground transits, and hassle-free visa pathways."
                ]),
                'meta_title' => 'Umrah Packages - Economy & Premium Haram Caravan Plans | Kamal Express',
                'meta_description' => 'Book custom boutique 3-Star, 4-Star, and Grand 5-Star clock tower near-Haram Umrah groups. Direct support and Shariah guide review.',
                'meta_keywords' => 'Umrah packages 2026, Umrah Islamabad, cheap Umrah packages, premium Umrah group',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'route_path' => 'tours',
                'content' => null,
                'meta_title' => 'Tours & Holiday Packages - Leisure Explorations | Kamal Express',
                'meta_description' => 'Book top-rated customizable domestic and international vacation itineraries with dedicated transit drivers and expert guides.',
                'meta_keywords' => 'holiday packages, leisure tours, tour packages Pakistan, international tours Islamabad',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'route_path' => 'destinations',
                'content' => null,
                'meta_title' => 'Destinations & Visa Rules - Embassy Guidelines | Kamal Express',
                'meta_description' => 'Search visa requirements, fee indexes, valid stays, and required documents for UAE, UK, Schengen, Turkey, Canada, and more.',
                'meta_keywords' => 'visa requirements Pakistan, Schengen visa documents, UK visa requirements, UAE visa fee',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'route_path' => 'blog',
                'content' => null,
                'meta_title' => 'Blog, Travel Updates & Handbooks | Kamal Express',
                'meta_description' => 'Read international visa update notifications, physical Umrah check packing handbooks, and luggage baggage travel tips.',
                'meta_keywords' => 'travel blog Pakistan, visa updates, Umrah guide, travel tips',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ],
            [
                'route_path' => 'contact',
                'content' => json_encode([
                    'address' => "Office 11, Aalay Plaza, Blue Area, Islamabad, Pakistan",
                    'phone' => "(051) 2726807",
                    'email' => "info@kamalexpress.com.pk",
                    'gmaps_iframe' => "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.5913953765103!2d73.0645607762691!3d33.72147103525287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbf9dfc01dc3f%3A0x64319488a0e8ef38!2sAalay%20Plaza!5e0!3m2!1sen!2spk!4v1718200000000!5m2!1sen!2spk"
                ]),
                'meta_title' => 'Contact Us - Corporate Office Blue Area Islamabad | Kamal Express',
                'meta_description' => 'Visit our office at Aalay Plaza Blue Area, call (051) 2726807, or submit a priority contact ticket for quick support response.',
                'meta_keywords' => 'contact Kamal Express, travel agency phone, office address Islamabad, Blue Area travel agent',
                'created_at' => date('Y-m-d H:i:s'), 'updated_at' => date('Y-m-d H:i:s')
            ]
        ]);
    }

    // Add content column to pages if table exists but column is missing
    if (Capsule::schema()->hasTable('pages') && !Capsule::schema()->hasColumn('pages', 'content')) {
        Capsule::schema()->table('pages', function ($table) {
            $table->json('content')->nullable()->after('route_path');
        });
    }

    // 2. blogs
    if (!Capsule::schema()->hasTable('blogs')) {
        Capsule::schema()->create('blogs', function ($table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('title', 200);
            $table->string('category', 100);
            $table->text('summary');
            $table->longText('content');
            $table->string('image', 255)->nullable();
            $table->date('date');
            $table->string('author', 100);
            $table->string('meta_title', 150)->nullable();
            $table->string('meta_description', 255)->nullable();
            $table->string('meta_keywords', 255)->nullable();
            $table->timestamps();
        });
    }

    // 3. tour_packages
    if (!Capsule::schema()->hasTable('tour_packages')) {
        Capsule::schema()->create('tour_packages', function ($table) {
            $table->string('id', 50)->primary();
            $table->string('title', 200);
            $table->string('location', 150);
            $table->string('duration', 50);
            $table->string('price', 50);
            $table->string('category', 50);
            $table->string('image', 255)->nullable();
            $table->text('description');
            $table->json('highlights')->nullable();
            $table->json('itinerary')->nullable();
            $table->json('included')->nullable();
            $table->json('excluded')->nullable();
            $table->string('meta_title', 150)->nullable();
            $table->string('meta_description', 255)->nullable();
            $table->string('meta_keywords', 255)->nullable();
            $table->timestamps();
        });
    }

    // 4. destinations
    if (!Capsule::schema()->hasTable('destinations')) {
        Capsule::schema()->create('destinations', function ($table) {
            $table->string('id', 50)->primary();
            $table->string('name', 150);
            $table->string('slug', 50)->unique();
            $table->string('image', 255)->nullable();
            $table->string('visa_type', 150);
            $table->string('processing_time', 150);
            $table->string('stay_duration', 150);
            $table->string('validity', 150);
            $table->string('price', 50);
            $table->json('required_documents')->nullable();
            $table->json('faqs')->nullable();
            $table->string('meta_title', 150)->nullable();
            $table->string('meta_description', 255)->nullable();
            $table->string('meta_keywords', 255)->nullable();
            $table->timestamps();
        });
    }

    // Add SEO fields to blogs, tour_packages, destinations if tables exist but columns are missing
    foreach (['blogs', 'tour_packages', 'destinations'] as $table) {
        if (Capsule::schema()->hasTable($table) && !Capsule::schema()->hasColumn($table, 'meta_title')) {
            Capsule::schema()->table($table, function ($t) {
                $t->string('meta_title', 150)->nullable();
                $t->string('meta_description', 255)->nullable();
                $t->string('meta_keywords', 255)->nullable();
            });
        }
    }

    // 5. faqs
    if (!Capsule::schema()->hasTable('faqs')) {
        Capsule::schema()->create('faqs', function ($table) {
            $table->id();
            $table->string('category', 100);
            $table->text('question');
            $table->text('answer');
            $table->timestamps();
        });
    }

    // 6. forwarded_sms
    if (!Capsule::schema()->hasTable('forwarded_sms')) {
        Capsule::schema()->create('forwarded_sms', function ($table) {
            $table->id();
            $table->string('sender', 100)->nullable();
            $table->text('message')->nullable();
            $table->string('sent_stamp', 100)->nullable();
            $table->string('received_stamp', 100)->nullable();
            $table->text('raw_payload')->nullable();
            $table->timestamps();
        });
    }
} catch (\Exception $e) {
    error_log("Content Tables Auto-migration Error: " . $e->getMessage());
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
$app->post('/public/sms-webhook', [\App\Controllers\SmsWebhookController::class, 'handleWebhook']);

// Admin CRM Routes
$app->post('/admin/login', [\App\Controllers\AdminController::class, 'login']);
$app->get('/admin/inquiries', [\App\Controllers\AdminController::class, 'getInquiries']);
$app->put('/admin/inquiries/{id}', [\App\Controllers\AdminController::class, 'updateInquiry']);

// Admin SMS Forwarding Logs Routes
$app->get('/admin/sms', [\App\Controllers\SmsWebhookController::class, 'getSms']);
$app->delete('/admin/sms/{id}', [\App\Controllers\SmsWebhookController::class, 'deleteSms']);
$app->delete('/admin/sms', [\App\Controllers\SmsWebhookController::class, 'clearAllSms']);

// Admin Users & Roles Routes
$app->get('/admin/users', [\App\Controllers\UserController::class, 'getUsers']);
$app->post('/admin/users', [\App\Controllers\UserController::class, 'createUser']);
$app->put('/admin/users/{id}', [\App\Controllers\UserController::class, 'updateUser']);
$app->delete('/admin/users/{id}', [\App\Controllers\UserController::class, 'deleteUser']);

// Admin Sales Routes
$app->post('/admin/sales', [\App\Controllers\SalesController::class, 'recordSale']);
$app->get('/admin/sales', [\App\Controllers\SalesController::class, 'getSales']);
$app->put('/admin/sales/{id}', [\App\Controllers\SalesController::class, 'updateSaleStatus']);

// Public Content Read Routes
$app->get('/public/seo', [\App\Controllers\ContentController::class, 'getPublicSeo']);
$app->get('/public/blogs', [\App\Controllers\ContentController::class, 'getPublicBlogs']);
$app->get('/public/packages', [\App\Controllers\ContentController::class, 'getPublicPackages']);
$app->get('/public/destinations', [\App\Controllers\ContentController::class, 'getPublicDestinations']);
$app->get('/public/faqs', [\App\Controllers\ContentController::class, 'getPublicFaqs']);

// Admin Content Editor Routes
$app->get('/admin/seo', [\App\Controllers\ContentController::class, 'getAdminSeo']);
$app->put('/admin/seo/{id}', [\App\Controllers\ContentController::class, 'updateSeo']);
$app->post('/admin/blogs', [\App\Controllers\ContentController::class, 'createBlog']);
$app->put('/admin/blogs/{id}', [\App\Controllers\ContentController::class, 'updateBlog']);
$app->delete('/admin/blogs/{id}', [\App\Controllers\ContentController::class, 'deleteBlog']);
$app->post('/admin/packages', [\App\Controllers\ContentController::class, 'createPackage']);
$app->put('/admin/packages/{id}', [\App\Controllers\ContentController::class, 'updatePackage']);
$app->delete('/admin/packages/{id}', [\App\Controllers\ContentController::class, 'deletePackage']);
$app->post('/admin/destinations', [\App\Controllers\ContentController::class, 'createDestination']);
$app->put('/admin/destinations/{id}', [\App\Controllers\ContentController::class, 'updateDestination']);
$app->delete('/admin/destinations/{id}', [\App\Controllers\ContentController::class, 'deleteDestination']);
$app->post('/admin/faqs', [\App\Controllers\ContentController::class, 'createFaq']);
$app->put('/admin/faqs/{id}', [\App\Controllers\ContentController::class, 'updateFaq']);
$app->delete('/admin/faqs/{id}', [\App\Controllers\ContentController::class, 'deleteFaq']);

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
    $tables = ['inquiries', 'sales_transactions', 'users', 'forwarded_sms'];
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
