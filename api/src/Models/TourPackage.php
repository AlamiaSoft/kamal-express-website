<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourPackage extends Model {
    protected $table = 'tour_packages';
    
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'location',
        'duration',
        'price',
        'category',
        'image',
        'description',
        'highlights',
        'itinerary',
        'included',
        'excluded'
    ];

    protected $casts = [
        'highlights' => 'array',
        'itinerary' => 'array',
        'included' => 'array',
        'excluded' => 'array'
    ];
}
