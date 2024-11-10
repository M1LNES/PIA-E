---
title: Application setup
sidebar_position: 1
slug: /dev/setup
---

First of all, we need to clone whole monorespository from GitHub.

```cmd title="Clone git repository"
git clone https://github.com/M1LNES/PIA-E.git
```

or just download it from courseware and unzip it (in case of PIA-E subject).

## Application

From the root of monorepo, you will need to change directory into application folder by using

```cmd title="Switch into application folder"
cd app
```

### Fetch environment variables

To do that, use command:

```cmd title="Pulling environmental variables from Vercel"
vercel env.local.development pull
```

:::info

If you do not have access to that, create `.env.development.local` file (or just `.env` should be enough as well) and insert environment variables.

:::

### Install dependencies

Install all neccessary dependencies:

```cmd title="Install dependencies"
npm i
```

### Running application

Run application

```cmd title="Run application"
npm run dev
```

### Running UNIT tests

To run UNIT test, use command

```cmd title="Run tests"
npm run test
```

### Checking for lint errors

```cmd title="Run lint to prevent type errors"
npm run lint
```

:::tip
You can also run tests and see the coverage. To do that, use command

```cmd title="Run tests with coverage"
npm run test:coverage
```

:::

## Documentation

From the root of monorepo, you will need to change directory into documentation folder by using

```cmd title="Switch into application folder"
cd docs
```

### Install dependencies

Install all neccessary dependencies:

```cmd title="Install dependencies"
npm i
```

### Running application

Run application

```cmd title="Run documentation"
npm run start
```

Documentation will open in the new tab.
