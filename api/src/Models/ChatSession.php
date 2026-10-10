<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model {
    protected $table = 'chat_sessions';

    protected $fillable = [
        'session_id',
        'visitor_name',
        'visitor_phone',
        'visitor_email',
        'detected_service',
        'detected_destination',
        'inquiry_id',
        'status',
        'message_count',
        'ip_address',
        'user_agent'
    ];

    public function messages() {
        return $this->hasMany(ChatMessage::class, 'session_id', 'session_id');
    }

    public function inquiry() {
        return $this->belongsTo(Inquiry::class, 'inquiry_id', 'id');
    }
}
