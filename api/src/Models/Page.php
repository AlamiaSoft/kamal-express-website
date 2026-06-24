<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model {
    protected $table = 'pages';

    protected $fillable = [
        'route_path',
        'content',
        'meta_title',
        'meta_description',
        'meta_keywords'
    ];

    protected $casts = [
        'content' => 'array'
    ];
}
