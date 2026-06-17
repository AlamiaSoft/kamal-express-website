<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\PagesSeo;
use App\Models\BlogPost;
use App\Models\TourPackage;
use App\Models\Destination;
use App\Models\Faq;
use App\Models\User;

class ContentController {

    /* =========================================================================
     * 1. Public Read APIs
     * ========================================================================= */

    public function getPublicSeo(Request $request, Response $response): Response {
        $seo = PagesSeo::all();
        return $this->jsonResponse($response, $seo);
    }

    public function getPublicBlogs(Request $request, Response $response): Response {
        $blogs = BlogPost::orderBy('date', 'desc')->get();
        return $this->jsonResponse($response, $blogs);
    }

    public function getPublicPackages(Request $request, Response $response): Response {
        $packages = TourPackage::all();
        return $this->jsonResponse($response, $packages);
    }

    public function getPublicDestinations(Request $request, Response $response): Response {
        $destinations = Destination::all();
        return $this->jsonResponse($response, $destinations);
    }

    public function getPublicFaqs(Request $request, Response $response): Response {
        $faqs = Faq::all();
        return $this->jsonResponse($response, $faqs);
    }

    /* =========================================================================
     * 2. Admin CRUD APIs - Pages SEO & Template Rewriter
     * ========================================================================= */

    public function updateSeo(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $seo = PagesSeo::find($id);
        if (!$seo) {
            return $this->jsonResponse($response, ['error' => 'SEO record not found.'], 404);
        }

        $data = json_decode($request->getBody()->getContents(), true);
        $metaTitle = isset($data['meta_title']) ? trim($data['meta_title']) : '';
        $metaDescription = isset($data['meta_description']) ? trim($data['meta_description']) : '';
        $metaKeywords = isset($data['meta_keywords']) ? trim($data['meta_keywords']) : '';

        if ($metaTitle === '' || $metaDescription === '') {
            return $this->jsonResponse($response, ['error' => 'Meta Title and Description are required.'], 400);
        }

        $seo->meta_title = $metaTitle;
        $seo->meta_description = $metaDescription;
        $seo->meta_keywords = $metaKeywords;
        $seo->save();

        // Server-Side SEO Pre-rendering HTML Update
        $this->rewriteStaticHtmlMeta($seo->route_path, $metaTitle, $metaDescription, $metaKeywords);

        return $this->jsonResponse($response, [
            'success' => true,
            'message' => 'SEO page updated successfully and pre-rendered server headers synced.',
            'seo' => $seo
        ]);
    }

    /* =========================================================================
     * 3. Admin CRUD APIs - Blog Articles
     * ========================================================================= */

    public function createBlog(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $data = json_decode($request->getBody()->getContents(), true);
        $required = ['title', 'slug', 'category', 'summary', 'content', 'author', 'date'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return $this->jsonResponse($response, ['error' => "Field '{$field}' is required."], 400);
            }
        }

        $slug = trim($data['slug']);
        if (BlogPost::where('slug', $slug)->exists()) {
            return $this->jsonResponse($response, ['error' => 'Blog article with this slug already exists.'], 400);
        }

        $blog = BlogPost::create([
            'title' => trim($data['title']),
            'slug' => $slug,
            'category' => trim($data['category']),
            'summary' => trim($data['summary']),
            'content' => trim($data['content']),
            'image' => isset($data['image']) ? trim($data['image']) : '',
            'author' => trim($data['author']),
            'date' => trim($data['date'])
        ]);

        return $this->jsonResponse($response, ['success' => true, 'blog' => $blog]);
    }

    public function updateBlog(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $blog = BlogPost::find($id);
        if (!$blog) {
            return $this->jsonResponse($response, ['error' => 'Blog article not found.'], 404);
        }

        $data = json_decode($request->getBody()->getContents(), true);
        if (isset($data['slug'])) {
            $slug = trim($data['slug']);
            if ($slug !== $blog->slug && BlogPost::where('slug', $slug)->exists()) {
                return $this->jsonResponse($response, ['error' => 'Blog article with this slug already exists.'], 400);
            }
            $blog->slug = $slug;
        }

        if (isset($data['title'])) $blog->title = trim($data['title']);
        if (isset($data['category'])) $blog->category = trim($data['category']);
        if (isset($data['summary'])) $blog->summary = trim($data['summary']);
        if (isset($data['content'])) $blog->content = trim($data['content']);
        if (isset($data['image'])) $blog->image = trim($data['image']);
        if (isset($data['author'])) $blog->author = trim($data['author']);
        if (isset($data['date'])) $blog->date = trim($data['date']);

        $blog->save();
        return $this->jsonResponse($response, ['success' => true, 'blog' => $blog]);
    }

    public function deleteBlog(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $blog = BlogPost::find($id);
        if (!$blog) {
            return $this->jsonResponse($response, ['error' => 'Blog article not found.'], 404);
        }

        $blog->delete();
        return $this->jsonResponse($response, ['success' => true, 'message' => 'Blog deleted successfully.']);
    }

    /* =========================================================================
     * 4. Admin CRUD APIs - Travel Packages
     * ========================================================================= */

    public function createPackage(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $data = json_decode($request->getBody()->getContents(), true);
        $required = ['id', 'title', 'location', 'duration', 'price', 'category', 'description'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return $this->jsonResponse($response, ['error' => "Field '{$field}' is required."], 400);
            }
        }

        $id = trim($data['id']);
        if (TourPackage::where('id', $id)->exists()) {
            return $this->jsonResponse($response, ['error' => 'Package with this ID already exists.'], 400);
        }

        $package = TourPackage::create([
            'id' => $id,
            'title' => trim($data['title']),
            'location' => trim($data['location']),
            'duration' => trim($data['duration']),
            'price' => trim($data['price']),
            'category' => trim($data['category']),
            'image' => isset($data['image']) ? trim($data['image']) : '',
            'description' => trim($data['description']),
            'highlights' => isset($data['highlights']) ? $data['highlights'] : [],
            'itinerary' => isset($data['itinerary']) ? $data['itinerary'] : [],
            'included' => isset($data['included']) ? $data['included'] : [],
            'excluded' => isset($data['excluded']) ? $data['excluded'] : []
        ]);

        return $this->jsonResponse($response, ['success' => true, 'package' => $package]);
    }

    public function updatePackage(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? trim($args['id']) : '';
        $package = TourPackage::find($id);
        if (!$package) {
            return $this->jsonResponse($response, ['error' => 'Package not found.'], 404);
        }

        $data = json_decode($request->getBody()->getContents(), true);

        if (isset($data['title'])) $package->title = trim($data['title']);
        if (isset($data['location'])) $package->location = trim($data['location']);
        if (isset($data['duration'])) $package->duration = trim($data['duration']);
        if (isset($data['price'])) $package->price = trim($data['price']);
        if (isset($data['category'])) $package->category = trim($data['category']);
        if (isset($data['image'])) $package->image = trim($data['image']);
        if (isset($data['description'])) $package->description = trim($data['description']);
        if (isset($data['highlights'])) $package->highlights = $data['highlights'];
        if (isset($data['itinerary'])) $package->itinerary = $data['itinerary'];
        if (isset($data['included'])) $package->included = $data['included'];
        if (isset($data['excluded'])) $package->excluded = $data['excluded'];

        $package->save();
        return $this->jsonResponse($response, ['success' => true, 'package' => $package]);
    }

    public function deletePackage(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? trim($args['id']) : '';
        $package = TourPackage::find($id);
        if (!$package) {
            return $this->jsonResponse($response, ['error' => 'Package not found.'], 404);
        }

        $package->delete();
        return $this->jsonResponse($response, ['success' => true, 'message' => 'Package deleted successfully.']);
    }

    /* =========================================================================
     * 5. Admin CRUD APIs - Visa Destinations
     * ========================================================================= */

    public function createDestination(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $data = json_decode($request->getBody()->getContents(), true);
        $required = ['id', 'name', 'slug', 'visa_type', 'processing_time', 'stay_duration', 'validity', 'price'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return $this->jsonResponse($response, ['error' => "Field '{$field}' is required."], 400);
            }
        }

        $id = trim($data['id']);
        $slug = trim($data['slug']);
        if (Destination::where('id', $id)->exists() || Destination::where('slug', $slug)->exists()) {
            return $this->jsonResponse($response, ['error' => 'Destination with this ID or slug already exists.'], 400);
        }

        $destination = Destination::create([
            'id' => $id,
            'name' => trim($data['name']),
            'slug' => $slug,
            'image' => isset($data['image']) ? trim($data['image']) : '',
            'visa_type' => trim($data['visa_type']),
            'processing_time' => trim($data['processing_time']),
            'stay_duration' => trim($data['stay_duration']),
            'validity' => trim($data['validity']),
            'price' => trim($data['price']),
            'required_documents' => isset($data['required_documents']) ? $data['required_documents'] : [],
            'faqs' => isset($data['faqs']) ? $data['faqs'] : []
        ]);

        return $this->jsonResponse($response, ['success' => true, 'destination' => $destination]);
    }

    public function updateDestination(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? trim($args['id']) : '';
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->jsonResponse($response, ['error' => 'Destination not found.'], 404);
        }

        $data = json_decode($request->getBody()->getContents(), true);

        if (isset($data['slug'])) {
            $slug = trim($data['slug']);
            if ($slug !== $destination->slug && Destination::where('slug', $slug)->exists()) {
                return $this->jsonResponse($response, ['error' => 'Destination with this slug already exists.'], 400);
            }
            $destination->slug = $slug;
        }

        if (isset($data['name'])) $destination->name = trim($data['name']);
        if (isset($data['image'])) $destination->image = trim($data['image']);
        if (isset($data['visa_type'])) $destination->visa_type = trim($data['visa_type']);
        if (isset($data['processing_time'])) $destination->processing_time = trim($data['processing_time']);
        if (isset($data['stay_duration'])) $destination->stay_duration = trim($data['stay_duration']);
        if (isset($data['validity'])) $destination->validity = trim($data['validity']);
        if (isset($data['price'])) $destination->price = trim($data['price']);
        if (isset($data['required_documents'])) $destination->required_documents = $data['required_documents'];
        if (isset($data['faqs'])) $destination->faqs = $data['faqs'];

        $destination->save();
        return $this->jsonResponse($response, ['success' => true, 'destination' => $destination]);
    }

    public function deleteDestination(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? trim($args['id']) : '';
        $destination = Destination::find($id);
        if (!$destination) {
            return $this->jsonResponse($response, ['error' => 'Destination not found.'], 404);
        }

        $destination->delete();
        return $this->jsonResponse($response, ['success' => true, 'message' => 'Destination deleted successfully.']);
    }

    /* =========================================================================
     * 6. Admin CRUD APIs - FAQs
     * ========================================================================= */

    public function createFaq(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $data = json_decode($request->getBody()->getContents(), true);
        if (!isset($data['category']) || !isset($data['question']) || !isset($data['answer'])) {
            return $this->jsonResponse($response, ['error' => 'Category, Question and Answer are required.'], 400);
        }

        $faq = Faq::create([
            'category' => trim($data['category']),
            'question' => trim($data['question']),
            'answer' => trim($data['answer'])
        ]);

        return $this->jsonResponse($response, ['success' => true, 'faq' => $faq]);
    }

    public function updateFaq(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $faq = Faq::find($id);
        if (!$faq) {
            return $this->jsonResponse($response, ['error' => 'FAQ not found.'], 404);
        }

        $data = json_decode($request->getBody()->getContents(), true);
        if (isset($data['category'])) $faq->category = trim($data['category']);
        if (isset($data['question'])) $faq->question = trim($data['question']);
        if (isset($data['answer'])) $faq->answer = trim($data['answer']);

        $faq->save();
        return $this->jsonResponse($response, ['success' => true, 'faq' => $faq]);
    }

    public function deleteFaq(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if ($this->isReadOnly($request)) {
            return $this->jsonResponse($response, ['error' => 'View-only access restricted.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $faq = Faq::find($id);
        if (!$faq) {
            return $this->jsonResponse($response, ['error' => 'FAQ not found.'], 404);
        }

        $faq->delete();
        return $this->jsonResponse($response, ['success' => true, 'message' => 'FAQ deleted successfully.']);
    }

    /* =========================================================================
     * 7. Private Helper Methods
     * ========================================================================= */

    private function jsonResponse(Response $response, $data, int $status = 200): Response {
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    private function isAuthenticated(Request $request): bool {
        $authHeader = $request->getHeaderLine('Authorization');
        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            return false;
        }

        $token = substr($authHeader, 7);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        list($headerEncoded, $payloadEncoded, $signatureProvided) = $parts;

        // Recompute signature
        $signatureRecomputed = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET);
        $signatureRecomputedEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signatureRecomputed));

        if (!hash_equals($signatureRecomputedEncoded, $signatureProvided)) {
            return false;
        }

        // Decode payload and verify expiration
        $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded));
        $payload = json_decode($payloadJson, true);

        if (!isset($payload['exp']) || time() > $payload['exp']) {
            return false; // Token expired
        }

        // Verify user exists and is active in database
        $user = User::where('username', $payload['user'] ?? '')->first();
        if (!$user || $user->status !== 'Active') {
            return false;
        }

        return true;
    }

    private function isReadOnly(Request $request): bool {
        $authHeader = $request->getHeaderLine('Authorization');
        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            return true;
        }

        $token = substr($authHeader, 7);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return true;
        }

        $payloadEncoded = $parts[1];
        $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded));
        $payload = json_decode($payloadJson, true);

        $user = User::where('username', $payload['user'] ?? '')->first();
        return !$user || $user->role === 'Viewer';
    }

    /**
     * Rewrites static pre-rendered HTML file header meta parameters on cPanel server
     */
    private function rewriteStaticHtmlMeta(string $routePath, string $newTitle, string $newDescription, string $newKeywords): void {
        try {
            $docRoot = dirname(__DIR__, 3); // points to public_html or subdomain root folder
            
            $routePath = trim($routePath, '/');
            if ($routePath === '' || $routePath === 'home') {
                $filePath = $docRoot . '/index.html';
            } else {
                $filePath = $docRoot . '/' . $routePath . '/index.html';
            }

            if (!file_exists($filePath)) {
                return;
            }

            $html = file_get_contents($filePath);
            if ($html === false) {
                return;
            }

            // 1. Replace <title>
            $html = preg_replace('/<title>.*?<\/title>/i', '<title>' . htmlspecialchars($newTitle) . '</title>', $html);

            // 2. Replace description meta
            $html = preg_replace('/<meta name="description" content=".*?"\s*\/?>/i', '<meta name="description" content="' . htmlspecialchars($newDescription) . '" />', $html);

            // 3. Replace keywords meta
            if ($newKeywords !== '') {
                if (preg_match('/<meta name="keywords" content=".*?"\s*\/?>/i', $html)) {
                    $html = preg_replace('/<meta name="keywords" content=".*?"\s*\/?>/i', '<meta name="keywords" content="' . htmlspecialchars($newKeywords) . '" />', $html);
                } else {
                    // Inject keyword meta if doesn't exist
                    $html = preg_replace('/<\/head>/i', '  <meta name="keywords" content="' . htmlspecialchars($newKeywords) . '" />' . "\n" . '  </head>', $html);
                }
            }

            // 4. Replace og:title
            $html = preg_replace('/<meta property="og:title" content=".*?"\s*\/?>/i', '<meta property="og:title" content="' . htmlspecialchars($newTitle) . '" />', $html);

            // 5. Replace og:description
            $html = preg_replace('/<meta property="og:description" content=".*?"\s*\/?>/i', '<meta property="og:description" content="' . htmlspecialchars($newDescription) . '" />', $html);

            // 6. Replace twitter:title
            $html = preg_replace('/<meta name="twitter:title" content=".*?"\s*\/?>/i', '<meta name="twitter:title" content="' . htmlspecialchars($newTitle) . '" />', $html);

            // 7. Replace twitter:description
            $html = preg_replace('/<meta name="twitter:description" content=".*?"\s*\/?>/i', '<meta name="twitter:description" content="' . htmlspecialchars($newDescription) . '" />', $html);

            file_put_contents($filePath, $html);
        } catch (\Exception $e) {
            error_log("SEO Pre-render File Rewriter Error: " . $e->getMessage());
        }
    }
}
