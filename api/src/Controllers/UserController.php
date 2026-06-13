<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;

class UserController {

    /**
     * List all users (Admin only)
     */
    public function getUsers(Request $request, Response $response): Response {
        if (!$this->isAdmin($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access. Admins only.'], 403);
        }

        $users = User::all();
        return $this->jsonResponse($response, $users);
    }

    /**
     * Create a new user (Admin only)
     */
    public function createUser(Request $request, Response $response): Response {
        if (!$this->isAdmin($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access. Admins only.'], 403);
        }

        $data = $request->getParsedBody();

        $required = ['username', 'password', 'fullName', 'email', 'role', 'status'];
        $errors = [];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[] = "{$field} is required.";
            }
        }

        if (!empty($errors)) {
            return $this->jsonResponse($response, ['success' => false, 'errors' => $errors], 400);
        }

        $username = trim($data['username']);
        $email = trim($data['email']);
        $role = trim($data['role']);
        $status = trim($data['status']);

        // Check uniqueness
        if (User::where('username', $username)->exists()) {
            return $this->jsonResponse($response, ['success' => false, 'message' => 'Username already exists.'], 400);
        }
        if (User::where('email', $email)->exists()) {
            return $this->jsonResponse($response, ['success' => false, 'message' => 'Email already registered.'], 400);
        }

        // Validate role
        if (!in_array($role, ['Admin', 'Staff', 'Viewer'])) {
            return $this->jsonResponse($response, ['success' => false, 'message' => 'Invalid role assigned.'], 400);
        }

        // Validate status
        if (!in_array($status, ['Active', 'Suspended'])) {
            return $this->jsonResponse($response, ['success' => false, 'message' => 'Invalid status assigned.'], 400);
        }

        try {
            $user = User::create([
                'username'      => htmlspecialchars($username),
                'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
                'full_name'     => htmlspecialchars(trim($data['fullName'])),
                'email'         => htmlspecialchars($email),
                'role'          => $role,
                'status'        => $status
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'User created successfully.',
                'user'    => $user
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing user (Admin only)
     */
    public function updateUser(Request $request, Response $response, array $args): Response {
        if (!$this->isAdmin($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access. Admins only.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $user = User::find($id);

        if (!$user) {
            return $this->jsonResponse($response, ['error' => 'User not found.'], 404);
        }

        $data = $request->getParsedBody();
        $loggedInUsername = $this->getLoggedInUsername($request);

        // Don't allow changing your own role or suspending yourself
        if ($user->username === $loggedInUsername) {
            if (isset($data['role']) && $data['role'] !== $user->role) {
                return $this->jsonResponse($response, ['success' => false, 'message' => 'You cannot change your own role.'], 400);
            }
            if (isset($data['status']) && $data['status'] !== $user->status) {
                return $this->jsonResponse($response, ['success' => false, 'message' => 'You cannot suspend your own account.'], 400);
            }
        }

        if (isset($data['fullName'])) {
            $user->full_name = htmlspecialchars(trim($data['fullName']));
        }

        if (isset($data['email']) && trim($data['email']) !== '') {
            $email = trim($data['email']);
            if ($email !== $user->email && User::where('email', $email)->exists()) {
                return $this->jsonResponse($response, ['success' => false, 'message' => 'Email already registered.'], 400);
            }
            $user->email = htmlspecialchars($email);
        }

        if (isset($data['password']) && trim($data['password']) !== '') {
            $user->password_hash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        }

        if (isset($data['role']) && in_array($data['role'], ['Admin', 'Staff', 'Viewer'])) {
            $user->role = $data['role'];
        }

        if (isset($data['status']) && in_array($data['status'], ['Active', 'Suspended'])) {
            $user->status = $data['status'];
        }

        try {
            $user->save();
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'User updated successfully.',
                'user'    => $user
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an existing user (Admin only)
     */
    public function deleteUser(Request $request, Response $response, array $args): Response {
        if (!$this->isAdmin($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access. Admins only.'], 403);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $user = User::find($id);

        if (!$user) {
            return $this->jsonResponse($response, ['error' => 'User not found.'], 404);
        }

        $loggedInUsername = $this->getLoggedInUsername($request);

        // Prevent self-deletion
        if ($user->username === $loggedInUsername) {
            return $this->jsonResponse($response, ['success' => false, 'message' => 'You cannot delete your own account.'], 400);
        }

        try {
            $user->delete();
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'User deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper for JSON responses
     */
    private function jsonResponse(Response $response, $data, int $status = 200): Response {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    /**
     * Helper to verify admin role
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

        list($headerEncoded, $payloadEncoded, $signatureProvided) = $parts;

        // Recompute signature
        $signatureRecomputed = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", JWT_SECRET);
        $signatureRecomputedEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signatureRecomputed));

        if (!hash_equals($signatureRecomputedEncoded, $signatureProvided)) {
            return false;
        }

        // Decode payload and verify role
        $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded));
        $payload = json_decode($payloadJson, true);

        if (!isset($payload['exp']) || time() > $payload['exp']) {
            return false;
        }

        // Verify user exists, is active, and is Admin in database
        $user = User::where('username', $payload['user'] ?? '')->first();
        if (!$user || $user->status !== 'Active' || $user->role !== 'Admin') {
            return false;
        }

        return true;
    }

    /**
     * Helper to get logged-in username
     */
    private function getLoggedInUsername(Request $request): ?string {
        $authHeader = $request->getHeaderLine('Authorization');
        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        $token = substr($authHeader, 7);
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        $payloadEncoded = $parts[1];
        $payloadJson = base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded));
        $payload = json_decode($payloadJson, true);

        return $payload['user'] ?? null;
    }
}
