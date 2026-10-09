# SchoolAttend — gestion scolaire

Application Next.js pour gérer les élèves, les professeurs, les classes, les présences par QR Code et les documents scolaires.

## Prérequis

- Node.js LTS et npm
- Un projet Supabase

## Lancer l'application

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000.

## Préparer Supabase

1. Créez un projet dans [Supabase](https://supabase.com/).
2. Dans le projet, ouvrez **SQL Editor** et exécutez le fichier `supabase/migrations/20261010000000_initial_schema.sql`.
3. Dans **Project Settings → API**, copiez l'URL du projet et la clé publique (publishable/anon).
4. À la racine du dépôt, copiez `.env.example` vers `.env.local` et remplissez les valeurs :

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

5. Redémarrez le serveur Next.js après avoir modifié les variables d'environnement.

**Sécurité :** n'ajoutez jamais une clé `service_role` ou une clé secrète dans une variable `NEXT_PUBLIC_*`, dans le navigateur ou dans Git. La clé publique est conçue pour être utilisée avec les politiques RLS du schéma.

## Rôles et accès

- Les nouveaux comptes authentifiés reçoivent le rôle `teacher` par défaut.
- Pour promouvoir le premier administrateur, créez son utilisateur dans Supabase Authentication, puis exécutez cette requête SQL en remplaçant l'adresse :

  ```sql
  update public.profiles
  set role = 'admin'
  where id = (
    select id from auth.users
    where email = 'admin@votre-ecole.ma'
    limit 1
  );
  ```

- Le schéma active Row Level Security (RLS). Les enseignants peuvent consulter les classes et élèves et enregistrer les présences; la gestion des élèves, classes, professeurs et documents est réservée à l'administrateur.

## État actuel et migration des données

Le schéma Supabase et les politiques RLS sont préparés dans `supabase/migrations/`. **Les pages actuelles utilisent encore `localStorage` : elles ne sont pas encore connectées à Supabase.** Ne supprimez pas les données du navigateur et ne considérez pas le déploiement comme prêt pour une utilisation réelle avant la migration des pages, l'import des données existantes et les tests des permissions.

Les données enregistrées dans `localStorage` ne sont pas automatiquement transférées vers Supabase. Il faudra effectuer cette migration explicitement avant le basculement.

## Vérifications

```bash
npm run lint
npm run build
```
