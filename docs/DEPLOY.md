# Deploy em produção

Hospedagem decidida na D78: um VPS da Vultr em São Paulo, gerenciado pelo
Ploi, com MariaDB no próprio servidor e imagens no Cloudflare R2. Este
passo a passo cobre a p8-02 e a p8-04; o backup (p8-05) e a validação
(p8-06) têm as próprias tarefas.

> **Bloqueio:** o provedor de e-mail ainda não foi escolhido (p8-01, D71).
> Sem ele, ninguém confirma a conta nem recupera a senha. Escolha o provedor
> antes de abrir o site ao público.

## 1. Servidor

1. Na Vultr, crie um servidor **Cloud Compute**, região **São Paulo**, com
   pelo menos **2 GB de RAM** (PHP, MariaDB e o worker no mesmo servidor).
   Confira no painel o preço da região, que tem acréscimo.
2. No Ploi, conecte a conta da Vultr (ou adicione o servidor pelo IP) e crie
   um servidor do tipo **server** com:
    - PHP **8.4**, com as extensões `gd` (com WebP), `exif`, `intl`,
      `mbstring`, `pdo_mysql`, `bcmath`, `curl`, `xml` e `zip`;
    - **MariaDB**;
    - Node.js 22 ou mais novo (para o build do frontend).

## 2. Site

1. Crie o site com o domínio definitivo e ligue o **SSL** (Let's Encrypt).
2. Conecte o repositório do GitHub, branch `main`.
3. Ligue o **zero downtime deployment**.
4. Em **Deploy script**, cole o conteúdo de [`deploy/ploi-deploy.sh`](../deploy/ploi-deploy.sh).

## 3. Banco

1. Em **Databases**, crie o banco e um usuário só para ele. O banco só aceita
   conexões locais (p8-03).
2. A configuração do MariaDB fica em `/etc/mysql/mariadb.conf.d/`. A busca
   pode precisar de `innodb_ft_min_token_size` menor (D54); isso é decidido
   na p5-04.

## 4. Ambiente

1. Em **Environment**, preencha o `.env` a partir de
   [`.env.production.example`](../.env.production.example). Os segredos
   ficam só ali, nunca no repositório.
2. Gere a chave no servidor: `php artisan key:generate --show` e cole em
   `APP_KEY`.
3. No Cloudflare, crie o bucket **privado** de imagens e um token R2 com
   acesso só a esse bucket (D53); preencha as variáveis `R2_*`.
4. Se o domínio passar pelo proxy do Cloudflare, avise: a aplicação precisa
   confiar no proxy para saber o IP real e o https.

## 5. Fila e agendador

1. Em **Queue**, crie um worker: conexão `database`, fila `default`,
   `--tries=3 --max-time=3600`. O deploy reinicia o worker sozinho.
2. Em **Scheduler**, adicione `php artisan schedule:run` a cada minuto. Ele
   apaga as contas não confirmadas, as trocas de e-mail vencidas e os
   registros antigos.

## 6. Primeiro deploy

1. Clique em **Deploy**.
2. Pelo terminal do Ploi (SSH), crie a administradora:
   `php artisan admin:create voce@exemplo.dev`.
3. Entre em `/admin`, ative o 2FA e guarde os códigos de recuperação.
4. Faça um segundo deploy para conferir que ele se repete sem ajustes
   (p8-04).
