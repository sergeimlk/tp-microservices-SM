# Tutoriel : Déployer son projet Docker sur un VPS

Ce guide explique comment déployer votre application microservices sur un serveur VPS (Virtual Private Server) une fois que tout fonctionne en local.

## Prérequis

1.  **Un VPS** (chez OVH, DigitalOcean, Hetzner, etc.) sous Linux (Ubuntu/Debian conseillé).
2.  **Un accès SSH** au VPS (vous avez l'IP, l'utilisateur `root` ou autre, et idéalement une clé SSH configurée).
3.  **Docker & Docker Compose installés sur le VPS**.

---

## Étape 1 : Préparer le VPS

Connectez-vous à votre VPS :
```bash
ssh utilisateur@votre_ip
```

Installez Docker (si ce n'est pas déjà fait) :
```bash
# Installation rapide (script officiel)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

Vérifiez que Docker tourne :
```bash
docker --version
docker compose version
```

---

## Étape 2 : Déploiement Manuel (La méthode simple)

Si vous voulez déployer "vite fait" sans automatisation.

### 1. Copier le fichier de configuration
Le seul fichier "critique" à avoir sur le serveur pour lancer l'application est le `docker-compose.yml`. Les images Docker, elles, seront téléchargées depuis Docker Hub.

Depuis votre ordinateur (pas le VPS), utilisez **SCP** pour envoyer le fichier :
```bash
scp -i ~/.ssh/ma_cle_privee docker-compose.yml utilisateur@votre_ip:/root/
```
*(Remplacez `/root/` par le dossier de votre choix).*

### 2. Lancer l'application
Retournez sur votre VPS (SSH), allez dans le dossier où est le fichier, et lancez :

```bash
docker compose up -d
```

Docker va :
1. Lire le fichier `docker-compose.yml`.
2. Télécharger (pull) les images (`tp-microservices-gateway`, `tp-microservices-musique`, etc.) depuis Docker Hub (assurez-vous qu'elles sont publiques ou que vous êtes logué).
3. Créer le réseau et lancer les conteneurs.

Votre application est en ligne ! 🚀

---

## Étape 3 : Déploiement Auotmatisé (CI/CD)

C'est la méthode que nous avons mise en place avec **GitHub Actions**. L'objectif est que le déploiement se fasse tout seul quand on `git push`.

### Comment ça marche ?

1.  **Code** : Vous modifiez le code et faites un `git push`.
2.  **Build** : GitHub Actions détecte le changement, construit les nouvelles images Docker.
3.  **Push** : Il envoie ces images mises à jour sur le Docker Hub.
4.  **Deploy** : Il se connecte automatiquement à votre VPS (via SSH) et lance les commandes de mise à jour.

### Configuration requise (Déjà faite dans ce TP)

Dans les **Settings > Secrets** de votre repo GitHub, vous deviez ajouter :
*   `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` : Pour que GitHub puisse stocker les images.
*   `VPS_HOST` : L'adresse IP de votre serveur.
*   `VPS_USER` : L'utilisateur (ex: root).
*   `VPS_SSH_KEY` : La clé privée SSH qui permet d'entrer sur le serveur sans mot de passe.

### Le Script final
C'est ce que fait notre fichier `.github/workflows/docker-vps.yml` dans la partie `deploy-to-vps`. Il exécute sensiblement ceci sur le serveur :

```bash
# Se mettre dans le bon dossier
cd ~/mon-projet

# Arrêter les vieux conteneurs, télécharger les frais, et relancer
docker compose pull
docker compose up -d
```

## Identifiants Utiles
- **VPS Host**: `vps115226.serveur-vps.net`
- **VPS User**: `root`
- **VPS Pass**: `Rulu1YMVNTu`
- **Docker Hub**: `sergeimlk`

## Suite
Pour le déploiement automatique assurez-vous de commiter et pusher vos changements sur la branche `main`. La CI/CD se chargera du reste.
