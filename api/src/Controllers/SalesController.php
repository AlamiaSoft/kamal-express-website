<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\SalesTransaction;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailerException;

class SalesController {

    /**
     * Record a new sales transaction from staff CRM submission
     */
    public function recordSale(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }

        $data = $request->getParsedBody();

        // Honeypot anti-spam check
        if (!empty($data['website'])) {
            return $this->jsonResponse($response, ['success' => true, 'message' => 'Recorded successfully (spam ignored).']);
        }

        // Validate required fields
        $required = [
            'fullName', 'date', 'services', 'vendorName',
            'country', 'sector', 'totalAmount', 'receivedAmount', 'remainingAmount', 'collectorsName'
        ];
        
        $errors = [];
        foreach ($required as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '') || (is_array($data[$field]) && empty($data[$field]))) {
                $errors[] = "{$field} is required.";
            }
        }

        if (!empty($errors)) {
            return $this->jsonResponse($response, ['success' => false, 'errors' => $errors], 400);
        }

        // Generate Reference ID (e.g. KS-2026-1234)
        $year = date('Y');
        $random = rand(1000, 9999);
        $referenceId = "KS-{$year}-{$random}";

        // Generate Secure Approval Token
        $approvalToken = bin2hex(random_bytes(16));

        // Format Date to YYYY-MM-DD
        $formattedDate = date('Y-m-d', strtotime($data['date']));

        // Auto-generate incrementing Serial Number in SF-YYMMDD-XXXX format resetting daily
        try {
            $datePrefix = date('ymd', strtotime($data['date']));
            $lastTransaction = SalesTransaction::where('date', $formattedDate)
                ->where('serial_number', 'LIKE', "SF-{$datePrefix}-%")
                ->orderByRaw('CAST(SUBSTRING_INDEX(serial_number, "-", -1) AS UNSIGNED) DESC')
                ->first();

            if ($lastTransaction) {
                $parts = explode('-', $lastTransaction->serial_number);
                $lastNum = (int)end($parts);
                $nextNum = $lastNum + 1;
            } else {
                $nextNum = 1;
            }
            $serialNumber = sprintf("SF-%s-%04d", $datePrefix, $nextNum);
        } catch (\Exception $e) {
            // Fallback to daily-random structure if query fails
            $serialNumber = "SF-" . date('ymd') . "-" . rand(1000, 9999);
        }

        // Get IP Address
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ipAddress = $_SERVER['HTTP_CF_CONNECTING_IP'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipAddress = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }

        try {
            $transaction = SalesTransaction::create([
                'reference_id'     => $referenceId,
                'full_name'        => htmlspecialchars(trim($data['fullName'])),
                'date'             => $formattedDate,
                'serial_number'    => $serialNumber,
                'services'         => $data['services'], // automatically cast to json text by Eloquent
                'vendor_name'      => htmlspecialchars(trim($data['vendorName'])),
                'country'          => htmlspecialchars(trim($data['country'])),
                'sector'           => htmlspecialchars(trim($data['sector'])),
                'total_amount'     => floatval($data['totalAmount']),
                'received_amount'  => floatval($data['receivedAmount']),
                'remaining_amount' => floatval($data['remainingAmount']),
                'collectors_name'  => htmlspecialchars(trim($data['collectorsName'])),
                'status'           => 'Pending Approval',
                'approval_token'   => $approvalToken,
                'ip_address'       => $ipAddress
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Failed to save sales transaction: ' . $e->getMessage()
            ], 500);
        }

        // Dispatch approval email to kamal@kamalexpress.com
        $emailSent = $this->sendApprovalEmail($request, $transaction);

        return $this->jsonResponse($response, [
            'success'      => true,
            'message'      => 'Sales record submitted for approval.',
            'reference_id' => $referenceId,
            'email_sent'   => $emailSent
        ]);
    }

    /**
     * Get all sales transactions for CRM list board
     */
    public function getSales(Request $request, Response $response): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }

        $sales = SalesTransaction::orderBy('created_at', 'desc')->get();
        return $this->jsonResponse($response, $sales);
    }

    /**
     * Update a sales transaction status from CRM admin dashboard
     */
    public function updateSaleStatus(Request $request, Response $response, array $args): Response {
        if (!$this->isAuthenticated($request)) {
            return $this->jsonResponse($response, ['error' => 'Unauthorized access.'], 401);
        }

        $id = isset($args['id']) ? intval($args['id']) : 0;
        $transaction = SalesTransaction::find($id);

        if (!$transaction) {
            return $this->jsonResponse($response, ['error' => 'Transaction not found.'], 404);
        }

        $body = json_decode($request->getBody()->getContents(), true);
        
        if (isset($body['status'])) {
            $status = trim($body['status']);
            if (in_array($status, ['Pending Approval', 'Approved', 'Rejected'])) {
                $transaction->status = $status;
                // If resolved, clear the token so it cannot be double processed from email
                if ($status !== 'Pending Approval') {
                    $transaction->approval_token = null;
                }
            }
        }

        $transaction->save();

        return $this->jsonResponse($response, [
            'success' => true,
            'message' => 'Transaction status updated successfully.',
            'sale' => $transaction
        ]);
    }

    /**
     * Email link: Approve transaction
     */
    public function approveViaEmail(Request $request, Response $response, array $args): Response {
        $token = $args['token'] ?? '';
        
        if (empty($token)) {
            return $this->renderHtmlResponse($response, 'Invalid Token', 'The approval token provided is invalid or missing.', 'danger');
        }

        $transaction = SalesTransaction::where('approval_token', $token)->first();

        if (!$transaction) {
            return $this->renderHtmlResponse($response, 'Transaction Not Found', 'This transaction has already been processed or the approval token is invalid.', 'danger');
        }

        $transaction->status = 'Approved';
        $transaction->approval_token = null; // Clear token
        $transaction->save();

        return $this->renderHtmlResponse($response, 'Transaction Approved', "The transaction with Reference ID <strong>{$transaction->reference_id}</strong> has been successfully approved.", 'success', $transaction);
    }

    /**
     * Email link: Reject transaction
     */
    public function rejectViaEmail(Request $request, Response $response, array $args): Response {
        $token = $args['token'] ?? '';

        if (empty($token)) {
            return $this->renderHtmlResponse($response, 'Invalid Token', 'The rejection token provided is invalid or missing.', 'danger');
        }

        $transaction = SalesTransaction::where('approval_token', $token)->first();

        if (!$transaction) {
            return $this->renderHtmlResponse($response, 'Transaction Not Found', 'This transaction has already been processed or the rejection token is invalid.', 'danger');
        }

        $transaction->status = 'Rejected';
        $transaction->approval_token = null; // Clear token
        $transaction->save();

        return $this->renderHtmlResponse($response, 'Transaction Rejected', "The transaction with Reference ID <strong>{$transaction->reference_id}</strong> has been rejected.", 'rejected', $transaction);
    }

    /**
     * Dispatches the approval email to kamal@kamalexpress.com
     */
    private function sendApprovalEmail(Request $request, SalesTransaction $transaction): bool {
        // Bypass if details are placeholder configurations
        if (SMTP_PASS === 'YOUR_SMTP_PASSWORD') {
            error_log("PHPMailer: SMTP credentials are not configured. Email notification skipped.");
            return false;
        }

        // Build URLs dynamically based on request
        $uri = $request->getUri();
        $scheme = $uri->getScheme();
        $authority = $uri->getAuthority();
        $baseUrl = "{$scheme}://{$authority}";

        $approveUrl = "{$baseUrl}/api/sales/approve/{$transaction->approval_token}";
        $rejectUrl = "{$baseUrl}/api/sales/reject/{$transaction->approval_token}";

        $mail = new PHPMailer(true);

        try {
            // SMTP Configurations
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = SMTP_AUTH;
            $mail->Username   = SMTP_USER;
            $mail->Password   = SMTP_PASS;
            $mail->SMTPSecure = SMTP_SECURE;
            $mail->Port       = SMTP_PORT;

            // Sender and Receiver Coordinates
            $mail->setFrom(FROM_EMAIL, FROM_NAME);
            $mail->addAddress('kamal@kamalexpress.com'); // Requested recipient
            
            // Mail Body
            $mail->isHTML(true);
            $mail->Subject = "ACTION REQUIRED: Approve Sale Transaction {$transaction->reference_id}";

            $servicesStr = implode(', ', $transaction->services);

            // Rich HTML Template with CTA buttons
            $htmlBody = "
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); }
                    .header { background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 12px 12px 0 0; text-align: center; }
                    .header h2 { margin: 0; font-size: 20px; font-weight: 800; }
                    .header p { margin: 5px 0 0; font-size: 13px; color: #94a3b8; }
                    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
                    .details-table th, .details-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                    .details-table th { background-color: #f8fafc; font-weight: 700; color: #475569; width: 35%; }
                    .details-table td { color: #1e293b; }
                    .amount { font-weight: 800; color: #0f172a; }
                    .actions-box { text-align: center; margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; }
                    .actions-box p { margin: 0 0 16px; font-size: 13px; font-weight: 600; color: #475569; }
                    .btn { display: inline-block; padding: 12px 28px; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 10px; margin: 5px 10px; transition: all 0.2s; }
                    .btn-approve { background-color: #059669; color: #ffffff !important; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.15); }
                    .btn-reject { background-color: #dc2626; color: #ffffff !important; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.15); }
                    .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #edf2f7; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Kamal Express & Holidays</h2>
                        <p>Sales Form Authorization Required</p>
                    </div>
                    
                    <p style='font-size: 14px; color: #475569;'>A new sales record has been logged by the sales team and requires your approval to be finalized in the CRM.</p>
                    
                    <table class='details-table'>
                        <tr><th>Reference ID</th><td><strong>{$transaction->reference_id}</strong></td></tr>
                        <tr><th>Sales Staff Name</th><td>{$transaction->full_name}</td></tr>
                        <tr><th>Collector's Name</th><td>{$transaction->collectors_name}</td></tr>
                        <tr><th>Date of Transaction</th><td>" . $transaction->date->format('M d, Y') . "</td></tr>
                        <tr><th>Serial Number</th><td>{$transaction->serial_number}</td></tr>
                        <tr><th>Services Sold</th><td>{$servicesStr}</td></tr>
                        <tr><th>Vendor</th><td>{$transaction->vendor_name}</td></tr>
                        <tr><th>Country</th><td>{$transaction->country}</td></tr>
                        <tr><th>Sector</th><td>{$transaction->sector}</td></tr>
                        <tr><th>Total Amount</th><td class='amount'>{$transaction->total_amount}</td></tr>
                        <tr><th>Received Amount</th><td class='amount' style='color: #059669;'>{$transaction->received_amount}</td></tr>
                        <tr><th>Remaining Balance</th><td class='amount' style='color: #dc2626;'>{$transaction->remaining_amount}</td></tr>
                    </table>
                    
                    <div class='actions-box'>
                        <p>Authorize this transaction:</p>
                        <a href='{$approveUrl}' class='btn btn-approve'>Approve & Save</a>
                        <a href='{$rejectUrl}' class='btn btn-reject'>Reject Transaction</a>
                    </div>
                    
                    <div class='footer'>
                        This message was automatically generated by the web server on behalf of Kamal Express CRM.<br>
                        Aalay Plaza, Blue Area, Islamabad.
                    </div>
                </div>
            </body>
            </html>
            ";

            $mail->Body = $htmlBody;
            $mail->send();
            return true;
        } catch (MailerException $e) {
            error_log("PHPMailer Sales Error: " . $mail->ErrorInfo);
            return false;
        } catch (\Exception $e) {
            error_log("Sales Email Mailer Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Render beautiful HTML response view for email actions
     */
    private function renderHtmlResponse(Response $response, string $title, string $description, string $badgeType, ?SalesTransaction $transaction = null): Response {
        $badgeClass = 'badge-success';
        $badgeText = 'Approved';
        if ($badgeType === 'danger') {
            $badgeClass = 'badge-danger';
            $badgeText = 'Error';
        } elseif ($badgeType === 'rejected') {
            $badgeClass = 'badge-danger';
            $badgeText = 'Rejected';
        }

        $detailsSnippet = '';
        if ($transaction) {
            $servicesStr = implode(', ', $transaction->services);
            $detailsSnippet = "
            <div class='details-box'>
                <table>
                    <tr><th>Ref ID</th><td>{$transaction->reference_id}</td></tr>
                    <tr><th>Staff</th><td>{$transaction->full_name}</td></tr>
                    <tr><th>Services</th><td>{$servicesStr}</td></tr>
                    <tr><th>Total</th><td><strong>{$transaction->total_amount}</strong></td></tr>
                </table>
            </div>
            ";
        }

        $html = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>{$title} - Kamal Express</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8f7fa; color: #333; margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); text-align: center; max-width: 450px; width: 100%; border: 1px solid #e2e8f0; box-sizing: border-box; }
                .logo { max-height: 50px; margin-bottom: 24px; border-radius: 8px; }
                h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
                p { font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px; }
                .badge { display: inline-block; padding: 8px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
                .badge-success { background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
                .badge-danger { background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
                .details-box { background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 15px; margin-bottom: 24px; text-align: left; }
                .details-box table { width: 100%; border-collapse: collapse; }
                .details-box th, .details-box td { font-size: 12px; padding: 6px 0; }
                .details-box th { color: #64748b; font-weight: 600; text-align: left; width: 30%; }
                .details-box td { color: #1e293b; text-align: right; }
                .btn { display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 13px; transition: background 0.2s; }
                .btn:hover { background: #1e293b; }
            </style>
        </head>
        <body>
            <div class='card'>
                <img src='/logo.jpeg' alt='Kamal Express Logo' class='logo'>
                <br>
                <div class='badge {$badgeClass}'>{$badgeText}</div>
                <h1>{$title}</h1>
                <p>{$description}</p>
                {$detailsSnippet}
                <a href='/' class='btn'>Go to Home Page</a>
            </div>
        </body>
        </html>
        ";

        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html')->withStatus(200);
    }

    /**
     * Standard JSON response helper
     */
    private function jsonResponse(Response $response, array|object $payload, int $status = 200): Response {
        $response->getBody()->write(json_encode($payload));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    /**
     * Helper to verify token signatures and expiration (matches AdminController)
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
