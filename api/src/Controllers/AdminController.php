<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Inquiry;
use App\Models\User;

class AdminController {
    
    /**
     * Admin login endpoint
     */
    public function login(Request $request, Response $response) {
        $body = json_decode($request->getBody()->getContents(), true);
        $username = isset($body['username']) ? trim($body['username']) : '';
        $password = isset($body['password']) ? trim($body['password']) : '';
        
        $user = User::where('username', $username)->first();
        
        if ($user && $user->status === 'Suspended') {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Your account is suspended. Please contact the administrator.'
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }

        if ($user && $user->status === 'Active' && password_verify($password, $user->password_hash)) {
            // Generate a stateless securely signed token (JWT style)
            $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
            $payload = base64_encode(json_encode([
                'user' => $username,
                'name' => $user->full_name,
                'role' => $user->role,
                'exp' => time() + 86400 // Valid for 24 hours
            ]));
            
            // Clean up base64 padding to avoid routing issues in headers
            $header = str_replace(['+', '/', '='], ['-', '_', ''], $header);
            $payload = str_replace(['+', '/', '='], ['-', '_', ''], $payload);
            
            $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
            $signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            $token = "$header.$payload.$signature";
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'token' => $token,
                'username' => $username,
                'role' => $user->role,
                'fullName' => $user->full_name
            ]));
            return $response->withHeader('Content-Type', 'application/json');
        }
        
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => 'Invalid username or password credentials.'
        ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
    
    /**
     * Get all inquiries with filtering and search
     */
    public function getInquiries(Request $request, Response $response) {
        if (!$this->isAuthenticated($request)) {
            $response->getBody()->write(json_encode(['error' => 'Unauthorized access.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
        
        $params = $request->getQueryParams();
        $status = isset($params['status']) ? trim($params['status']) : '';
        $service = isset($params['service']) ? trim($params['service']) : '';
        $search = isset($params['search']) ? trim($params['search']) : '';
        
        $query = Inquiry::query();
        
        // Status filter
        if ($status !== '' && $status !== 'All') {
            $query->where('status', $status);
        }
        
        // Service filter
        if ($service !== '' && $service !== 'All') {
            $query->where('service_type', $service);
        }
        
        // Search filter (matches name, email, phone, reference_id)
        if ($search !== '') {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%")
                  ->orWhere('phone', 'LIKE', "%$search%")
                  ->orWhere('reference_id', 'LIKE', "%$search%");
            });
        }
        
        // Fetch inquiries ordered by latest
        $inquiries = $query->orderBy('created_at', 'desc')->get();
        
        $response->getBody()->write(json_encode($inquiries));
        return $response->withHeader('Content-Type', 'application/json');
    }
    
    /**
     * Update an inquiry status and/or admin notes
     */
    public function updateInquiry(Request $request, Response $response, array $args) {
        if (!$this->isAuthenticated($request)) {
            $response->getBody()->write(json_encode(['error' => 'Unauthorized access.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }
        
        $id = isset($args['id']) ? intval($args['id']) : 0;
        $inquiry = Inquiry::find($id);
        
        if (!$inquiry) {
            $response->getBody()->write(json_encode(['error' => 'Inquiry not found.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
        
        $body = json_decode($request->getBody()->getContents(), true);
        
        if (isset($body['status'])) {
            $status = trim($body['status']);
            if (in_array($status, ['Pending', 'Contacted', 'Closed'])) {
                $inquiry->status = $status;
            }
        }
        
        if (isset($body['admin_notes'])) {
            $inquiry->admin_notes = trim($body['admin_notes']);
        }
        
        $inquiry->save();
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Inquiry updated successfully.',
            'inquiry' => $inquiry
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }
    
    /**
     * Helper to verify token signatures and expiration
     */
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

    /**
     * List all chat conversation sessions with message count and status
     */
    public function getChatSessions(Request $request, Response $response) {
        if (!$this->isAuthenticated($request)) {
            $response->getBody()->write(json_encode(['error' => 'Unauthorized access.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $sessions = \App\Models\ChatSession::with('inquiry')
            ->orderBy('updated_at', 'desc')
            ->get();

        $response->getBody()->write(json_encode($sessions));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Get full message transcript for a specific session ID
     */
    public function getChatTranscript(Request $request, Response $response, array $args) {
        if (!$this->isAuthenticated($request)) {
            $response->getBody()->write(json_encode(['error' => 'Unauthorized access.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $sessionId = $args['sessionId'] ?? '';
        $session = \App\Models\ChatSession::with('inquiry')
            ->where('session_id', $sessionId)
            ->first();

        if (!$session) {
            $response->getBody()->write(json_encode(['error' => 'Chat session not found.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        $messages = \App\Models\ChatMessage::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get();

        $response->getBody()->write(json_encode([
            'session' => $session,
            'messages' => $messages
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Manually convert a chat session to an Inquiry lead ticket
     */
    public function convertChatToLead(Request $request, Response $response, array $args) {
        if (!$this->isAuthenticated($request)) {
            $response->getBody()->write(json_encode(['error' => 'Unauthorized access.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $sessionId = $args['sessionId'] ?? '';
        $session = \App\Models\ChatSession::where('session_id', $sessionId)->first();

        if (!$session) {
            $response->getBody()->write(json_encode(['error' => 'Chat session not found.']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        if ($session->inquiry_id) {
            $existing = \App\Models\Inquiry::find($session->inquiry_id);
            if ($existing) {
                $response->getBody()->write(json_encode([
                    'success' => true,
                    'message' => 'Chat session already converted to Inquiry ticket.',
                    'inquiry' => $existing
                ]));
                return $response->withHeader('Content-Type', 'application/json');
            }
        }

        $year = date('Y');
        $rand = rand(1000, 9999);
        $refId = "KE-CHAT-{$year}-{$rand}";

        // Collect messages summary
        $recentMessages = \App\Models\ChatMessage::where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get();
        $transcriptText = "";
        foreach ($recentMessages as $msg) {
            $transcriptText .= "[" . strtoupper($msg->role) . "]: " . $msg->content . "\n";
        }

        $inquiry = \App\Models\Inquiry::create([
            'reference_id' => $refId,
            'name' => $session->visitor_name ?: 'Visitor (' . ($session->visitor_phone ?: 'Session ' . substr($sessionId, 0, 8)) . ')',
            'email' => $session->visitor_email ?: 'chat-lead@kamalexpress.com.pk',
            'phone' => $session->visitor_phone ?: 'N/A',
            'service_type' => $session->detected_service ?: 'AI Chat Lead',
            'destination' => $session->detected_destination ?: 'General Inquiry',
            'notes' => "Manually converted by staff from Chat Session {$sessionId}.\n\n--- Transcript ---\n" . substr($transcriptText, 0, 1000),
            'status' => 'Pending',
            'email_sent' => 0,
            'ip_address' => $session->ip_address
        ]);

        $session->inquiry_id = $inquiry->id;
        $session->status = 'converted_lead';
        $session->save();

        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Successfully converted chat session to Inquiry ticket.',
            'inquiry' => $inquiry
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
