---
title: Auth
sidebar_position: 1
slug: /api/rest/auth
---

This documentation page provides details for the route `/api/auth/[...nextauth]`.

## Overview

This route handles authentication requests using NextAuth.js, supporting both Google and credentials-based authentication providers. It uses JWT for session management and includes logic for verifying users based on their email and password for credentials authentication, and checks if the user exists in the database when using Google authentication. More info on [next-auth](https://next-auth.js.org/) page.

## HTTP Methods

### `GET` and `POST`

Both methods are handled by the same route and process authentication requests.

## Request Body (POST)

### For Google Authentication (OAuth)

The request does not require a body when using the Google provider, as it relies on OAuth.

### For Credentials Authentication

When using credentials authentication, the request body should include:

- **email** (string): The user's email address.
- **password** (string): The user's password.

Example:

```json
{ "email": "user@example.com", "password": "password123" }
```

## Response

The response depends on the authentication provider being used and whether the authentication was successful.

## Authentication Flow

1. **Google OAuth Authentication**:

   - When the user tries to log in via Google, the route attempts to find the user in the database by email.
   - If the user exists and is active, authentication proceeds.
   - If the user does not exist or is inactive, access is denied.

2. **Credentials-based Authentication**:
   - The user provides their email and password.
   - The server checks if the user exists in the database and if the provided password matches the stored hashed password.
   - If successful, the user is authenticated and returned.
   - If not, authentication fails.

## Callbacks

### `signIn` Callback

This callback checks the provider type and determines whether the user can sign in:

- For **credentials** authentication, the user is allowed to sign in as long as the credentials are correct.
- For **Google** authentication, the callback checks if the user's email is already registered in the database.
