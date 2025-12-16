# DRK Tuto : Déployer une Fullstack App (React/Next + Postgres) sur VPS avec Docker & CI/CD

Ce tutoriel est conçu pour un développeur junior. Il décrit la méthode "tout-terrain" pour déployer n'importe quel projet (comme *Gymart*) sur un VPS vierge en moins de 30 minutes, en évitant toutes les galères que nous avons rencontrées.

---

## 🚀 Le Concept (En 3 points)

1.  **Docker** : On emballe ton Front, ton Back et ta Base de Données dans des boîtes (conteneurs).
2.  **Docker Hub** : On stocke ces boîtes dans le cloud (comme un Google Drive pour applis).
3.  **VPS (Serveur)** : Un ordinateur allumé 24/24 qui télécharge ces boîtes et les lance.
4.  **GitHub Actions** : Le robot qui fait tout ça automatiquement quand tu `git push`.

---

## 🛠️ Phase 1 : Préparer ton projet Local

Ton projet doit avoir une structure propre.

### 1. Dockerfile pour chaque service
Chaque API ou Front doit avoir son fichier `Dockerfile` à la racine de son dossier.

**Exemple pour le Front (React/Vite) :**
```dockerfile
# Dockerfile Front
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npm", "run", "preview", "--", "--host", "--port", "80"]
```

**Exemple pour le Back (Node/Next) :**
```dockerfile
# Dockerfile Back
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Le Docker Compose (Le Chef d'orchestre)
Crée un fichier `docker-compose.yml` à la racine de tout le projet. C'est lui qui lie tout ensemble (Front + Back + DB).

```yaml
version: '3.8'
services:
  # Ton Frontend
  front:
    build: ./frontend-folder
    ports:
      - "80:80"

  # Ton Backend
  api:
    build: ./backend-folder
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PASS=monSuperMotDePasse

  # Ta Base de Données
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: monSuperMotDePasse
      POSTGRES_DB: gymart
    volumes:
      - pgdata:/var/lib/postgresql/data # Pour ne pas perdre les données !

volumes:
  pgdata:
```

---

## ☁️ Phase 2 : Préparer le VPS

Tu as reçu ton IP, ton User (root) et ton Password.

1.  **Connecte-toi en SSH :**
    ```bash
    ssh root@ton_ip
    ```
    *(Entre le mot de passe, rien ne s'affichera, c'est normal).*

2.  **Installe Docker (Une seule commande suffit) :**
    ```bash
    curl -fsSL https://get.docker.com | sh
    ```

3.  **C'est tout.** Ne t'embête pas à installer Node, Git, ou Postgres sur le serveur. Docker gère tout.

---

## 🤖 Phase 3 : L'Automatisation (GitHub Actions)

C'est là que la magie opère. On veut éviter de copier des fichiers manuellement.

### 1. Crée les Tokens
Sur **Docker Hub** :
- Crée un compte.
- Profil > Account Settings > Security > **New Access Token**. (Copie-le !)

Sur **GitHub** (Ton Repo) :
- Settings > Secrets and variables > Actions > **New Repository Secret**.
- Ajoute les 5 secrets suivants :
    - `DOCKERHUB_USERNAME` : Ton pseudo.
    - `DOCKERHUB_TOKEN` : Le token que tu viens de créer.
    - `VPS_HOST` : L'IP de ton serveur.
    - `VPS_USER` : `root`
    - `VPS_PASSWORD` : Le mot de passe du serveur.

### 2. Le Fichier Workflow
Crée le fichier `.github/workflows/deploy.yml` dans ton projet.

**⚠️ L'Astuce Pro (Pour éviter les erreurs "Context not found")** :
Ne demande pas au serveur de *builder* ton app. Builder prend de la CPU et nécessite le code source.
On va dire à GitHub de **Builder** les images, les envoyer sur le Hub, et au serveur de juste **Télécharger** les images prêtes.

Voici le template PARFAIT :

```yaml
name: Deploy Gymart

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Se connecter à Docker Hub
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # 2. Construire et Envoyer l'image FRONT
      - name: Build & Push Front
        uses: docker/build-push-action@v5
        with:
          context: ./frontend-folder
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/gymart-front:latest

      # 3. Construire et Envoyer l'image BACK
      - name: Build & Push Back
        uses: docker/build-push-action@v5
        with:
          context: ./backend-folder
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/gymart-back:latest

      # 4. Déployer sur le VPS via SSH
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          password: ${{ secrets.VPS_PASSWORD }}
          ##########################################################
          # C'est ICI que tout se joue : On recrée le docker-compose
          # sur le serveur, mais avec les images en ligne !
          ##########################################################
          script: |
            cat <<EOF > /root/docker-compose.yml
            version: '3.8'
            services:
              front:
                image: ${{ secrets.DOCKERHUB_USERNAME }}/gymart-front:latest
                ports:
                  - "80:80"
                restart: always
              
              api:
                image: ${{ secrets.DOCKERHUB_USERNAME }}/gymart-back:latest
                ports:
                  - "3000:3000"
                restart: always
                environment:
                  - DB_HOST=db
                  - DB_PASS=monSuperMotDePasse

              db:
                image: postgres:15
                restart: always
                environment:
                  POSTGRES_USER: user
                  POSTGRES_PASSWORD: monSuperMotDePasse
                  POSTGRES_DB: gymart
                volumes:
                  - pgdata:/var/lib/postgresql/data

            volumes:
              pgdata:
            EOF

            # On met à jour et on relance
            docker compose pull
            docker compose up -d --force-recreate
```

---

## ✅ Résumé pour être efficace

1.  **Local** : Assure-toi que chaque dossier a son `Dockerfile`.
2.  **GitHub** : Remplis les 5 Secrets.
3.  **Code** : Copie le workflow ci-dessus (en adaptant les noms de dossiers).
4.  **Push** : `git push origin main`.

Si tu fais ça, tu n'auras jamais de problème de version, de fichier manquant ou de permission. Le VPS reçoit juste l'ordre de lancer les cubes Lego® que GitHub a préparés pour lui.
