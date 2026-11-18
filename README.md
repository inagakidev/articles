# Plataforma de Artigos

Publicação e leitura de artigos técnicos para a comunidade He4rt e para devs em geral. Visão do produto em [PRODUCT.md](PRODUCT.md).

## Documentação

- [PRODUCT.md](PRODUCT.md): visão, usuários e princípios do produto
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md): requisitos funcionais, perfis, estados, fluxos e escopo do MVP
- [docs/DECISIONS.md](docs/DECISIONS.md): decisões de produto e de arquitetura
- [docs/ROADMAP.md](docs/ROADMAP.md): fases e tarefas
- [docs/DESIGN.md](docs/DESIGN.md): design system, paleta do editor e uso do mascote
- [design/mascote/](design/mascote/): kit do mascote, guia de identidade e scripts
- [CONTRIBUTING.md](CONTRIBUTING.md): padrão de mensagens de commit
- [AGENTS.md](AGENTS.md): diretrizes de engenharia e processo de desenvolvimento

## Stack

PHP 8.4, Laravel 13, React 19 com TypeScript, Inertia.js, Tailwind CSS 4, MariaDB, Pest e Vitest (via Vite+).

## Rodando localmente

Requisitos: PHP 8.4 com `pdo_mysql`, Composer, Node 24 e MariaDB 11.

1. Crie os bancos e o usuário da aplicação (troque `SENHA` por uma senha local):

    ```sql
    CREATE DATABASE articles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE articles_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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

3. Instale as dependências, gere a chave, rode as migrations e compile o frontend:

    ```bash
    composer setup
    ```

4. Suba o servidor, a fila, os logs e o Vite:

    ```bash
    composer dev
    ```

    A aplicação fica em http://localhost:8000.

## Testes e verificações

| Comando                 | O que faz                                                         |
| ----------------------- | ----------------------------------------------------------------- |
| `php artisan test`      | Testes Pest (usam o banco `articles_testing`)                     |
| `npm test`              | Testes Vitest dos componentes React                               |
| `npm run test:contrast` | Lista o contraste de cada par de cores dos tokens, nos dois temas |
| `npm run types:check`   | Checagem de tipos TypeScript                                      |
| `npm run check`         | Formatação e lint do frontend                                     |
| `composer test`         | Pint, PHPStan e Pest                                              |
| `composer ci:check`     | Todas as verificações acima                                       |

Testes de frontend ficam ao lado do componente, com o sufixo `.test.tsx`.
