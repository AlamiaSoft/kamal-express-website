<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model {
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'inquiries';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'reference_id',
        'name',
        'email',
        'phone',
        'service_type',
        'destination',
        'notes',
        'admin_notes',
        'status',
        'email_sent',
        'ip_address'
    ];
}
