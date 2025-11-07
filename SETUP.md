# 📋 Guide d'installation - Projet de Gestion (Jira Clone)

## Prérequis

- Node.js 18+ installé
- MySQL installé et en cours d'exécution
- npm ou yarn

## 🚀 Installation rapide

### 1. Cloner et installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 2. Configurer MySQL

Créez une base de données MySQL :

\`\`\`sql
CREATE DATABASE project_management;
\`\`\`

### 3. Configurer les variables d'environnement

Le fichier `.env.local` est déjà créé avec les valeurs par défaut. **Modifiez-le** selon votre configuration MySQL :

\`\`\`env
DATABASE_URL="mysql://root:votremotdepasse@localhost:3306/project_management"
\`\`\`

Changez :
- `root` par votre nom d'utilisateur MySQL
- `votremotdepasse` par votre mot de passe MySQL
- `project_management` par le nom de votre base de données

### 4. Générer le client Prisma

\`\`\`bash
npx prisma generate
\`\`\`

### 5. Créer les tables dans la base de données

\`\`\`bash
npx prisma db push
\`\`\`

### 6. (Optionnel) Ajouter des données de test

\`\`\`bash
npx prisma db seed
\`\`\`

### 7. Lancer l'application

\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📊 Fonctionnalités principales

- ✅ Authentification (Email/Password + Google OAuth)
- ✅ Gestion des organisations
- ✅ Gestion des projets
- ✅ Sprints et planification
- ✅ Tableau Kanban avec drag & drop
- ✅ Vue calendrier
- ✅ Diagramme de Gantt
- ✅ Gestion des tâches avec priorités
- ✅ Commentaires et pièces jointes
- ✅ Labels personnalisables
- ✅ Notifications en temps réel
- ✅ Gestion d'équipe avec rôles (OWNER, ADMIN, MEMBER)
- ✅ Recherche avancée
- ✅ Rapports et statistiques
- ✅ Mode sombre/clair
- ✅ Support multilingue (FR/EN)

## 🔧 Commandes utiles

\`\`\`bash
# Lancer en développement
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start

# Réinitialiser la base de données
npx prisma migrate reset

# Ouvrir Prisma Studio (interface graphique pour la DB)
npx prisma studio
\`\`\`

## 🌐 Comptes de test (après seed)

- **Email**: admin@example.com
- **Mot de passe**: password123

## 📝 Notes importantes

1. **NEXTAUTH_SECRET** : Générez une clé secrète sécurisée pour la production :
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`

2. **Google OAuth** : Pour activer la connexion Google, créez des credentials sur [Google Cloud Console](https://console.cloud.google.com/)

3. **UploadThing** : Pour les uploads de fichiers, créez un compte sur [UploadThing](https://uploadthing.com/)

4. **Pusher** : Pour les notifications en temps réel, créez un compte sur [Pusher](https://pusher.com/)

## 🐛 Résolution de problèmes

### Erreur "PrismaClient is not configured"
\`\`\`bash
npx prisma generate
\`\`\`

### Erreur de connexion MySQL
- Vérifiez que MySQL est démarré
- Vérifiez vos credentials dans `.env.local`
- Vérifiez que la base de données existe

### Port 3000 déjà utilisé
\`\`\`bash
# Utiliser un autre port
PORT=3001 npm run dev
\`\`\`

## 📚 Stack technique

- **Framework**: Next.js 15 (App Router)
- **Base de données**: MySQL avec Prisma ORM
- **Authentification**: Auth.js (NextAuth v5)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **État**: Zustand + React Query
- **Drag & Drop**: dnd-kit
- **Éditeur**: Tiptap
- **Calendrier**: FullCalendar
- **Charts**: Recharts
- **Tests**: Vitest + Playwright
