## MFA Finland Data API

---

Replace these badges with badges and correct URL's !!! that reflect the state of this project

[![License: AGPLv3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://github.com/zimmerman-team/MFA-Finland-API/blob/master/LICENSE.MD)
[![CircleCI](https://circleci.com/gh/zimmerman-team/iati.cloud.svg?style=svg&circle-token=193a84b0736b82dd10d5e7bb0a118c2fc1c30273)](https://circleci.com/gh/zimmerman-team/MFA-Finland-API)

## Requirements

| Name | Recommended version |
| ---- | ------------------- |
| Node | latest              |
| Yarn | latest              |

## Quick start (manual)

1. create `.env` file with the following

```
# generic
BACKEND_PORT=4200
PROJECT_URL=http://localhost:3000

# data
DS_SOLR_API=https://iati.cloud/search
DS_REST_API=https://iati.cloud/api
MFA_PUBLISHER_REF=FI-3
```

2. `yarn install`
3. `yarn start`

Project will be running on http://localhost:4200/api

## Quick start (docker)

### Additional requirements

| Name           | Recommended version |
| -------------- | ------------------- |
| Docker         | latest              |
| docker-compose | latest              |

1. create `.env` file with the following

```
BACKEND_PORT=4200
MFA_PUBLISHER_REF=FI-3
PROJECT_URL=http://localhost:4200
DS_REST_API=https://iati.cloud/api
DS_SOLR_API=https://iati.cloud/search
```

2. start Docker
3. docker-compose build
4. docker-compose up

Project will be running on http://localhost:4200/api

## Full Documentation

This is a project created with NodeJS, ExpressJS
