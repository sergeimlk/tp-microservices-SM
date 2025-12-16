# TP Microservices - Tuto & Étapes de Réalisation

Ce document détaille les étapes réalisées pour mettre en place l'architecture microservices demandée.

## 1. Architecture

L'application est composée de 3 services :
- **Service Musique** : API REST (Node.js/Express) gérant une liste de musiques.
  - Port interne : 2500
  - Image Docker : `tp-microservices-musique`
- **Service Jeux** : API REST (Node.js/Express) gérant une liste de jeux.
  - Port interne : 3000
  - Image Docker : `tp-microservices-jeux`
- **API Gateway** : Point d'entrée unique (Node.js/Express + http-proxy-middleware).
  - Port exposé : 3002
  - Image Docker : `tp-microservices-gateway`

### À quoi sert l'API Gateway ?

L'API Gateway (Passerelle API) agit comme le **réceptionniste** de notre application.

1.  **Point d'entrée unique** : Au lieu que les utilisateurs connaissent l'adresse de chaque microservice (Musique, Jeux), ils passent tous par une seule adresse (l'accueil).
2.  **Routage** : Elle redirige automatiquement la demande vers le bon service. Si on demande `/musics`, elle transfère au Service Musique.
3.  **Sécurité** : C'est un gardien. Les microservices sont cachés derrière elle dans un réseau privé (Docker) et ne sont pas accessibles directement depuis l'extérieur. Seule la Gateway est visible.
4.  **Simplicité** : Le client ne parle qu'à un seul interlocuteur, sans se soucier de combien de services tournent derrière.

## 2. Configuration des Services

### Service Musique
- Fichier : `service-musique/index.js`
- Port configuré sur **2500**.
- Route principale : `/` (GET) retourne la liste.

### Service Jeux
- Fichier : `service-jeux/index.js`
- Port configuré sur **3000**.
- Routes modifiées pour être à la racine (`/` au lieu de `/api/`) pour simplifier le proxying.

### API Gateway
- Fichier : `gateway/index.js`
- Port : **3002**.
- Proxies configurés :
  - `/musics` -> redirige vers `http://music-service:2500/` (Path Rewrite pour enlever `/musics`)
  - `/games` -> redirige vers `http://game-service:3000/` (Path Rewrite pour enlever `/games`)

## 3. Docker Compose & Sécurité

Fichier : `docker-compose.yml`

- Création d'un réseau interne `app-network`.
- Les services `music-service` et `game-service` sont connectés au réseau mais **n'exposent pas** de ports vers l'hôte (Sécurité).
- Seul le service `gateway` expose le port `3002`.
- Les services sont accessibles uniquement via la Gateway.

## 4. CI / CD (Github Actions)

Fichier : `.github/workflows/docker-vps.yml`

Ce workflow automatise :
1. **Build** des images Docker pour chaque service (Gateway, Musique, Jeux).
2. **Login** sur Docker Hub (nécessite les secrets `DOCKERHUB_USERNAME` et `DOCKERHUB_TOKEN`).
3. **Push** des images sur Docker Hub.
4. **Deploy to VPS** (Job `deploy-to-vps`) :
   - Connexion SSH au VPS (secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`).
   - Récupération des dernières images (`docker compose pull`).
   - Redémarrage des conteneurs (`docker compose up -d`).

## 5. Comment tester

1. Lancer l'environnement :
   ```bash
   docker compose up -d --build
   ```

2. Tester les URLs dans le navigateur :
   - Musiques : [http://localhost:3002/musics/](http://localhost:3002/musics/)
   - Jeux : [http://localhost:3002/games/](http://localhost:3002/games/)

3. Vérifier que les ports directs (2500, 3000) ne sont PAS accessibles depuis l'extérieur.
