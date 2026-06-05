<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Inquiry;

class AdminController {
    
    /**
     * Admin login endpoint
     */
    public function login(Request $request, Response $response) {
        $body = json_decode($request->getBody()->getContents(), true);
        $username = isset($body['username']) ? trim($body['username']) : '';
        $password = isset($body['password']) ? trim($body['password']) : '';
        
        if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH)) {
            // Generate a stateless securely signed token (JWT style)
            $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
            $payload = base64_encode(json_encode([
                'user' => $username,
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
                'username' => $username
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
        
        return true;
    }
}
