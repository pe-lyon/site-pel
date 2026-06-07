# Parlement des Étudiants de Lyon (PEL)

Plateforme web institutionnelle pour simuler le fonctionnement d'une assemblée parlementaire estudiantine.

---

## Fonctionnalités

- **Authentification sécurisée** — email/mot de passe via Supabase Auth
- **Hémicycle interactif** — vue en demi-cercle, sièges par groupe, temps réel
- **Propositions de loi** — cycle complet de dépôt à adoption/rejet
- **Scrutins en temps réel** — votes POUR/CONTRE/ABSTENTION, résultats masqués aux parlementaires
- **Procurations** — un titulaire peut voter pour un absent (2 voix)
- **Groupes politiques** — création, modification, suppression par le président
- **Gestion complète** — parlementaires, rôles, groupes, résultats détaillés
- **Journal d'audit** — toutes les actions sont enregistrées

---

## Stack technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/BDD** : Supabase (Auth + PostgreSQL + Realtime)
- **Déploiement** : Vercel

---

## Installation locale

### 1. Prérequis

- Node.js 18+
- Un projet Supabase (créé sur [supabase.com](https://supabase.com))

### 2. Cloner et installer

```bash
cd "site pel"
npm install
```

### 3. Configurer les variables d'environnement

Renommer `.env.example` en `.env.local` et remplir les valeurs :

```bash
cp .env.example .env.local
```

Éditer `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
```

> Ces clés se trouvent dans votre projet Supabase → Settings → API

### 4. Initialiser la base de données Supabase

Dans l'éditeur SQL de votre projet Supabase, exécuter **dans l'ordre** :

1. `supabase/schema.sql` — crée toutes les tables, triggers, RLS
2. `supabase/seed.sql` — données de démonstration (optionnel)

### 5. Créer le premier compte (Président de séance)

Dans Supabase → Authentication → Users → "Invite user" ou "Add user" :
- Créer un compte avec l'email du président
- Puis dans l'éditeur SQL, mettre à jour son rôle :

```sql
UPDATE profiles
SET role = 'president_seance'
WHERE email = 'votre@email.fr';
```

### 6. Lancer en développement

```bash
npm run dev
```

Accéder à [http://localhost:3000](http://localhost:3000)

---

## Déploiement sur Vercel

### Méthode 1 : Interface Vercel (recommandée)

1. Pusher le projet sur GitHub
2. Aller sur [vercel.com](https://vercel.com) → "New Project"
3. Importer le repository
4. Dans "Environment Variables", ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Cliquer "Deploy"

### Méthode 2 : CLI Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Suivre les instructions et ajouter les variables d'environnement.

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `president_seance` | Tout — gestion complète, résultats détaillés |
| `president_groupe` | Vote + gestion de son groupe |
| `parlementaire` | Vote + consultation |
| `ministre` | Vote + consultation |

---

## Structure du projet

```
site-pel/
├── app/
│   ├── (auth)/              # Pages publiques (login, reset)
│   ├── (dashboard)/         # Pages parlementaires
│   │   ├── dashboard/       # Tableau de bord
│   │   ├── hemicycle/       # Vue hémicycle
│   │   ├── propositions/    # Propositions de loi
│   │   ├── scrutin/[id]/    # Page de vote
│   │   └── profil/          # Profil utilisateur
│   ├── administration/      # Pages réservées au président
│   │   ├── parlementaires/  # Gestion des comptes
│   │   ├── groupes/         # Groupes politiques
│   │   ├── propositions/    # Gestion des propositions
│   │   ├── scrutins/        # Gestion des scrutins
│   │   ├── procurations/    # Gestion des procurations
│   │   ├── resultats/       # Résultats détaillés
│   │   └── audit/           # Journal d'audit
│   └── api/admin/           # Routes API (service role)
├── components/
│   ├── layout/              # Sidebar, TopBar
│   ├── hemicycle/           # Composant hémicycle SVG
│   └── vote/                # Panneau de vote temps réel
├── lib/supabase/            # Clients Supabase (browser/server)
├── types/                   # Types TypeScript
└── supabase/
    ├── schema.sql            # Schéma complet + RLS
    └── seed.sql              # Données de démonstration
```

---

## Variables d'environnement requises

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (côté serveur uniquement) | Supabase → Settings → API |

> ⚠️ Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client. Elle est utilisée uniquement dans les routes API serveur.

---

## Sécurité

- **RLS (Row Level Security)** activé sur toutes les tables
- Les résultats de votes ne sont visibles que par le président de séance
- La clé service role n'est jamais exposée au navigateur
- Toutes les actions sensibles sont journalisées dans `audit_logs`
- Les procurations respectent la règle : 1 procuration max par personne

---

## Support

Pour toute question ou problème, contacter l'équipe technique du PEL.
# site-pel
