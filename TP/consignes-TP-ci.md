# Découverte de la CI / CD

## Définitions

### CI (Continuous Integration)

La CI est une pratique de développement logiciel qui consiste à fusionner régulièrement les modifications de code dans un référentiel partagé. Chaque fusion déclenche une série de tests automatisés pour vérifier si les modifications n'ont pas introduit de régressions.

### CD (Continuous Delivery)

La CD est une pratique de développement logiciel qui consiste à automatiser le déploiement de chaque modification de code validée dans un environnement de production.

## Objectifs du TP

Rendre accessible une application web via une URL publique en utilisant les services de CI / CD de Github + Render.

### Prérequis

- Un compte Github
- le projet du TP découverte de Docker (TODO app)

### Étapes

1. Créer un workflow pour github actions qui build notre application et la publie sur Render
.github/workflows/build.yml

```yaml
name: Build Toto

on:
  push:
    branches:
      - "main"

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Build Docker image
        run: |
          docker login -u ${{ secrets.DOCKERHUB_USERNAME }} -p ${{ secrets.DOCKERHUB_TOKEN }}
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/app .
```
2. Récupérer un token sur dockerhub
3. rajouter les clés d'accès à DockerHub dans les secrets de notre repository
4. Relancer un workflow à la mano
5. push l'image sur DockerHub
```yaml
  docker push ${{ secrets.DOCKERHUB_USERNAME }}/app
```
6. Vérifier que l'image est bien ajoutée
7. pull l'image sur notre machine est la lancer sur le port 83
8. Créer un compte sur Render avec notre compte Github
9. Créer un nouveau service sur Render
10. Valider le fonctionnement
11. réaliser un nouveau push en modifier le title de la page
12. Automatiser le déploiement sur Render
```yaml
- name: Trigger Render Deployment
  run: |
    curl -X POST ##################################
```