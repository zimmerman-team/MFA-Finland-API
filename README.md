## MFA Finland Data API

---

[![License: AGPLv3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://github.com/zimmerman-team/MFA-Finland-API/blob/main/LICENSE.MD)
[![CircleCI](https://circleci.com/gh/zimmerman-team/MFA-Finland-API/tree/main.svg?style=svg&circle-token=ae015a1b18d85d297a0a9c71131da97726b87a6b)](https://circleci.com/gh/zimmerman-team/MFA-Finland-API/tree/main)

Zimmerman was commissioned to deliver the Transparency Data Portal for the Finnish Ministry for Foreign affairs (MFA). Part of the work was to integrate the open data provided in the IATI datastandard by MFA into a web application (website). The work was delivered in between October 2020 and May 2021 and soft launched in June 2021.

Also makes use of a [headless CMS](https://getcockpit.com) with multilingual support.

The Data API Middleware makes use of the dataservice [IATI Cloud](http://iati.cloud/) which extracts all open data annotated in the IATI datastandard and extracted from the [IATI Registry](http://www.iatiregistry.org/publisher) and makes the data available in [Apache Solr](https://iati.cloud/documentation), allowing for fast querying of the data.

The [Transparency Data Portal for the Finnish Ministry for Foreign affairs (MFA)](https://github.com/zimmerman-team/MFA-Finland-frontend/) makes use of the Data API Middleware in order to retrieve all data needed for the visualisations/tables/filters and detail pages.

IATI is a global aid transparency standard and it makes information about aid spending easier to access, re-use and understand the underlying data using a unified open standard. You can find more about the IATI data standard at: [www.iatistandard.org](www.iatistandard.org)

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
MFA_PUBLISHER_REF=FI-3
HDRO_API=http://ec2-54-174-131-205.compute-1.amazonaws.com/API/HDRO_API.php
UM_FI_API=https://um.fi/o/public-api/v1/content
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
DS_SOLR_API=https://iati.cloud/search
HDRO_API=http://ec2-54-174-131-205.compute-1.amazonaws.com/API/HDRO_API.php
UM_FI_API=https://um.fi/o/public-api/v1/content
```

2. start Docker
3. docker-compose build
4. docker-compose up

Project will be running on http://localhost:4200/api

## Full Documentation

This is a project created with NodeJS, ExpressJS
