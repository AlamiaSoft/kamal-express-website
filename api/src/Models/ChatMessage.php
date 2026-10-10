<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model {
    protected $table = 'chat_messages';

    // Disable updated_at since individual chat messages are append-only
    const UPDATED_AT = null;

    protected $fillable = [
        'session_id',
        'role',
        'content',
        'agent_name'
    ];

    public function session() {
        return $this->belongsTo(ChatSession::class, 'session_id', 'session_id');
    }
}
