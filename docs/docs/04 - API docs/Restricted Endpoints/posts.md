---
title: Posts
sidebar_position: 5
slug: /api/rest/posts
---

This documentation page provides details on the routes prefixed with `/api/posts`.

## **POST** `/api/posts/add-post`

This endpoint allows authorized users to create a new post in the system. The user must have sufficient permissions and all required fields must be provided.

---

### Request

- **Method**: `POST`
- **URL**: `/api/posts/add-post`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the following fields:

- **title** (string): The title of the post.
- **description** (string): The description/content of the post.
- **category** (integer): The category of the post. A value of `-1` is considered invalid.

Example Request Body:

```json
{
  "title": "New Post Title",
  "description": "Content of the new post.",
  "category": 2
}
```

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

A successful response indicates that the post was successfully created.

```json
{
  "error": "Post created",
  "status": 200
}
```

### Error Responses

- **401 Unauthorized**: Returned if the request is made without an active session or if the user lacks the required permissions.

```json
{
  "error": "Unauthorized!"
}
```

- **422 Unprocessable Entity**: Returned if the user does not exist in the database or is deactivated.

```json
{
  "error": "User not found in DB!"
}
```

- **400 Bad Request**: Returned if any required fields are missing or invalid (e.g., category is `-1`).

```json
{
  "error": "All fields are required"
}
```

- **401 Unauthorized**: Returned if the user does not have the necessary permissions to create a post.

```json
{
  "error": "Not enough permissions!"
}
```

- **500 Internal Server Error**: Returned if there is an error during the post creation process.

```json
{
  "error": "Internal server error"
}
```

---

## **GET** `/api/posts/get-all-posts`

This endpoint allows users to retrieve all posts available in the system. The posts are publicly accessible, and no authentication is required to fetch them.

---

### Request

- **Method**: `GET`
- **URL**: `/api/posts/get-all-posts`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response includes an array of all posts, each containing details like the title, description, and category.

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Post 1",
      "description": "Content of the first post",
      "category": 2
    },
    {
      "id": 2,
      "title": "Post 2",
      "description": "Content of the second post",
      "category": 1
    }
  ]
}
```

### Error Responses

- **401 Unauthorized**: Returned if the request is made without an active session. However, since posts are publicly accessible, this error might not be relevant for this route.

```json
{
  "error": "Unauthorized!"
}
```

- **500 Internal Server Error**: Returned if there is an error during the fetching of posts.

```json
{
  "error": "Internal Server Error"
}
```
