---
title: Public Endpoints
sidebar_position: 2
slug: /api/public
---

This documentation page provides details on the available public API endpoints for accessing essential resources within the system. Each endpoint is designed for easy data retrieval and includes usage instructions for fetching categories, posts by category, user comments by post, total comment counts, and user counts by role.

## **GET** `/api/public/authors`

This endpoint returns information about authors, including their name, birthplace, email, and GitHub profile.

---

### Request

- **Method**: `GET`
- **URL**: `/api/public/authors`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

```json
[
  {
    "name": "Skibidi Rizzler",
    "birthplace": "Ohio, Columbus",
    "e-mail": "skibidi-ohio-kai-cenat@ohio.net",
    "github": "https://github.com/Gen-Alpha-Inc/skibidi-lang"
  },
  {
    "name": "Milan Janoch",
    "birthplace": "Pilsen, Czech Republic",
    "e-mail": "milan.janoch@emplifi.io",
    "github": "https://github.com/M1LNES"
  }
]
```

## **GET** `/api/public/categories`

This endpoint retrieves a list of all categories available in the system.

---

### Request

- **Method**: `GET`
- **URL**: `/api/public/categories`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response includes an array of category objects, where each object represents a category.

```json
[
  {
    "id": 1,
    "name": "Category1"
  },
  {
    "id": 2,
    "name": "Category2"
  },
  ...
]
```

### Error Responses

- **500 Internal Server Error**: If error occured.

Example:

```json
{
  "error": "Internal Server Error"
}
```

## **GET** `/api/public/comments`

This endpoint retrieves the total number of comments made by all users.

---

### Request

- **Method**: `GET`
- **URL**: `/api/public/comments`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response contains an object with the total count of all comments.

```json
{
  "totalComments": 123
}
```

### Error Responses

- **500 Internal Server Error**: If error occured.

Example:

```json
{
  "error": "Internal Server Error"
}
```

## **POST** `/api/public/comments`

This endpoint retrieves the number of comments made by a specified user, grouped by post.

---

### Request

- **Method**: `POST`
- **URL**: `/api/public/comments`
- **Content-Type**: `application/json`

#### Request Body

| Field   | Type   | Description                                              |
| ------- | ------ | -------------------------------------------------------- |
| `email` | string | The email of the user whose comments are being retrieved |

**Example**:

```json
{
  "email": "user@example.com"
}
```

### Error Responses

- **400 Bad Request**: Email was not specified.

Example:

```json
{
  "error": "Email is required"
}
```

- **500 Internal Server Error**: If error occured.

Example:

```json
{
  "error": "Internal Server Error"
}
```

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response contains an object where each key is a formatted post ID (e.g., `post1`) with the count of comments made by the user on that post.

```json
{
  "post1": 3,
  "post5": 1,
  "post12": 4
}
```

### Error Responses

- **500 Internal Server Error**: If error occured.

Example:

```json
{
  "error": "Internal Server Error"
}
```

## **GET** `/api/public/posts`

This endpoint returns the number of posts associated with each category in the system.

---

### Request

- **Method**: `GET`
- **URL**: `/api/public/posts`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response contains an object where each key is a category name with the count of posts within that category.

**Example**:

```json
{
  "category1": 5,
  "category2": 3,
  "category3": 0
}
```

### Error Responses

- **500 Internal Server Error**: If error occured.

Example:

```json
{
  "error": "Internal Server Error"
}
```

## **GET** `/api/public/users`

This endpoint returns the number of users associated with each role type in the system.

---

### Request

- **Method**: `GET`
- **URL**: `/api/public/users`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response contains an object where each key is a role type with the count of users assigned to that role.

**Example**:

```json
{
  "reader": 4,
  "writer": 1,
  "admin": 2
}
```

### Error Responses

- **500 Internal Server Error**: If error occured.

Example:

```json
{
  "error": "Internal Server Error"
}
```
