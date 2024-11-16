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
vercel env pull
```

:::info

If you do not have access to that, create `.env` fileand insert environment variables.

:::

### Install dependencies

Install all neccessary dependencies:

```cmd title="Install dependencies"
npm i
```

### Use supported node version

Install all neccessary dependencies:

```cmd title="Switch to node version in .nvmrc"
nvm use
```

### Running application

Run application

```cmd title="Run application"
npm run dev
```

### Running UNIT tests

To run UNIT tests, use command

```cmd title="Run tests"
npm run test
```

:::tip
You can also run tests and see the coverage. To do that, use command

```cmd title="Run tests with coverage"
npm run test:coverage
```

:::

:::info

Each route has its own `route.test.ts` file that tests the functionality of the API endpoint.

:::

### Running End 2 End tests

To run e2e tests, use command

```cmd title="Run tests"
npm run test:e2e
```

After that, you can see the result by using command:

```cmd title="E2E test result"
npx playwright show-report
```

:::info For mr teacher

I wanted to provide some context regarding the E2E tests I included in my project. I understand that there are more efficient and optimized ways to handle scenarios like session management, such as mocking the session or using more advanced techniques. However, my goal with these tests was to demonstrate that the application supports E2E testing and that the process is straightforward and easy to use.

By avoiding approaches like mocking sessions or introducing additional configuration files, I was able to simplify the setup and minimize the risk of forgetting to include important files when submitting the project. This ensures the testing process remains accessible and clear, while still validating key aspects of the application’s functionality.
:::

### Checking for lint errors

```cmd title="Run lint to prevent type errors"
npm run lint
```

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
