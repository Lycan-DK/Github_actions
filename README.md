# Summary
 This a a API NodeJS Project that performs CRUD operations on the given database.
 Application uses Postgres database on RDS server in AWS.
 This Application is hosted on GKE on Google Cloud. 
 Application is deployed through a CICD pipeline in GitHub Actions

# How to run on Local 
There are 2 ways to run on local

1. With CLI and node server
    - Setup environment variables for local environment
    
    ```
    RDS_HOSTNAME: {URL of the database}
    RDS_USERNAME: "admin"
    RDS_PASSWORD: "password"
    RDS_PORT: "5432"
    ```
    - go to project directory and run command `npm start`
    - server will run on port 3000 now

2. Running with Docker
    - edit the key database host, passwrod and user in `docker-compose.yml`
    ``` 
    RDS_HOSTNAME: {URL of the database}
    RDS_USERNAME: "admin"
    RDS_PASSWORD: "password"
    RDS_PORT: "5432"
    ```
    - go to project directory and run command `docker-compose up -d`
    - server will run on port 3000 now


# How to setup a CI/CD pipeline in GitHub Actions
## Google Cloud Setup
- Create a service account in Google Cloud
- In actions create 'GKE_KEY' (access key to you account) and download it in your local directory in JSON format
- Silmilarly create 'GKE_PROJECT_ID' (Project ID of your Cluster) and an 'SA_KEY' (secret access key) also in JSON format
- Store the above values in secrets in you GitHub action with the same name as mentioned above
- These values will further be used in google.yml that is created for GitHub CI/CD workflow

## Setup GKE
- In GKE create an autopilot project and save the following values as your environment variable
  - PROJECT_ID: ${{ secrets.GKE_PROJECT_ID }}
  - GAR_LOCATION:   # TODO: update region of the Artifact Registry
  - GKE_CLUSTER:   # TODO: update to cluster name
  - GKE_ZONE: # TODO: update to cluster zone
  - DEPLOYMENT_NAME: # TODO: update to deployment name
  - REPOSITORY: # TODO: update to Artifact Registry docker repository
  - IMAGE: # TODO : update to name of your image in GAR
## Create a new repo in GAR (Google Artifact Repository)
- This will be used to publish the image from Docker hub to GAR
    
  ### Initial Set-up
  - In the editor create 'deployment.yml' file
  - This file will create pods for the Application for it to run in Kubernetes Cluster.
  - Run the following commans to run the pods
    ```
    kubectl apply -f deployment.yml
    ```
- To check the external IP of the Application run the command
         ```
         kubectl get svc
         ```
## Pipeline Setup
- The pipeline is setup in google.yml in .github.workflows
- Customize the environment variables in the yml according to your GKE credentials saved in secrets
- In the repository settings in GitHub Action, go to secrets and create repository secrets using key name and 'GKE_KEY' (downloaded from GKE) as value
- Repeat the above step to create a 'GKE_PROJECT_ID' and put your project ID for Gloogle cloud as its value
- Run the pipeline in GitHub Actions.
- Any change will be reflected once the pipeline is built


# Cypress API tests (E2E)

This repo uses **Cypress** to run API (endpoint) tests against the running Node/Express server.

## What is covered

The Cypress suite covers the People CRUD endpoints mounted at `/people`:

- `GET /people`
- `POST /people`
- `GET /people/:uuid`
- `PUT /people/:uuid`
- `DELETE /people/:uuid`

Each endpoint has **3 test cases** (happy path + error/edge cases). The spec lives in `cypress/e2e/people.cy.js`.

## Folder structure

```
cypress/
  e2e/
    people.cy.js
  support/
    e2e.js
cypress.config.js
```

## Run tests locally

### Prerequisites (DB + env vars)

This API connects to Postgres using these environment variables:

```
RDS_HOSTNAME
RDS_USERNAME
RDS_PASSWORD
RDS_PORT
```

If the DB is not reachable / credentials are missing, the server may still start but the endpoints will fail (and Cypress tests will fail).

### 1) Start the API server

The API server must be running before Cypress tests start.

```
npm start
```

By default, Cypress points to `http://localhost:3000` (see `cypress.config.js`).

### 2) Run Cypress tests

Headless run (recommended for CI):

```
npm run test:e2e
```

Open Cypress UI:

```
npm run test:e2e:open
```

## Notes

- If you run the server on a different port, update `baseUrl` in `cypress.config.js`.
- The tests are written as API checks using `cy.request()`.

## Run tests in GitHub Actions

The workflow in `.github/workflows/google.yml` runs Cypress tests before deploying.

To enable this in your repo, create these GitHub Actions secrets:

- `RDS_HOSTNAME`
- `RDS_USERNAME`
- `RDS_PASSWORD`
- `RDS_PORT`

If tests fail, the workflow uploads artifacts (server log, Cypress screenshots/videos) to help with debugging.

