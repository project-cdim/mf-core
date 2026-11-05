# mf-core

## Overview

This is the core part of the `Composable Disaggregated Infrastructure Manager` frontend.

Uses the micro frontend framework OSS `Luigi`.

It is assumed that it is at the same level as other micro frontend projects.

```bash
frontend/
├── mf-core ★This repository
├── mf-layout
├── mf-resource
└── mf-user
```

## Requirement

- Docker x86_64
- AlmaLinux 9

`mf-core` requires Node v18.20.4 or later.

Have a look at the `dependencies` and `devDependencies` sections in the [package.json](package.json) file to find an up-to-date list of the requirements of `mf-core`.

## Usage

### Clone repositories

Clone all repositories (Include submodules).

```bash
$ git clone --recursive {mf-core repository}
$ git clone --recursive {mf-resource repository}
$ git clone --recursive {mf-layout repository}
$ git clone --recursive {mf-user repository}
```

Please do the following settings in the `mf-core` directory.

### Initial setup

Copy `.env.example` and prepare the `.env` file.

```bash
$ cp .env.example .env
```

Please edit the settings in the `.env` file.

#### Environment Variables

The following table summarizes which micro frontends use each variable listed in the `.env` file.

| Variables                                    | mf-core | mf-resource | mf-layout | mf-user |
| -------------------------------------------- | ------- | ----------- | --------- | ------- |
| NEXT_PUBLIC_HEADER_TITLE                     | ○       |             |           |         |
| NEXT_PUBLIC_URL_CORE                         | ○       |             |           |         |
| NEXT_PUBLIC_URL_RESOURCE                     | ○       |             |           |         |
| NEXT_PUBLIC_URL_LAYOUT                       | ○       |             |           |         |
| NEXT_PUBLIC_URL_USER                         | ○       |             |           |         |
| NEXT_PUBLIC_URL_IDP                          | ○       |             |           | ○       |
| NEXT_PUBLIC_IDP_REALMS                       | ○       |             |           | ○       |
| NEXT_PUBLIC_AUTH_CLIENT_ID                   | ○       |             |           |         |
| NEXT_PUBLIC_URL_BE_LAYOUT_DESIGN             |         |             | ○         |         |
| NEXT_PUBLIC_URL_BE_LAYOUT_APPLY              |         |             | ○         |         |
| NEXT_PUBLIC_URL_BE_POLICY_MANAGER            |         |             | ○         |         |
| NEXT_PUBLIC_URL_BE_CONFIGURATION_MANAGER     | ○       | ○           | ○         |         |
| NEXT_PUBLIC_URL_BE_PERFORMANCE_MANAGER       | ○       | ○           |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_RES_SUMMARY         | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_RES_RESOURCE_GROUPS | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_RES_RACK_ELEVATIONS | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_RES_CXL_SWITCHES    | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_RES_NODES           | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_RES_RESOURCES       | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_LAY_LAYOUT_DESIGNS  | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_LAY_LAYOUT_APPLIES  | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_LAY_POLICIES        | ○       |             |           |         |
| NEXT_PUBLIC_DISPLAY_MENU_USER_USERS          | ○       |             |           |         |
| NEXT_PUBLIC_DASHBOARD_INTERVAL_SECONDS       | ○       |             |           |         |
| NEXT_PUBLIC_ALERTA_REAUTH_CHECK_INTERVAL_SECONDS | ○   |             |           |         |
| NEXT_PUBLIC_ALERT_REFRESH_INTERVAL_SEC       | ○       |             |           |         |

### Start and stop development container

#### Operation of all micro frontend containers

- Start all micro frontend containers

```bash
$ docker compose up -d --build
```

build only the first time.

Stop all micro frontend containers.

```bash
$ docker compose down
```

## Tests

Unit tests are performed using `Jest`.

You can add new tests or run existing tests by following the steps below.

### Add a new test

Place the test in the `__tests__` directory with the file name `.test.ts` or `.test.tsx`.

### Run tests

You can run the tests with the following command.

```bash
$ npm run test
```

## License

Copyright (c) 2026 NEC Corporation.

`mf-core` is under [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)
