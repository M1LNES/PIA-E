---
title: Categories
sidebar_position: 2
slug: /api/rest/categories
---

This documentation page provides details on the routes prefixed with `/api/categories`.

## **GET** `/api/categories`

This endpoint allows authorized users to retrieve a list of all categories available in the system.

---

### Request

- **Method**: `GET`
- **URL**: `/api/categories`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response includes an array of category objects, where each object represents a category.

```json
{
  "categories": [
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
}
```

### Error Responses

- **401 Unauthorized**: Returned if the request is made without an active session or the user lacks the required permissions.

  ```json
  {
    "error": "Unauthorized!"
  }
  ```

- **403 Forbidden**: Returned if the user does not have enough permissions to perform this action.

  ```json
  {
    "error": "Not enough permissions!"
  }
  ```

- **500 Internal Server Error**: Returned if there is an error during the category retrieval process.

  ```json
  {
    "error": "Internal Server Error"
  }
  ```

---

## **POST** `/api/categories`

This endpoint allows authorized users to create a new category in the system.

---

### Request

- **Method**: `POST`
- **URL**: `/api/categories`
- **Content-Type**: `application/json`

#### Request Body

The request body must include a `title` field representing the category's name.

```json
{
  "title": "New Category Title"
}
```

### Response

- **Status Code**: `201 Created`
- **Content-Type**: `application/json`

#### Successful Response

A successful response includes the newly created category object.

```json
{
  "message": "Category created"
}
```

### Error Responses

- **400 Bad Request**: Returned if the `title` field is missing in the request body.

  ```json
  {
    "error": "Title field required"
  }
  ```

- **401 Unauthorized**: Returned if the request is made without an active session.

  ```json
  {
    "error": "Unauthorized!"
  }
  ```

- **403 Forbidden**: Returned if the user does not have enough permissions to perform this action.

  ```json
  {
    "error": "Not enough permissions!"
  }
  ```

- **409 Conflict**: Returned if a category with the same `title` already exists.

  ```json
  {
    "error": "Category with this title already exists!"
  }
  ```

- **500 Internal Server Error**: Returned if there is an error during the category creation process.

  ```json
  {
    "error": "Internal Server Error"
  }
  ```
