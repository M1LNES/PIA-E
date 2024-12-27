---
title: Roles
sidebar_position: 6
slug: /api/rest/roles
---

This documentation page provides details on the routes prefixed with `/api/roles`.

## **GET** `/api/roles`

This endpoint allows authorized users with sufficient permissions to retrieve a list of all available roles in the system.

---

### Request

- **Method**: `GET`
- **URL**: `/api/roles`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response includes an array of roles available in the system.

```json
{
  "roles": [
    {
      "id": 1,
      "type": "admin",
      "permission": 80
    },
    {
      "id": 2,
      "type": "writer",
      "permission": 40
    },
    {
      "id": 3,
      "type": "reader",
      "permission": 20
    },
    {
      "id": 4,
      "type": "superadmin",
      "permission": 100
    }
  ]
}
```

### Error Responses

- **401 Unauthorized**: Returned if the request is made without an active session.

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if the user’s permissions are insufficient to access the route.

```json
{
  "error": "Not enough permissions!"
}
```

- **500 Internal Server Error**: Returned if there is an error during the fetching of roles.

```json
{
  "error": "Internal Server Error"
}
```
