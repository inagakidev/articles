# Script de deploy do Ploi (D78). Cole no campo "Deploy script" do site no
# Ploi; as variáveis entre chaves são do próprio Ploi. Com o "zero downtime
# deployment" ligado, cada deploy monta uma pasta nova e só troca no fim.
cd {SITE_DIRECTORY}
git pull origin {BRANCH}

# Dependências de produção do PHP
{SITE_COMPOSER} install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Frontend: o build gera as rotas do Wayfinder, então roda depois do composer
npm ci
npm run build

# Banco, caches de configuração, rotas, views e eventos
{SITE_PHP} artisan migrate --force
{SITE_PHP} artisan optimize

# O worker guarda o código antigo na memória: reinicia para pegar o novo
{SITE_PHP} artisan queue:restart

echo "" | sudo -S service {SITE_PHP_VERSION}-fpm reload

echo "Deploy concluído"
