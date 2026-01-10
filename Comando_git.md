# Guia de Operações Git e Deploy

Este guia cobre os comandos essenciais para versionar seu projeto e enviar atualizações para a VPS.

## 1. Configuração Inicial (Uma vez por projeto)

Se você já fez isso, pule para a seção 2.

```powershell
# 1. Configurar quem você é
git config --global user.email "seu_email@gmail.com"
git config --global user.name "Seu Nome"

# 2. Iniciar o repositório
git init
git branch -M main

# 3. Conectar ao GitHub (Use seu TOKEN aqui)
git remote add origin https://SEU_USUARIO:SEU_TOKEN@github.com/Dgsantos220/Search.Hub.git
```

---

## 2. Salvar e Enviar Atualizações (Rotina Diária)

Sempre que você editar arquivos no seu PC local e quiser salvar ou enviar para a VPS:

```powershell
# 1. Ver o que mudou (Opcional, mas útil)
git status

# 2. Adicionar TODOS os arquivos modificados
git add .

# 3. Salvar as mudanças com uma mensagem (Commit)
git commit -m "Descreva aqui o que você fez"
# Exemplo: git commit -m "Corrigi o bug do checkout"

# 4. Enviar para o GitHub
git push origin main
```

---

## 3. Baixar Atualizações na VPS (Deploy)

Quando você quiser que a VPS pegue as novidades que você enviou:

### Acesso à VPS
Conecte-se via SSH:
`ssh root@IP_DA_SUA_VPS`

### Primeira vez na VPS (Instalação)
```bash
# Clone o projeto
git clone https://github.com/Dgsantos220/Search.Hub.git /var/www/painel

# Entre na pasta
cd /var/www/painel

# Instalar dependências
composer install --no-dev --optimize-autoloader
npm install
npm run build

# Configurar e migrar banco
cp .env.example .env
nano .env # (Edite com seus dados de banco e produção)
php artisan key:generate
php artisan migrate --force
```

### Atualizações Recorrentes (Rotina na VPS)
Sempre que você der `git push` no seu PC, rode isso na VPS:

```bash
cd /var/www/painel

# Baixar novidades
git pull origin main

# Se você mudou algo no banco de dados, rode as migrações
php artisan migrate --force

# Se você mudou algo no Frontend (React/CSS)
npm run build

# Limpar caches (para garantir que a config nova pegue)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Reiniciar filas (se usar filas)
php artisan queue:restart
```

---

## Dicas Rápidas
- **Esqueceu de adicionar algo?** Rode `git add .` novamente e `git commit --amend` para editar o último commit.
- **Deu erro de conflito no pull?** `git stash` guarda suas mudanças locais temporariamente, `git pull` baixa tudo, e `git stash pop` aplica suas mudanças de volta.
