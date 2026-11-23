<?php

namespace App\Support\Editor;

/**
 * O que um artigo pode conter (RF-066 a RF-069, D51, D80). O editor do
 * frontend só oferece isto, e o servidor descarta o resto ao salvar.
 */
final class EditorSchema
{
    /** Paleta do editor (DESIGN §2.11): o artigo guarda o nome, nunca o valor. */
    public const COLORS = ['lavanda', 'rosa', 'amarelo', 'menta', 'azul', 'pessego'];

    /** Alinhamentos permitidos (RF-069); justificado não entra. */
    public const ALIGNMENTS = ['left', 'center', 'right'];

    /** Níveis de título dentro do texto; o nível 1 é o título do artigo. */
    public const HEADING_LEVELS = [2, 3];

    /** Linguagens dos blocos de código, coloridas no servidor (D80). */
    public const CODE_LANGUAGES = [
        'bash', 'blade', 'c', 'cpp', 'csharp', 'css', 'diff', 'dockerfile', 'dotenv',
        'go', 'graphql', 'html', 'http', 'ini', 'java', 'javascript', 'json', 'jsx',
        'kotlin', 'markdown', 'nginx', 'php', 'python', 'ruby', 'rust', 'scss', 'sql',
        'svelte', 'swift', 'terraform', 'toml', 'tsx', 'twig', 'typescript', 'vue',
        'xml', 'yaml',
    ];

    /** Nós e os atributos que cada um aceita. */
    public const NODES = [
        'doc' => [],
        'paragraph' => ['textAlign'],
        'heading' => ['level', 'textAlign'],
        'text' => [],
        'hardBreak' => [],
        'bulletList' => [],
        'orderedList' => ['start'],
        'listItem' => [],
        'blockquote' => [],
        'codeBlock' => ['language'],
        'horizontalRule' => [],
        'image' => ['id', 'alt', 'caption', 'decorative'],
        'table' => [],
        'tableRow' => [],
        'tableHeader' => ['colspan', 'rowspan'],
        'tableCell' => ['colspan', 'rowspan'],
    ];

    /** Marcas de texto; sublinhado não existe (RF-066). */
    public const MARKS = ['bold', 'italic', 'code', 'link', 'textColor', 'highlight'];

    /** Imagens no texto de uma versão (RF-080); a capa não conta. */
    public const MAX_IMAGES = 5;

    /** Texto alternativo e legenda de imagem. */
    public const IMAGE_TEXT_MAX = 250;

    /** Conteúdo: até 50.000 caracteres (RF-078). */
    public const MAX_CHARACTERS = 50_000;

    /** Palavras lidas por minuto, para o tempo de leitura (RF-096). */
    public const WORDS_PER_MINUTE = 200;
}
