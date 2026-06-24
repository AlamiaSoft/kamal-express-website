<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Illuminate\Database\Capsule\Manager as Capsule;
use App\Models\User;

class SmsWebhookController {

    /**
     * Handles incoming SMS webhook forwarded from Android SMS Gateway Webhook app
     */
    public function handleWebhook(Request $request, Response $response): Response {
        // Try parsing body
        $data = $request->getParsedBody();
        
        // If empty or not array, try parsing raw content manually
        if (empty($data) || !is_array($data)) {
            $rawBody = $request->getBody()->getContents();
            if (!empty($rawBody)) {
                $decoded = json_decode($rawBody, true);
                if (is_array($decoded)) {
                    $data = $decoded;
                } else {
                    $data = ['raw_text' => $rawBody];
                }
            } else {
                $data = [];
            }
        }

        // Search for common sender keys
        $sender = null;
        foreach (['sender', 'from', 'phone', 'phone_number', 'phoneNo', 'number', 'address'] as $key) {
            if (isset($data[$key]) && is_string($data[$key])) {
                $sender = trim($data[$key]);
                break;
            }
        }

        // Search for common message/text keys
        $message = null;
        foreach (['message', 'text', 'body', 'sms', 'sms_text', 'content'] as $key) {
            if (isset($data[$key]) && is_string($data[$key])) {
                $message = trim($data[$key]);
                break;
            }
        }

        // Search for common sent stamp/timestamp keys
        $sentStamp = null;
        foreach (['sent_stamp', 'sentStamp', 'sent_at', 'sent', 'sent_timestamp', 'date', 'timestamp'] as $key) {
            if (isset($data[$key])) {
                $sentStamp = trim((string)$data[$key]);
                break;
            }
        }

        // Search for common received stamp/timestamp keys
        $receivedStamp = null;
        foreach (['received_stamp', 'receivedStamp', 'received_at', 'received', 'received_timestamp'] as $key) {
            if (isset($data[$key])) {
                $receivedStamp = trim((string)$data[$key]);
                break;
            }
        }

        // Fallback: if message is null but data has keys, serialize
        if ($message === null && !empty($data)) {
            if (isset($data['raw_text'])) {
                $message = $data['raw_text'];
            }
        }

        // Save to forwarded_sms database table
        try {
            Capsule::table('forwarded_sms')->insert([
                'sender' => $sender,
                'message' => $message,
                'sent_stamp' => $sentStamp,
                'received_stamp' => $receivedStamp,
                'raw_payload' => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'SMS logged successfully.'
            ], 200);

        } catch (\Exception $e) {
            error_log("SMS Webhook Log Error: " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to save SMS to database: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Authenticated Admin CRUD - GET all SMS logs (Strictly Admin only)
     */
    public function getSms(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if (!$this->isAdmin($request)) {
            return $this->jsonResponse($response, ['error' => 'Forbidden: Admin access required.'], 403);
        }
        
        try {
            $sms = Capsule::table('forwarded_sms')->orderBy('id', 'desc')->get();
            return $this->jsonResponse($response, $sms);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => 'Failed to fetch SMS records: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Authenticated Admin CRUD - DELETE single SMS log (Strictly Admin only)
     */
    public function deleteSms(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if (!$this->isAdmin($request)) {
            return $this->jsonResponse($response, ['error' => 'Forbidden: Admin access required.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $record = Capsule::table('forwarded_sms')->where('id', $id)->first();
        if (!$record) {
            return $this->jsonResponse($response, ['error' => 'SMS record not found.'], 404);
        }

        try {
            Capsule::table('forwarded_sms')->where('id', $id)->delete();
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'SMS record deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => 'Failed to delete SMS record: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Authenticated Admin CRUD - DELETE ALL SMS logs (Strictly Admin only)
     */
    public function clearAllSms(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }
        if (!$this->isAdmin($request)) {
            return $this->jsonResponse($response, ['error' => 'Forbidden: Admin access required.'], 403);
        }

        try {
            Capsule::table('forwarded_sms')->truncate();
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'All forwarded SMS logs have been cleared successfully.'
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => 'Failed to clear SMS records: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Helper to return a JSON response
     */
    private function jsonResponse(Response $response, $data, int $status = 200): Response {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    /**
     * Authentication check helper
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
        $signatureRecomputed = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET);
        $signatureRecomputedEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signatureRecomputed));

        if (!hash_equals($signatureRecomputedEncoded, $signatureProvided)) {
            return false;
        }

        $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded));
        $payload = json_decode($payloadJson, true);

        if (!isset($payload['exp']) || time() > $payload['exp']) {
            return false;
        }

        $user = User::where('username', $payload['user'] ?? '')->first();
        if (!$user || $user->status !== 'Active') {
            return false;
        }

        return true;
    }

    /**
     * Admin role check helper
     */
    private function isAdmin(Request $request): bool {
        $authHeader = $request->getHeaderLine('Authorization');
        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            return false;
        }

        $token = substr($authHeader, 7);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        $payloadEncoded = $parts[1];
        $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded));
        $payload = json_decode($payloadJson, true);

        $user = User::where('username', $payload['user'] ?? '')->first();
        return $user && $user->role === 'Admin';
    }
}
