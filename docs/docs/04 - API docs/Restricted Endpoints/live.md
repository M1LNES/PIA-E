---
title: Live
sidebar_position: 4
slug: /api/rest/live
---

This documentation page provides details for the route `/api/live`.

## Overview

This route provides an endpoint to request an Ably token for real-time communication. The token is used for authenticating a client to access channels on Ably. The route ensures that the user is authenticated via a session before providing the token request.

## HTTP Methods

### `GET`

This method generates an Ably token request for authenticated users. It checks the user's session, and if valid, creates a token for connecting to Ably channels.

## Request

This route does not require a body in the request.

### Session Validation

The route checks if the user has a valid session. If there is no session or if the session is invalid, the user will receive an unauthorized error response.

## Response

### Successful Response

- **Status Code**: 200 OK
- **Content-Type**: application/json

The response will contain the token request data, which can be used to authenticate with Ably.
Example:

```json
{ "token": "AblyTokenRequestHere" }
```

### Error Responses

#### Unauthorized Access

- **Status Code**: 401 Unauthorized
- **Content-Type**: application/json

```json
{ "error": "Unauthorized!" }
```

If the user does not have a valid session, they will receive an unauthorized response.

#### Internal Server Error

- **Status Code**: 500 Internal Server Error
- **Content-Type**: application/json

```json
{ "error": "Internal Server Error" }
```

If an unexpected error occurs, such as issues with Ably or server-side failures, an internal server error response will be returned.

## Authentication Flow

1. **Session Check**: The route checks if the user has a valid session using NextAuth. If the session is invalid or not found, the request will be rejected with a `401 Unauthorized` error.
2. **Token Generation**: If the user is authenticated, the route generates a token request using Ably’s REST client. This token can be used by the frontend client to authenticate with Ably’s real-time messaging system.

## Caching

- **Cache Control**: `fetchCache = 'force-no-store'` ensures that the response is not cached, as the token request is sensitive and specific to the current session.
- **Revalidation**: The `revalidate = 0` disables revalidation for the route, ensuring that the latest token request is always returned.

## Logging

The server logs a warning if an unauthorized access attempt is made, providing information about the route and the attempt.
