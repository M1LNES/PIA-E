---
title: Comments
sidebar_position: 3
slug: /api/rest/comments
---

This documentation page provides details on the routes prefixed with `/api/comments`.

## **POST** `/api/comments`

This endpoint allows an authorized user to add a comment to a specified post.

---

### Request

- **Method**: `POST`
- **URL**: `/api/comments`
- **Content-Type**: `application/json`

#### Request Body

The request body should include the following fields:

- **description** (string, required): The content of the comment.
- **postId** (integer, required): The ID of the post to which the comment is being added.

Example:

```json
{
  "description": "This is my comment on the post.",
  "postId": 123
}
```

### Response

- **Status Code**: `201 Created`
- **Content-Type**: `application/json`

#### Successful Response

The response includes the created comment object.

```json
{
  "message": "Comment created",
  "comment": {
    "commentId": 1,
    "postId": 123,
    "content": "This is my comment on the post.",
    "createdAt": "", // Setting "" so live-update knows on frontend how to render new comment
    "username": "user123"
  }
}
```

### Error Responses

- **400 Bad Request**: Returned if the `description` or `postId` field is missing from the request body.

  ```json
  {
    "error": "Missing required fields"
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

- **500 Internal Server Error**: Returned if there is an error while processing the request.

  ```json
  {
    "error": "Internal server error"
  }
  ```

---

## **GET** `/api/comments/:postId`

This endpoint retrieves all comments for a specific post based on the `postId` provided in the URL.

---

### Request

- **Method**: `GET`
- **URL**: `/api/comments/:postId`
- **Authentication**: Required (session-based)

#### URL Parameters

- **postId** (string): The unique identifier of the post for which comments are being requested.

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

The response includes an array of comment objects, where each object contains details about an individual comment on the post.

```json
[
  {
    "commentId": 1,
    "postId": 12,
    "content": "This is a comment.",
    "createdAt": "2023-10-01T12:34:56.000Z",
    "username": "user123"
  },
  {
    "commentId": 2,
    "postId": 13,
    "content": "Another comment.",
    "createdAt": "2023-10-02T08:45:00.000Z",
    "username": "user456"
  }
]
```

### Comment Object

- **commentId** (number): The unique identifier for the comment.
- **postId** (number): The ID of the post to which this comment belongs.
- **content** (string): The text content of the comment.
- **createdAt** (string): The timestamp when the comment was created.
- **username** (string): The username of the comment author.

### Error Responses

#### Missing postId Parameter

- **Status Code**: 400 Bad Request
- **Content-Type**: application/json
- **Response**:

```json
{
  "error": "Post Id not specified"
}
```

#### Unauthorized Access

- **Status Code**: 401 Unauthorized
- **Content-Type**: application/json
- **Response**:

```json
{
  "error": "Unauthorized!"
}
```

#### Insufficient Permissions

- **Status Code**: 403 Forbidden
- **Content-Type**: application/json
- **Response**:

```json
{
  "error": "Not enough permissions!"
}
```

#### Internal Server Error

- **Status Code**: 500 Internal Server Error
- **Content-Type**: application/json
- **Response**:

```json
{
  "error": "Internal Server Error"
}
```
