<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Inquiry;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailerException;

class FormController {
    
    /**
     * Handles visa & tour package inquiries
     */
    /**
     * Handles visa & tour package inquiries
     */
    public function inquiry(Request $request, Response $response): Response {
        $data = $request->getParsedBody();
        
        // 1. Honeypot Anti-Spam Check
        if (!empty($data['website'])) {
            // Silently swallow spam submission and return fake success to trick bot
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Thank you for your inquiry. Our agents will contact you shortly.'
            ], 200);
        }

        // 2. Retrieve & Clean IP Address
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ipAddress = $_SERVER['HTTP_CF_CONNECTING_IP'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipAddress = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }
        
        // 3. IP Rate Limiting (max 3 submissions per IP per hour, bypassed on localhost)
        if ($ipAddress !== '127.0.0.1' && $ipAddress !== '::1') {
            try {
                $ipCount = Inquiry::where('ip_address', $ipAddress)
                                  ->where('created_at', '>=', date('Y-m-d H:i:s', time() - 3600))
                                  ->count();
                if ($ipCount >= 3) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'errors' => ['Too many requests. Please try again later.']
                    ], 429);
                }
            } catch (\Exception $e) {
                // Keep going if DB check fails
            }
        }

        // 4. Validation
        $errors = $this->validateFormData($data, ['name', 'email', 'phone', 'serviceType']);
        if (!empty($errors)) {
            return $this->jsonResponse($response, ['success' => false, 'errors' => $errors], 400);
        }
        
        // 5. Generate unique Reference ID
        $year = date('Y');
        $random = rand(1000, 9999);
        $referenceId = "KE-{$year}-{$random}";
        
        // 6. Database persistence via Eloquent
        try {
            $inquiry = Inquiry::create([
                'reference_id' => $referenceId,
                'name'         => htmlspecialchars(trim($data['name'])),
                'email'        => filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL),
                'phone'        => htmlspecialchars(trim($data['phone'])),
                'service_type' => htmlspecialchars(trim($data['serviceType'])),
                'destination'  => htmlspecialchars(trim($data['destination'] ?? 'General Inquiry')),
                'notes'        => htmlspecialchars(trim($data['notes'] ?? 'No special requirements listed.')),
                'status'       => 'Pending',
                'email_sent'   => 0,
                'ip_address'   => $ipAddress
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false, 
                'message' => 'Failed to save inquiry to the database: ' . $e->getMessage()
            ], 500);
        }
        
        // 7. Hourly Email Quota Rate Limit Check (Max 5 sent emails/hour)
        $emailSent = false;
        try {
            $sentInLastHour = Inquiry::where('created_at', '>=', date('Y-m-d H:i:s', time() - 3600))
                                     ->where('email_sent', 1)
                                     ->count();
            if ($sentInLastHour < 5) {
                $emailSent = $this->sendNotificationEmail($inquiry, 'New Booking/Inquiry Ticket');
                if ($emailSent) {
                    $inquiry->email_sent = 1;
                    $inquiry->save();
                }
            } else {
                error_log("PHPMailer: Hourly email quota (5/hr) reached. Notification bypassed.");
            }
        } catch (\Exception $e) {
            error_log("PHPMailer Check Error: " . $e->getMessage());
        }
        
        // 8. Response
        return $this->jsonResponse($response, [
            'success' => true,
            'data'    => [
                'id'           => $inquiry->reference_id,
                'name'         => $inquiry->name,
                'email'        => $inquiry->email,
                'phone'        => $inquiry->phone,
                'serviceType'  => $inquiry->service_type,
                'destination'  => $inquiry->destination,
                'notes'        => $inquiry->notes,
                'date'         => $inquiry->created_at->format('M d, Y'),
                'email_sent'   => $emailSent
            ]
        ], 200);
    }
    
    /**
     * Handles contact page feedback form submissions
     */
    public function contact(Request $request, Response $response): Response {
        $data = $request->getParsedBody();
        
        // 1. Honeypot Anti-Spam Check
        if (!empty($data['website'])) {
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Thank you for contacting us.'
            ], 200);
        }

        // 2. Retrieve & Clean IP Address
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ipAddress = $_SERVER['HTTP_CF_CONNECTING_IP'];
        } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipAddress = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }
        
        // 3. IP Rate Limiting (max 3 submissions per IP per hour, bypassed on localhost)
        if ($ipAddress !== '127.0.0.1' && $ipAddress !== '::1') {
            try {
                $ipCount = Inquiry::where('ip_address', $ipAddress)
                                  ->where('created_at', '>=', date('Y-m-d H:i:s', time() - 3600))
                                  ->count();
                if ($ipCount >= 3) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'errors' => ['Too many requests. Please try again later.']
                    ], 429);
                }
            } catch (\Exception $e) {
                // Keep going if DB check fails
            }
        }

        // 4. Validation
        $errors = $this->validateFormData($data, ['name', 'email', 'phone', 'msg']);
        if (!empty($errors)) {
            return $this->jsonResponse($response, ['success' => false, 'errors' => $errors], 400);
        }
        
        // 5. Generate Reference ID
        $year = date('Y');
        $random = rand(1000, 9999);
        $referenceId = "KE-{$year}-{$random}";
        
        // 6. Database persistence via Eloquent
        try {
            $inquiry = Inquiry::create([
                'reference_id' => $referenceId,
                'name'         => htmlspecialchars(trim($data['name'])),
                'email'        => filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL),
                'phone'        => htmlspecialchars(trim($data['phone'])),
                'service_type' => htmlspecialchars(trim($data['subject'] ?? 'General Inquiry')),
                'destination'  => 'Contact Form Message',
                'notes'        => htmlspecialchars(trim($data['msg'])),
                'status'       => 'Pending',
                'email_sent'   => 0,
                'ip_address'   => $ipAddress
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, [
                'success' => false, 
                'message' => 'Failed to save contact message to the database: ' . $e->getMessage()
            ], 500);
        }
        
        // 7. Hourly Email Quota Rate Limit Check (Max 5 sent emails/hour)
        $emailSent = false;
        try {
            $sentInLastHour = Inquiry::where('created_at', '>=', date('Y-m-d H:i:s', time() - 3600))
                                     ->where('email_sent', 1)
                                     ->count();
            if ($sentInLastHour < 5) {
                $emailSent = $this->sendNotificationEmail($inquiry, 'New General Contact Ticket');
                if ($emailSent) {
                    $inquiry->email_sent = 1;
                    $inquiry->save();
                }
            } else {
                error_log("PHPMailer: Hourly email quota (5/hr) reached. Notification bypassed.");
            }
        } catch (\Exception $e) {
            error_log("PHPMailer Check Error: " . $e->getMessage());
        }
        
        // 8. Response
        return $this->jsonResponse($response, [
            'success' => true,
            'message' => 'Contact form ticket saved successfully.',
            'reference_id' => $inquiry->reference_id,
            'email_sent' => $emailSent
        ], 200);
    }
    
    /**
     * Validates form parameters
     */
    private function validateFormData(?array $data, array $requiredFields): array {
        $errors = [];
        if (!$data) {
            return ['Payload data is empty or invalid JSON.'];
        }
        
        foreach ($requiredFields as $field) {
            if (empty($data[$field]) || !trim($data[$field])) {
                $errors[] = ucfirst($field) . " is a required parameter.";
            }
        }
        
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Enter a valid email address.";
        }
        
        return $errors;
    }
    
    /**
     * Dispatches notification emails via SMTP
     */
    private function sendNotificationEmail(Inquiry $inquiry, string $typeTitle): bool {
        // Bypass if details are placeholder configurations
        if (SMTP_PASS === 'YOUR_SMTP_PASSWORD') {
            error_log("PHPMailer: SMTP credentials are not configured. Email notification skipped.");
            return false;
        }
        
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
            $mail->addAddress(ADMIN_EMAIL);
            $mail->addReplyTo($inquiry->email, $inquiry->name);
            
            // Mail Body
            $mail->isHTML(true);
            $mail->Subject = "{$typeTitle}: {$inquiry->reference_id}";
            
            // Professional HTML Template
            $htmlBody = "
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; }
                    .header { background-color: #0056cc; color: #ffffff; padding: 15px 20px; border-radius: 8px 8px 0 0; font-size: 18px; font-weight: bold; }
                    .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    .details-table th, .details-table td { padding: 12px; text-align: left; border-bottom: 1px solid #edf2f7; }
                    .details-table th { background-color: #f7fafc; font-weight: 600; color: #4a5568; width: 35%; }
                    .notes-box { margin-top: 20px; padding: 15px; background-color: #f7fafc; border-left: 4px solid #0056cc; border-radius: 4px; font-style: italic; }
                    .footer { font-size: 11px; color: #a0aec0; margin-top: 30px; text-align: center; border-t: 1px solid #edf2f7; padding-top: 15px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>Kamal Express - {$typeTitle}</div>
                    <table class='details-table'>
                        <tr><th>Reference ID</th><td><strong>{$inquiry->reference_id}</strong></td></tr>
                        <tr><th>Applicant Name</th><td>{$inquiry->name}</td></tr>
                        <tr><th>Email Address</th><td><a href='mailto:{$inquiry->email}'>{$inquiry->email}</a></td></tr>
                        <tr><th>Phone Number</th><td>{$inquiry->phone}</td></tr>
                        <tr><th>Desired Service</th><td>{$inquiry->service_type}</td></tr>
                        <tr><th>Destination</th><td>{$inquiry->destination}</td></tr>
                        <tr><th>Log Timestamp</th><td>{$inquiry->created_at}</td></tr>
                    </table>
                    <div class='notes-box'>
                        <strong>Applicant Message / Notes:</strong><br>
                        " . nl2br($inquiry->notes) . "
                    </div>
                    <div class='footer'>
                        This message was automatically generated by the web server on behalf of Kamal Express.<br>
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
            error_log("PHPMailer Error: Failed to dispatch email. " . $mail->ErrorInfo);
            return false;
        } catch (\Exception $e) {
            error_log("General Mail Error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Standard JSON response helper
     */
    private function jsonResponse(Response $response, array $payload, int $status = 200): Response {
        $response->getBody()->write(json_encode($payload));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
