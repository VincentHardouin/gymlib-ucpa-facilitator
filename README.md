# Gymlib UCPA Facilitator

Ce projet a pour but d'automatiser et simplifier les réservations via [Gymlib](https://gymlib.com/) à l'[UCPA](https://www.ucpa.com/sport-station/paris-19), en minimisant les étapes manuelles.

Voici les différentes étapes pour pouvoir préparer correctement sa venue :

![Les différentes étapes de réservation](./docs/étapes-reservation.png)

Sur ce schéma, on peut voir des tâches sans valeur ajoutée comme remplir le formulaire de contremarque et les deux temps d'attentes de validation.

Pour ces différentes raisons, j'ai automatisé les étapes facilement automatisables jusqu'à la réservation et après la réservation.
Ce qui me permet d'avoir juste à faire une demande de code sur Gymlib, et choisir mon créneau horaire sur le site de l'UCPA.
L'après-réservation est transparente pour moi, car je n'ai rien à faire pour avoir les réservations dans mon calendrier,
et j'ai le QRCode sous la main à mon arrivée.

## Plus en détail

Dans le code, les différentes étapes sont lancées par un CRON et sont découpées de cette manière :

### 1. Vérifier qu'une nouvelle réservation a été demandée sur Gymlib

Le code analyse les e-mails reçus en provenance de Gymlib grâce au paquet [`imapflow`](https://www.npmjs.com/package/imapflow)
et récupère le code de contremarque dans le contenu dans le mail préalablement parsé par [`mailparser`](https://www.npmjs.com/package/mailparser).

### 2. Remplir le formulaire de contremarque UCPA

Le formulaire ayant un token CSRF, le plus rapide à mettre en place a été de faire remplir le formulaire en utilisant [Puppeteer](https://pptr.dev/),
presque tous les champs du formulaire peuvent être remplis dynamiquement grâce à la variable d'environnement : `FORM_RESPONSE`.
D'ailleurs, en phase de tests, vous pouvez désactiver l'envoi du formulaire grâce à la variable d'environnement `FORM_SUBMIT_ENABLED=false`.

### 3. Recevoir une notification dès que l'UCPA a validé les informations avec des créneaux arrangeants qui sont disponibles

Même principe que pour la première étape, le code détecte un e-mail en provenance de l'UCPA pour valider la contremarque
et dire que l'e-billet est disponible sur votre espace personnel. Ensuite, le code cherche les créneaux qui vous arrangent, pour cela, il se base sur la variable d'environnement :

```dotenv
TIME_SLOTS_PREFERENCES='{
    "sun": [
        "17h00",
    ],
    "mon": [
        "19h00",
        "20h00"
    ],
}'
```

Cette variable d'environnement n'a pas besoin d'avoir tous les jours de la semaine renseignée.

### 4. Créer des évènements dans un calendrier

Tous les créneaux réservés sont ajoutés à un calendrier en utilisant la librairie [`ical-generator`](https://www.npmjs.com/package/ical-generator).

Le calendrier est un lien auquel on s'abonne, il est disponible sous l'url `/reservations/calendar/${CALENDAR_ID}`,
où `CALENDAR_ID` correspond à ce qu'il y a dans la variable d'environnement.

### 5. Mettre à jour le pass Apple Wallet pour chaque réservation à venir

La génération du pass est gérée par la librairie [`passkit-generator`](https://www.npmjs.com/package/passkit-generator), il faut avoir un compte Apple Developer pour générer des pass.

Les prérequis sont :

- Avoir un compte Apple Developer
- Générer tous les certificats nécessaires aux pass et les avoir mis dans le dossier `certs`
- Fournir les variables d'environnement nécessaire pour le pass

```dotenv
CERTIFICATES_SIGNER_KEY_PASSPHRASE=
PASS_TYPE_IDENTIFIER=
PASS_TEAM_IDENTIFIER=
```

Pour le pass, il faut d'abord en créer un. Pour ça, nous devons récupérer un token :

```shell
ACCESS_TOKEN=$(node --input-type=module --eval "console.log(await (await import('./src/infrastructure/jsonWebTokenAdapter.js')).jsonWebTokenAdapter.generateToken({}));")
```

Après avoir obtenu notre token, nous pouvons faire un curl pour créer le pass :

```shell
curl -X POST -H "Authorization: Bearer $ACCESS_TOKEN" http://localhost:4000/pass
```

## A venir :

1. Me notifier de créneaux qui m'arrangent qui se libèrent

## Usage en développement

1. Copier le sample.env dans un fichier .env

```shell
cp sample.env .env
```

2. Renseigner les différentes variables d'environnement
3. Installer les paquets

```shell
npm ci
```

4. Lancer la base de données

```shell
docker compose up -d
```

5. Créer la base de données

```shell
npm run db:prepare
```

6. Lancer le projet

```shell
npm start
```

Voilà votre environnement est prêt !

## Contribuer

Les contributions sont les bienvenues !
Que ce soit pour corriger des bugs, ajouter de nouvelles fonctionnalités ou améliorer la documentation,
n'hésitez pas à ouvrir une issue ou à proposer une pull request.
