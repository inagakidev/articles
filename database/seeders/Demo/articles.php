<?php

use Database\Seeders\Demo\DemoDocument as D;

/*
 * Artigos de demonstração (DemoArticlesSeeder). Cada um tem a categoria
 * pelo slug, as tags e o conteúdo montado pelo DemoDocument.
 */

return [
    [
        'title' => 'Como programar com IA sem queimar tokens',
        'category' => 'carreira',
        'tags' => ['ia', 'produtividade', 'llm'],
        'content' => D::make([
            D::p('Assistentes de código cobram por **token**, e quase todo o gasto não está na pergunta que você digita: está em tudo o que vai junto com ela. Entender para onde os tokens vão é o que separa uma conversa barata e certeira de uma que fica cara e ainda responde mal.'),
            D::h2('Para onde os tokens vão'),
            D::p('Um modelo não lembra da conversa. A cada mensagem, o histórico inteiro é enviado de novo: suas perguntas, as respostas e cada arquivo que você colou. Uma conversa longa fica mais cara a cada turno, mesmo quando a pergunta nova é curta.'),
            D::ul([
                '**Entrada:** o histórico, os arquivos e as instruções. Costuma ser a maior parte.',
                '**Saída:** o que o modelo escreve. Custa mais por token, então respostas longas pesam.',
                '**Raciocínio:** em modelos que pensam antes de responder, esse texto também conta.',
            ]),
            D::h2('Mande o contexto certo, não o repositório inteiro'),
            D::p('Colar dez arquivos “para garantir” é o jeito mais comum de desperdiçar. Mande a função que está com problema, a mensagem de erro e o trecho que a chama. Se o modelo precisar de mais, ele pede.'),
            D::code('markdown', <<<'TXT'
## Contexto
Laravel 13, PHP 8.4. A action abaixo é chamada pelo controller de rascunho.

## Problema
`SaveDraft` grava o título com espaços nas pontas.

## Código
(só a classe SaveDraft)

## O que eu quero
Um diff mínimo. Não reescreva a classe.
TXT),
            D::p('Repare na última linha. Pedir ==só o diff== em vez do arquivo inteiro de volta corta a saída em uma fração, e a saída é a parte mais cara.'),
            D::h2('Uma conversa por assunto'),
            D::p('Quando o assunto muda, comece uma conversa nova. O histórico do bug anterior não ajuda na tela nova; ele só ocupa espaço e confunde. Se precisar levar algo adiante, peça um resumo de três linhas e comece do resumo.'),
            D::h2('Escolha o modelo pelo tamanho da tarefa'),
            D::p('Renomear variáveis, escrever um teste simples ou converter um JSON não pede o modelo mais caro. Deixe o modelo maior para decisões de arquitetura e bugs difíceis, e use um menor e mais rápido para o trabalho mecânico.'),
            D::h2('Aproveite o cache de prompt'),
            D::p('Várias APIs guardam em cache o começo repetido de uma requisição, como as instruções fixas e a documentação do projeto. Mantenha esse começo **estável e no topo**, e o que muda (a pergunta) no fim. Trocar uma vírgula nas instruções invalida o cache.'),
            D::table(['Hábito', 'Por que economiza'], [
                ['Mandar só o trecho relevante', 'Menos entrada a cada turno'],
                ['Pedir diff em vez do arquivo', 'Menos saída, que custa mais'],
                ['Uma conversa por assunto', 'O histórico não cresce à toa'],
                ['Modelo menor para tarefas simples', 'Preço por token mais baixo'],
                ['Instruções fixas no topo', 'Aproveita o cache de prompt'],
            ]),
            D::quote('Token barato é o que você não precisou mandar.'),
            D::p('Nenhuma dessas dicas exige ferramenta nova. É só tratar o contexto como um recurso limitado, do jeito que você já trata memória ou consultas ao banco.'),
        ]),
    ],
    [
        'title' => 'Git além do commit: comandos que salvam o seu dia',
        'category' => 'devops',
        'tags' => ['git', 'versionamento'],
        'content' => D::make([
            D::p('A maioria das pessoas usa meia dúzia de comandos do Git e trava quando algo sai do roteiro. Estes são os que resolvem as situações que mais aparecem: o commit errado, a mudança perdida e o bug que ninguém sabe quando entrou.'),
            D::h2('Commitar só uma parte do arquivo'),
            D::p('Mexeu em duas coisas no mesmo arquivo e quer dois commits? O `add -p` mostra cada trecho alterado e pergunta se ele entra.'),
            D::code('bash', <<<'TXT'
git add -p resources/js/pages/articles/edit.tsx
# y = adiciona o trecho, n = pula, s = divide em trechos menores
TXT),
            D::h2('Consertar o último commit'),
            D::p('Esqueceu um arquivo ou errou a mensagem? Se o commit ainda não foi enviado, emende.'),
            D::code('bash', <<<'TXT'
git add tests/Feature/EditorTest.php
git commit --amend --no-edit
TXT),
            D::p('Para consertar um commit mais antigo, marque a correção como `fixup` e deixe o rebase juntar tudo no lugar certo:'),
            D::code('bash', <<<'TXT'
git commit --fixup=a1b2c3d
git rebase -i --autosquash main
TXT),
            D::h2('Recuperar o que parecia perdido'),
            D::p('Deu `reset --hard` no lugar errado? O Git guarda por onde o `HEAD` passou, mesmo o que não está em branch nenhuma. O `reflog` é a rede de segurança.'),
            D::code('bash', <<<'TXT'
git reflog
# e3f4a5b HEAD@{2}: commit: feat(editor): cria o salvamento automático
git switch -c resgate e3f4a5b
TXT),
            D::h2('Achar o commit que quebrou'),
            D::p('Sabe que funcionava há duas semanas e hoje não funciona? O `bisect` faz uma busca binária no histórico: você só responde se cada versão está boa ou ruim.'),
            D::code('bash', <<<'TXT'
git bisect start
git bisect bad
git bisect good v1.4.0
# o Git troca de versão; teste e responda:
git bisect good   # ou: git bisect bad
git bisect reset  # ao terminar
TXT),
            D::p('Com um script de teste, ele faz tudo sozinho: `git bisect run php artisan test --filter=Editor`.'),
            D::h2('Duas branches abertas ao mesmo tempo'),
            D::p('Precisa revisar um PR sem largar o que está fazendo? Em vez de `stash` e troca de branch, abra uma segunda pasta ligada ao mesmo repositório.'),
            D::code('bash', <<<'TXT'
git worktree add ../revisao feat/categorias
cd ../revisao
# ...
git worktree remove ../revisao
TXT),
            D::table(['Situação', 'Comando'], [
                ['Commitar parte de um arquivo', '`git add -p`'],
                ['Corrigir o último commit', '`git commit --amend`'],
                ['Corrigir um commit antigo', '`git commit --fixup` + `rebase --autosquash`'],
                ['Recuperar um commit sumido', '`git reflog`'],
                ['Achar quando o bug entrou', '`git bisect`'],
                ['Trabalhar em duas branches', '`git worktree`'],
            ]),
            D::quote('Reescreva o histórico à vontade na sua branch, e nunca no que outras pessoas já baixaram.'),
        ]),
    ],
    [
        'title' => 'Arquitetura modular: organize o código pelo domínio',
        'category' => 'back-end',
        'tags' => ['arquitetura', 'laravel', 'boas-praticas'],
        'content' => D::make([
            D::p('Num projeto novo, separar por tipo de arquivo parece natural: todos os controllers juntos, todos os models juntos. Com o tempo, mudar uma funcionalidade exige abrir seis pastas, e ninguém sabe dizer o que depende do quê. A arquitetura modular inverte o critério: o código fica junto pelo **assunto** de que trata.'),
            D::h2('Por camada ou por domínio'),
            D::code('bash', <<<'TXT'
# Por camada                 # Por domínio
app/                          app/Domain/
  Http/Controllers/             Articles/
  Models/                         Actions/
  Services/                       Enums/
  Jobs/                           Rules/
                                Taxonomy/
                                  Actions/
                                  Rules/
TXT),
            D::p('Na versão por domínio, tudo o que trata de artigos está em `Articles`. Quem entra no projeto descobre o que o sistema faz só de olhar as pastas.'),
            D::h2('O que é um módulo'),
            D::p('Um módulo é um pedaço do sistema com uma responsabilidade clara e uma fronteira explícita. Ele tem:'),
            D::ul([
                '**Regras próprias**, que não dependem de framework nem de banco.',
                '**Ações** que os outros módulos chamam, como `SaveDraft` ou `MergeTags`.',
                '**Detalhes internos** que ninguém de fora deveria conhecer.',
            ]),
            D::h2('Uma ação, uma responsabilidade'),
            D::p('Em vez de um `ArticleService` com quarenta métodos, cada operação do domínio vira uma classe pequena, fácil de achar e de testar.'),
            D::code('php', <<<'PHP'
final class StartDraft
{
    public function handle(Article $article): ArticleVersion
    {
        return DB::transaction(function () use ($article) {
            $article->lockForUpdate();

            return $article->draft()
                ?? $this->copyFrom($article->latestEditableVersion());
        });
    }
}
PHP),
            D::p('O controller só recebe a requisição, chama a ação e devolve a resposta. A regra de negócio não sabe que existe HTTP.'),
            D::h2('Dependências numa direção só'),
            D::p('O ponto que mais importa não é a pasta, é a direção das dependências. `Articles` pode usar `Taxonomy` para resolver tags, mas `Taxonomy` não sabe que artigos existem. Quando dois módulos precisam um do outro, geralmente falta um terceiro, ou a fronteira está no lugar errado.'),
            D::quote('Se mudar o módulo A obriga a mudar o B, eles não são dois módulos: são um só, mal dividido.'),
            D::h2('Quando não vale a pena'),
            D::p('Um CRUD de cinco telas não precisa de domínio, ações e regras. A modularidade paga o próprio custo quando o sistema tem **regras que mudam** e **mais de uma pessoa** mexendo nele. Comece simples e extraia o módulo quando a dor aparecer, não antes.'),
            D::h3('Checklist rápido'),
            D::ol([
                'Dá para explicar o que o módulo faz em uma frase?',
                'As regras dele rodam num teste sem banco nem HTTP?',
                'Ele depende de poucos outros módulos, e nunca em círculo?',
                'Mudar um detalhe interno não quebra quem está de fora?',
            ]),
        ]),
    ],
    [
        'title' => 'Introdução ao Laravel: do zero à primeira página',
        'category' => 'back-end',
        'tags' => ['laravel', 'php', 'iniciantes'],
        'content' => D::make([
            D::p('O Laravel é o framework PHP mais usado hoje, e não por acaso: ele resolve de saída o que toda aplicação web precisa (rotas, banco, autenticação, filas, e-mails) com uma sintaxe que dá vontade de ler. Neste guia, você sai do zero e chega a uma página que lista dados do banco.'),
            D::h2('Criando o projeto'),
            D::p('Você precisa do PHP 8.3 ou mais novo e do Composer. Com o instalador do Laravel, um comando cria tudo:'),
            D::code('bash', <<<'TXT'
composer global require laravel/installer
laravel new meu-blog
cd meu-blog
composer run dev
TXT),
            D::p('Abra `http://localhost:8000` e a página inicial do Laravel aparece.'),
            D::h2('Onde fica cada coisa'),
            D::table(['Pasta', 'O que guarda'], [
                ['`routes/`', 'As URLs da aplicação e quem responde a cada uma'],
                ['`app/Http/Controllers/`', 'As classes que recebem a requisição'],
                ['`app/Models/`', 'Os models do Eloquent, um por tabela'],
                ['`database/migrations/`', 'A estrutura do banco, versionada'],
                ['`resources/views/`', 'Os templates Blade'],
            ]),
            D::h2('A primeira rota'),
            D::code('php', <<<'PHP'
// routes/web.php
use Illuminate\Support\Facades\Route;

Route::get('/ola/{nome}', function (string $nome) {
    return "Olá, {$nome}!";
});
PHP),
            D::p('Acesse `/ola/maria` e pronto. O trecho entre chaves vira parâmetro da função.'),
            D::h2('Banco de dados com migrations e Eloquent'),
            D::p('Uma migration descreve uma tabela em PHP. O Artisan cria o model e a migration juntos:'),
            D::code('bash', 'php artisan make:model Post -m'),
            D::code('php', <<<'PHP'
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->text('body');
    $table->timestamps();
});
PHP),
            D::p('Rode `php artisan migrate` e a tabela existe. Com o Eloquent, cada linha vira um objeto: `Post::latest()->get()` traz os posts do mais novo para o mais antigo, sem escrever SQL.'),
            D::h2('Controller e view'),
            D::code('php', <<<'PHP'
class PostController extends Controller
{
    public function index()
    {
        return view('posts.index', [
            'posts' => Post::latest()->get(),
        ]);
    }
}
PHP),
            D::code('blade', <<<'BLADE'
{{-- resources/views/posts/index.blade.php --}}
@foreach ($posts as $post)
    <h2>{{ $post->title }}</h2>
    <p>{{ $post->body }}</p>
@endforeach
BLADE),
            D::p('O `{{ }}` do Blade já escapa o HTML, então um título com `<script>` aparece como texto, e não roda.'),
            D::h2('Próximos passos'),
            D::ul([
                'Validação de formulários com *Form Requests*.',
                'Autenticação pronta com os *starter kits*.',
                'Filas para tarefas demoradas, como enviar e-mails.',
                'Testes automatizados com o Pest, que já vem instalado.',
            ]),
            D::p('A [documentação oficial](https://laravel.com/docs) é uma das melhores que existem, e vale ler de ponta a ponta.'),
        ]),
    ],
    [
        'title' => 'Curiosidades do PHP que pouca gente conhece',
        'category' => 'back-end',
        'tags' => ['php', 'curiosidades'],
        'content' => D::make([
            D::p('O PHP roda boa parte da web há quase trinta anos e carrega histórias e comportamentos que surpreendem até quem trabalha com ele todo dia. Separei algumas das melhores.'),
            D::h2('O nome mudou de significado'),
            D::p('Em 1995, Rasmus Lerdorf publicou um conjunto de scripts chamado **Personal Home Page Tools**. Quando a linguagem foi reescrita, o nome virou um acrônimo recursivo: *PHP: Hypertext Preprocessor*, em que a primeira letra da sigla é a própria sigla.'),
            D::h2('O PHP 6 nunca existiu'),
            D::p('A versão 6 tentou trazer suporte nativo a Unicode e foi abandonada depois de anos de trabalho. Muitos livros e artigos já falavam em “PHP 6”, então a versão seguinte pulou direto para o **PHP 7**, para não confundir ninguém.'),
            D::h2('Strings também são incrementadas'),
            D::p('O operador `++` funciona em strings e segue a lógica de uma planilha:'),
            D::code('php', <<<'PHP'
$coluna = 'z';
$coluna++;
echo $coluna; // "aa"

$versao = 'A9';
$versao++;
echo $versao; // "B0"
PHP),
            D::p('Desde o PHP 8.3 existe `str_increment()`, que faz o mesmo de forma explícita, e o incremento de strings fora desse padrão passou a gerar aviso.'),
            D::h2('Comparações que mudaram no PHP 8'),
            D::p('Antes do PHP 8, comparar um número com uma string não numérica convertia a string para número. Por isso `0 == "abc"` era **verdadeiro**. O PHP 8 inverteu a regra: agora o número vira string, e a comparação dá falso.'),
            D::code('php', <<<'PHP'
var_dump(0 == "abc");  // PHP 7: true · PHP 8: false
var_dump("1" == "01"); // true nos dois: strings numéricas
var_dump(0 === "0");   // false: tipos diferentes
PHP),
            D::quote('Na dúvida, use === e poupe o seu eu do futuro.'),
            D::h2('O match não perdoa'),
            D::p('O `match`, do PHP 8, parece um `switch` mais curto, mas tem três diferenças que evitam bugs:'),
            D::ol([
                'Compara com `===`, sem conversão de tipo.',
                'Devolve um valor, então pode ser atribuído direto.',
                'Lança `UnhandledMatchError` se nenhum caso bater, em vez de seguir em silêncio.',
            ]),
            D::code('php', <<<'PHP'
$rotulo = match ($status) {
    'draft' => 'Rascunho',
    'pending' => 'Em revisão',
    'approved' => 'Publicado',
};
PHP),
            D::h2('Um operador para cada preguiça'),
            D::table(['Operador', 'Exemplo', 'Desde'], [
                ['Nave espacial', '`$a <=> $b` devolve -1, 0 ou 1', 'PHP 7.0'],
                ['Coalescência nula', '`$nome ?? \'anônimo\'`', 'PHP 7.0'],
                ['Atribuição com coalescência', '`$config[\'cor\'] ??= \'azul\'`', 'PHP 7.4'],
                ['Nullsafe', '`$user?->profile?->bio`', 'PHP 8.0'],
            ]),
            D::h2('O mascote é um elefante azul'),
            D::p('O **elePHPant** foi desenhado por Vincent Pontier em 2007, a partir das letras do logo: o “P”, o “H” e o “P”, de lado, lembram um elefante. Hoje ele existe como pelúcia em várias cores e virou item de colecionador nas conferências.'),
        ]),
    ],
    [
        'title' => 'Testes no Laravel com Pest: um guia prático',
        'category' => 'testes',
        'tags' => ['pest', 'testes', 'laravel'],
        'content' => D::make([
            D::p('O Pest é um framework de testes para PHP construído sobre o PHPUnit, com uma sintaxe enxuta que lembra o Jest. Ele já vem nos projetos Laravel novos, e escrever um teste passa a levar menos tempo do que pensar se vale a pena escrevê-lo.'),
            D::h2('Instalando'),
            D::p('Em um projeto que ainda usa só o PHPUnit:'),
            D::code('bash', <<<'TXT'
composer require pestphp/pest --dev --with-all-dependencies
./vendor/bin/pest --init
TXT),
            D::h2('O primeiro teste'),
            D::p('Um teste é uma função com uma descrição. As verificações usam `expect()`, que se lê quase como uma frase.'),
            D::code('php', <<<'PHP'
test('o tempo de leitura arredonda para cima', function () {
    $minutos = ReadingTime::for(words: 450);

    expect($minutos)->toBe(3);
});
PHP),
            D::h2('Testando uma página de ponta a ponta'),
            D::p('Os testes de funcionalidade fazem requisições de verdade à aplicação, com banco de testes. Os helpers do Laravel estão todos disponíveis.'),
            D::code('php', <<<'PHP'
test('só quem escreveu edita o artigo', function () {
    $artigo = Article::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('articles.edit', $artigo))
        ->assertForbidden();
});
PHP),
            D::p('Para começar cada teste com o banco limpo, ligue o `RefreshDatabase` uma vez só, no `tests/Pest.php`:'),
            D::code('php', <<<'PHP'
pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');
PHP),
            D::h2('Datasets: um teste, vários casos'),
            D::p('Em vez de copiar o mesmo teste para cada entrada, passe os casos num *dataset*. Cada um aparece com o nome no relatório.'),
            D::code('php', <<<'PHP'
test('recusa rascunho fora dos limites', function (array $dados, string $campo) {
    $this->putJson(route('articles.draft.update', $this->artigo), $dados)
        ->assertJsonValidationErrors($campo);
})->with([
    'título longo' => [['title' => str_repeat('a', 151)], 'title'],
    'idioma desconhecido' => [['language' => 'es'], 'language'],
]);
PHP),
            D::h2('Testes de arquitetura'),
            D::p('O Pest também testa regras do código, e não só comportamento. Um teste de arquitetura impede, por exemplo, que alguém esqueça um `dd()` ou que o domínio passe a depender de controllers.'),
            D::code('php', <<<'PHP'
arch()->preset()->laravel();

arch('o domínio não conhece HTTP')
    ->expect('App\Domain')
    ->not->toUse('App\Http');
PHP),
            D::h2('Rodando'),
            D::table(['Comando', 'O que faz'], [
                ['`php artisan test`', 'Roda tudo'],
                ['`php artisan test --filter=editor`', 'Só os testes com “editor” no nome'],
                ['`php artisan test --parallel`', 'Divide os testes entre processos'],
                ['`php artisan test --coverage`', 'Mostra a cobertura (precisa do Xdebug ou PCOV)'],
            ]),
            D::quote('Teste o comportamento que a pessoa usuária vê, não o detalhe interno que você pode querer mudar amanhã.'),
            D::p('Comece pelos fluxos que mais doem quando quebram: login, pagamento, publicação. Um teste por bug corrigido já cria, em pouco tempo, uma rede de segurança que deixa mudar o código sem medo.'),
        ]),
    ],
];
