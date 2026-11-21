# he4rt ink

Publicação e leitura de artigos técnicos para a comunidade He4rt e para devs em geral. Visão do produto em [PRODUCT.md](PRODUCT.md).

## Documentação

- [PRODUCT.md](PRODUCT.md): visão, usuários e princípios do produto
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md): requisitos funcionais, perfis, estados, fluxos e escopo do MVP
- [docs/DECISIONS.md](docs/DECISIONS.md): decisões de produto e de arquitetura
- [docs/DATABASE.md](docs/DATABASE.md): tabelas do domínio e convenções de modelagem
- [docs/ROADMAP.md](docs/ROADMAP.md): fases e tarefas
- [docs/DESIGN.md](docs/DESIGN.md): design system, paleta do editor e uso do mascote
- [design/mascote/](design/mascote/): guia de identidade do mascote e script que gera as ilustrações
- [design/logo/](design/logo/): script que gera as variações da logo e os ícones do navegador
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): organização e convenções do código
- [CONTRIBUTING.md](CONTRIBUTING.md): padrão de mensagens de commit
- [AGENTS.md](AGENTS.md): diretrizes de engenharia e processo de desenvolvimento

## Stack

PHP 8.4, Laravel 13, React 19 com TypeScript, Inertia.js, Tailwind CSS 4, MariaDB, Pest e Vitest (via Vite+).

## Rodando localmente

Requisitos: PHP 8.4 com `pdo_mysql`, Composer, Node 24, MariaDB 11 e, para ver os e-mails, Docker.

1. Crie os bancos e o usuário da aplicação (troque `SENHA` por uma senha local):

    ```sql
    CREATE DATABASE articles CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
    CREATE DATABASE articles_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
    CREATE USER 'articles'@'localhost' IDENTIFIED BY 'SENHA';
    CREATE USER 'articles'@'127.0.0.1' IDENTIFIED BY 'SENHA';
    GRANT ALL PRIVILEGES ON articles.* TO 'articles'@'localhost';
    GRANT ALL PRIVILEGES ON articles_testing.* TO 'articles'@'localhost';
    GRANT ALL PRIVILEGES ON articles.* TO 'articles'@'127.0.0.1';
    GRANT ALL PRIVILEGES ON articles_testing.* TO 'articles'@'127.0.0.1';
    ```

2. Copie o ambiente e preencha `DB_PASSWORD` com a senha do passo 1:

    ```bash
    cp .env.example .env
    ```

3. Instale as dependências, gere a chave, rode as migrations e compile o frontend (depois, instale o navegador dos testes com `npx playwright install chromium`; no Linux Mint, que o Playwright não reconhece, use `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=debian13-x64 npx playwright install chromium`):

    ```bash
    composer setup
    ```

4. Suba a caixa de entrada de teste (Mailpit). Todo e-mail enviado pela aplicação aparece em http://localhost:8025, e nada sai da máquina:

    ```bash
    docker compose up -d mailpit
    ```

    Sem Docker, troque `MAIL_MAILER=smtp` por `MAIL_MAILER=log` no `.env`; os e-mails vão para `storage/logs/laravel.log`. Para conferir o envio com a configuração atual, sem passar pela fila: `php artisan mail:test voce@exemplo.dev`.

5. Suba o servidor, a fila, o agendador, os logs e o Vite:

    ```bash
    composer dev
    ```

    A aplicação fica em http://localhost:8000. Depois de mudar o `.env`, reinicie o `composer dev`: a fila e o agendador guardam a configuração de quando subiram.

6. As fotos de perfil ficam em `storage/app/media`, fora da pasta pública, e saem pela rota `/media`. Em produção, troque para o Cloudflare R2 com `MEDIA_DISK=r2` e as variáveis `R2_*` do `.env.example` (D53).

7. Crie a administradora da instalação (só uma no MVP). O comando pede nome, username e senha; com o e-mail de uma conta que já existe, ele a promove:

    ```bash
    php artisan admin:create voce@exemplo.dev
    ```

    No primeiro acesso a http://localhost:8000/admin, o painel pede a ativação do 2FA e mostra os códigos de recuperação. Se ela perder o aparelho e os códigos, o último recurso é rodar no servidor `php artisan admin:reset-2fa`, que apaga o 2FA e encerra as sessões dela.

## Testes e verificações

| Comando                 | O que faz                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| `php artisan test`      | Testes Pest, incluindo os de navegador com axe em `tests/Browser` (usam o banco `articles_testing`) |
| `npm test`              | Testes Vitest dos componentes React                                                                 |
| `npm run test:contrast` | Lista o contraste de cada par de cores dos tokens, nos dois temas                                   |
| `npm run types:check`   | Checagem de tipos TypeScript                                                                        |
| `npm run check`         | Formatação e lint do frontend                                                                       |
| `composer test`         | Pint, PHPStan e Pest                                                                                |
| `composer ci:check`     | Todas as verificações acima                                                                         |

Testes de frontend ficam ao lado do componente, com o sufixo `.test.tsx`.
