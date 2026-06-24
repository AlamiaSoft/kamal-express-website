<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Destination extends Model {
    protected $table = 'destinations';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'image',
        'visa_type',
        'processing_time',
        'stay_duration',
        'validity',
        'price',
        'required_documents',
        'faqs',
        'meta_title',
        'meta_description',
        'meta_keywords'
    ];

    protected $casts = [
        'required_documents' => 'array',
        'faqs' => 'array'
    ];
}
