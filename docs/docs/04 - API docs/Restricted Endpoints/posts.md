---
title: Posts
sidebar_position: 5
slug: /api/rest/posts
---

This documentation page provides details on the routes prefixed with `/api/posts`.

## **POST** `/api/posts`

This endpoint allows authorized users to create a new post in the system. The user must have sufficient permissions and all required fields must be provided.

---

### Request

- **Method**: `POST`
- **URL**: `/api/posts`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the following fields:

- **postTitle** (string): The title of the post.
- **postDescription** (string): The description/content of the post.
- **postCategory** (integer): The category of the post. A value of `-1` is considered invalid.

Example Request Body:

```json
{
  "postTitle": "New Post Title",
  "postDescription": "Content of the new post.",
  "postCategory": 2
}
```

### Response

- **Status Code**: `201 Created`
- **Content-Type**: `application/json`

#### Successful Response

A successful response indicates that the post was successfully created.

```json
{
  "message": "Post created"
}
```

### Error Responses

- **400 Bad Request**: Returned if any required fields are missing or invalid (e.g., category is `-1`).

```json
{
  "error": "All fields are required"
}
```

- **401 Unauthorized**: Returned if the request is made without an active session or if the user lacks the required permissions.

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if the user does not have the necessary permissions to create a post.

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

## **GET** `/api/posts`

This endpoint allows users to retrieve all posts available in the system. The posts are publicly accessible, and no authentication is required to fetch them.

---

### Request

- **Method**: `GET`
- **URL**: `/api/posts`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response includes an array of all posts, each containing details like the title, description, and category.

```json
{
  "posts": [
    {
      "username": "franta",
      "roleType": "admin",
      "postId": 12,
      "title": "Cenda nevim",
      "description": "Zdarec parek",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "editedAt": null,
      "categoryName": "omni cast",
      "commentCount": 10
    },
    {
      "username": "franta",
      "roleType": "admin",
      "postId": 16,
      "title": "Cenda nevim 1234",
      "description": "Zdarec parek fesmlefksef",
      "createdAt": "2024-01-02T00:00:00.000Z",
      "editedAt": null,
      "categoryName": "omni skibidi",
      "commentCount": 123
    }
  ]
}
```

### Post Object

- **username** (string): Username of the post creator
- **roleType** (string): Role (e.g. "admin")
- **postId** (number): The ID of the post
- **title** (string): Title of the post
- **description** (string): Content of the posts
- **createdAt** (string): Time when post was created
- **editedAt** (string | null): Edited time of post
- **categoryName** (string): Name of the post's category
- **commentCount** (number): Number of comments under the post

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
