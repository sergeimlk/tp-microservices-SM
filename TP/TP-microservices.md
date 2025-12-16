# TP Microservices

## Objectif

Découvrir les fondamentaux des microservices et leur lien fort avec Docker.
On peut dire que Docker est un outil incontournable pour la mise en place de microservices ou que les microservices sont nés avec Docker.
C'est un peu l'oeuf avant la poule ou la poule avant l'oeuf.

## Prérequis

- Avoir suivi le cours sur Docker
- Savoir créer une API simple avec Express.js

## Rappels Docker

Qu'est-ce qu'une image Docker ?
Qu'est-ce qu'un conteneur Docker ?
A quoi sert Docker Compose ?

## TP - Microservices

Créer un dossier `tp-microservices` et un sous-dossier `api-musique`.
Créer une API simple qui permet de gérer des musiques (CRUD pour lister, ajouter, supprimer, modifier des musiques).
Pas besoin de base de données, on peut stocker les musiques en mémoire.
Mettre cette API en ligne avec Render de manière automatisée.
Dans un dossier `api-jeux`, créer une API simple qui permet de gérer des jeux de société.

Choisissez des ports différents pour chaque API, par exemple :
- API Musique : 2500
- API Jeux : 300

Créer un Dockerfile pour chaque point d'API.
Créer un fichier `docker-compose.yml` à la racine du dossier `tp-microservices` pour lancer les deux APIs en même temps.

Nous venons de créer deux APIs qui sont indépendantes l'une de l'autre. Elles peuvent être lancées séparément ou ensemble.
Nous sommes donc dans une architecture de microservices.

Dans une architecture en microservices il y a souvent besoin de rajouter une API Gateway pour gérer les requêtes entrantes et les rediriger vers les bonnes APIs.
Cela permet de centraliser les requêtes et de simplifier la communication entre les différents microservices ainsi que de gérer la sécurité, la mise en cache, les autorisations, etc...

## TP - API Gateway

Créer un dossier `api-gateway` dans le dossier `tp-microservices`.
Créer une API Gateway avec Express.js qui permet de rediriger les requêtes vers les APIs Musique et Jeux.

Pour cela, nous allons utiliser le module `http-proxy-middleware` pour rediriger les requêtes vers les bonnes APIs.
Installer le module avec la commande suivante :
```bash
npm install http-proxy-middleware
```
Créer un fichier `index.js` dans le dossier `api-gateway` et y mettre en place la redirection des requêtes vers les APIs Musique et Jeux.

Suivre le code exemple de la documentation du module `http-proxy-middleware` pour mettre en place la redirection des requêtes.

Créer un Dockerfile pour l'API Gateway.
Rajouter les configurations nécessaires dans le fichier `docker-compose.yml` pour lancer l'API Gateway en même temps que les deux APIs.

Il y a t il besoin de créer un réseau Docker pour que les deux APIs et l'API Gateway puissent communiquer entre elles ?

Testez votre API Gateway en lançant des requêtes sur les endpoints des APIs Musique et Jeux via les API directement et via l'API Gateway.

## Sécurité

En réalité dans une architecture en microservices, seul l'API Gateway est exposée à l'extérieur. Les autres APIs sont cachées derrière l'API Gateway.

On doit donc trouver un moyen de sécuriser les APIs Musique et Jeux pour qu'elles ne soient pas accessibles directement depuis l'extérieur. Seul l'API Gateway doit pouvoir y accéder et être accessible depuis l'extérieur.

On ne parlera pas d'authentification et d'autorisation dans ce TP, mais on va mettre en place une sécurité simple pour que les APIs Musique et Jeux ne soient pas accessibles directement depuis l'extérieur.

Pour cela :
- Enlever les ports dans le fichier `docker-compose.yml` des APIs Musique et Jeux. NB : Conserver la notion de port pour l'API Gateway.
- N'autoriser que l'API Gateway à accéder aux APIs Musique et Jeux en utilisant le réseau Docker : 0.0.0.0
```js
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Musique running on port ${PORT}`);
});
```

Testez à nouveau votre application complète en confirmant que seul l'API Gateway est accessible depuis l'extérieur et que les APIs Musique et Jeux ne le sont pas.

## CI / CD Docker

Pour reprendre un TP précédent, on va mettre en place une CI/CD pour une de nos API. Choisissez l'API Musique ou l'API Jeux.

NB : Render ne permet toujours pas de déployer des applications type docker-compose, donc on va se contenter de déployer une seule API.

Créer une github action (fichier `.github/workflows/docker.yml`) qui va :
- créer une image Docker taggée au format `nom-utilisateur/nom-repo-docker-hub`
- se loger sur Docker Hub
- pousser l'image sur Docker Hub

Puis nous allons déployer l'API sur Render en utilisant l'image Docker que nous avons poussée sur Docker Hub.
- Créer un nouveau service sur Render
- Choisir l'option "Docker"
- Choisir l'image Docker que nous avons poussée sur Docker Hub
- Choisir le mode gratuit avec hébergement sur serveur européen (Francfurt)
- Tester le service

Sur quel port est accessible l'API ?
Comment Render a-t-il fait et comment a-t-il deviné le port exposé de l'API ?

Attention depuis notre dernier TP, Render n'écoute plus les changements d'images Docker sur Docker Hub, il faut maintenant utiliser un webhook pour déclencher le déploiement automatique de l'API.

Dans la configuration du service sur Render, trouvez l'URL du webhook et copiez-la.
Créer un nouveau déploiement dans votre dépôt DockerHub en ajoutant une requête pour récupérer un seul élément dans l'API choisie.
Puis, collez l'URL du webhook dans votre navigateur. Il s'agit d'une requête GET sur l'URL du webhook.
Validez que le déploiement a bien été effectué.

Rajoutez cette étape dans votre fichier `.github/workflows/docker.yml` pour que le déploiement se fasse automatiquement à chaque fois que vous poussez une nouvelle image Docker sur Docker Hub.
Testez le fonctionnement de ce dernier.