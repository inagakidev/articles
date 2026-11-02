<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response {
        $articles = Article::all();

        return Inertia::render('Articles/Index', [
            'articles' => $articles,
        ]);
    }
}
