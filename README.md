# SOS MG
Portal público e painel restrito para **Gestão de Abrigos e Acesso à Informação** em crises de chuvas e enchentes.

Stack principal:
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + Postgres serverless (Neon/Supabase)
- NextAuth (Credentials: email + senha)
- Leaflet + OpenStreetMap (com clusters)

## Funcionalidades
- Portal público sem login:
  - Busca por nome, bairro e cidade
  - Filtros por cidade, status, pets, acessibilidade e necessidades urgentes
  - Lista de abrigos, mapa interativo e página de detalhes
  - Página "Como ajudar" com itens urgentes agregados do banco
- Painel restrito com login:
  - Roles: `ADMIN` e `OPERATOR`
  - CRUD de abrigos com validações fortes
  - Gestão de necessidades (itens, prioridade, quantidade, status)
  - Auditoria simples (`AuditLog`) em alterações

## Requisitos
- Node.js 20+
- NPM 10+
- Banco Postgres (Neon ou Supabase)

## Configuração local
1. Instale as dependências:
```bash
npm install
```

2. Crie o arquivo `.env`:
```bash
cp .env.example .env
```
No Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

3. Preencha as variáveis no `.env`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="chave-longa-segura"
NEXTAUTH_URL="http://localhost:3000"
```

4. Rode migrations:
```bash
npm run prisma:migrate -- --name init
```

5. Rode seed:
```bash
npm run prisma:seed
```
O seed limpa os dados, cria usuários de acesso e cadastra abrigos com fonte oficial pública.

6. Inicie o projeto:
```bash
npm run dev
```

Abra `http://localhost:3000`.

## Usuários de seed
- Admin:
  - email: `admin@sosjf.local`
  - senha: `Admin@123`
- Operador:
  - email: `operador@sosjf.local`
  - senha: `Operador@123`

## Fonte oficial dos abrigos do seed
- Prefeitura de Juiz de Fora (Defesa Civil):
  - https://www.pjf.mg.gov.br/noticias/view.php?modo=link2&idnoticia2=88482
- Referência usada no seed:
  - atualização publicada em 26/02/2026 às 19h
  - coordenadas do mapa aproximadas via OpenStreetMap/Nominatim

## Scripts
- `npm run dev`: ambiente local
- `npm run build`: build de produção
- `npm run start`: executar build
- `npm run lint`: lint
- `npm run prisma:migrate`: migration com Prisma
- `npm run prisma:seed`: seed inicial

## Deploy na Vercel Free
1. Suba o projeto para GitHub.
2. Na Vercel, importe o repositório.
3. Configure variáveis de ambiente:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL pública da Vercel)
4. Configure banco Postgres serverless (Neon/Supabase).
5. Execute migration no banco de produção:
```bash
npx prisma migrate deploy
```
6. Opcional: rode seed em produção se necessário:
```bash
npm run prisma:seed
```

## Estrutura principal
- `app/`: rotas públicas, painel e API Route Handlers
- `components/`: UI pública, mapa e formulários do painel
- `lib/`: autenticação, permissões, validações, queries e utilidades
- `prisma/`: schema, migrations e seed

## Segurança e LGPD
- Coleta mínima de dados (sem CPF)
- Contato público opcional
- Controle de acesso por role
- Logs básicos de alteração em `AuditLog`
