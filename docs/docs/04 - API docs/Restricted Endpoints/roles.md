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
      "roleId": 1,
      "roleType": "admin",
      "rolePermission": 80
    },
    {
      "roleId": 2,
      "roleType": "writer",
      "rolePermission": 40
    },
    {
      "roleId": 3,
      "roleType": "reader",
      "rolePermission": 20
    },
    {
      "roleId": 4,
      "roleType": "superadmin",
      "rolePermission": 100
    }
  ]
}
```

### Role Object

- **roleId** (number): The unique identifier for the role
- **roleType** (string): The name of the role
- **rolePermission** (number): The permission of the role.

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
