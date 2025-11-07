# Project Management SaaS Application

Une application complète de gestion de projet type Jira construite avec Next.js 15, Prisma, et MySQL.

## 🚀 Fonctionnalités

- **Authentification** : Email/mot de passe et Google OAuth avec Auth.js
- **Gestion d'organisations** : Créer et gérer plusieurs organisations
- **Gestion de projets** : Créer des projets avec des membres d'équipe
- **Sprints** : Planifier et gérer des sprints avec dates de début/fin
- **Tâches** : Créer et assigner des tâches avec priorités, labels, et pièces jointes
- **Tableau Kanban** : Glisser-déposer des tâches entre les colonnes
- **Vues multiples** : Kanban, Liste, Calendrier, et Gantt
- **Commentaires** : Ajouter des commentaires avec éditeur de texte riche
- **Notifications** : Notifications en temps réel pour les activités
- **Labels** : Organiser les tâches avec des labels personnalisés
- **Rapports** : Visualiser les progrès avec des graphiques
- **Multilingue** : Support Français et Anglais
- **Mode sombre** : Interface claire et sombre

## 📋 Prérequis

- Node.js 18+ installé
- MySQL 8+ installé et en cours d'exécution
- npm ou yarn

## ⚙️ Installation

### 1. Cloner le projet

Si vous avez téléchargé le ZIP, décompressez-le. Sinon :

\`\`\`bash
git clone <votre-repo>
cd project-management-app
\`\`\`

### 2. Installer les dépendances

\`\`\`bash
npm install
\`\`\`

### 3. Configurer la base de données MySQL

Créez une base de données MySQL :

\`\`\`sql
CREATE DATABASE project_management;
\`\`\`

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

\`\`\`env
# Database
DATABASE_URL="mysql://root:votre_mot_de_passe@localhost:3306/project_management"

# Auth.js
AUTH_SECRET="votre-secret-tres-securise-genere-avec-openssl"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID="votre-google-client-id"
GOOGLE_CLIENT_SECRET="votre-google-client-secret"

# UploadThing (optionnel - pour les pièces jointes)
UPLOADTHING_SECRET="votre-uploadthing-secret"
UPLOADTHING_APP_ID="votre-uploadthing-app-id"

# Pusher (optionnel - pour les notifications temps réel)
PUSHER_APP_ID="votre-pusher-app-id"
PUSHER_KEY="votre-pusher-key"
PUSHER_SECRET="votre-pusher-secret"
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY="votre-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
\`\`\`

Pour générer `AUTH_SECRET` :

\`\`\`bash
openssl rand -base64 32
\`\`\`

### 5. Générer Prisma Client et créer la base de données

\`\`\`bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Ajouter des données de test
npx prisma db seed
\`\`\`

### 6. Lancer l'application

\`\`\`bash
npm run dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🗄️ Structure du projet

\`\`\`
project-management-app/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── auth/              # Pages d'authentification
│   ├── dashboard/         # Pages du tableau de bord
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── auth/             # Composants d'authentification
│   ├── dashboard/        # Composants du tableau de bord
│   ├── kanban/           # Composants du tableau Kanban
│   ├── tasks/            # Composants de tâches
│   └── ui/               # Composants UI (shadcn)
├── lib/                   # Utilitaires et configurations
│   ├── prisma.ts         # Client Prisma
│   └── auth.ts           # Configuration Auth.js
├── prisma/                # Configuration Prisma
│   ├── schema.prisma     # Schéma de base de données
│   └── seed.ts           # Script de seed
├── public/                # Fichiers statiques
└── messages/              # Fichiers de traduction i18n
\`\`\`

## 📊 Schéma de base de données

Le schéma Prisma inclut les modèles suivants :

- **User** : Utilisateurs de l'application
- **Organization** : Organisations/entreprises
- **Project** : Projets dans une organisation
- **Sprint** : Sprints dans un projet
- **Task** : Tâches dans un sprint ou projet
- **Label** : Labels pour organiser les tâches
- **Comment** : Commentaires sur les tâches
- **Attachment** : Pièces jointes des tâches
- **Notification** : Notifications utilisateur
- **ActivityLog** : Journal d'activité

## 🔐 Authentification

L'application utilise Auth.js (NextAuth v5) avec :

- Authentification par email/mot de passe avec bcrypt
- Google OAuth (configurable)
- Sessions JWT
- Middleware de protection des routes

## 🛠️ Technologies utilisées

- **Framework** : Next.js 15 (App Router)
- **Base de données** : MySQL avec Prisma ORM
- **Authentification** : Auth.js (NextAuth v5)
- **UI** : Tailwind CSS + shadcn/ui
- **Drag & Drop** : dnd-kit
- **Graphiques** : Recharts
- **Éditeur** : Tiptap
- **Formulaires** : React Hook Form + Zod
- **État** : Zustand + React Query
- **i18n** : next-intl

## 📝 Scripts disponibles

\`\`\`bash
npm run dev          # Lancer le serveur de développement
npm run build        # Construire pour la production
npm run start        # Lancer le serveur de production
npm run lint         # Vérifier le code avec ESLint
npm run test         # Lancer les tests avec Vitest
npm run test:e2e     # Lancer les tests E2E avec Playwright
\`\`\`

## 🐳 Docker (optionnel)

Un fichier `docker-compose.yml` est inclus pour lancer MySQL avec Docker :

\`\`\`bash
docker-compose up -d
\`\`\`

## 📚 Documentation additionnelle

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT
