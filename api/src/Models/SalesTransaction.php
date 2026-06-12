<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesTransaction extends Model {
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sales_transactions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'reference_id',
        'full_name',
        'date',
        'serial_number',
        'services',
        'vendor_name',
        'country',
        'sector',
        'total_amount',
        'received_amount',
        'remaining_amount',
        'collectors_name',
        'status',
        'approval_token',
        'ip_address'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'services' => 'array',
        'date' => 'date'
    ];
}
