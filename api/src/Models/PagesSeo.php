<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagesSeo extends Model {
    protected $table = 'pages_seo';

    protected $fillable = [
        'route_path',
        'meta_title',
        'meta_description',
        'meta_keywords'
    ];
}
