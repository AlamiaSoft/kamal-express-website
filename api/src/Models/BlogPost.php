<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model {
    protected $table = 'blogs';

    protected $fillable = [
        'slug',
        'title',
        'category',
        'summary',
        'content',
        'image',
        'date',
        'author'
    ];
}
