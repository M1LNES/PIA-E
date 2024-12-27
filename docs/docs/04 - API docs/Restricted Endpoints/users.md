---
title: Users
sidebar_position: 7
slug: /api/rest/users
---

This documentation page provides details on the routes prefixed with `/api/users`.

## **PUT** `/api/users/activation`

This endpoint allows authorized users to activate a previously deactivated user.

---

### Request

- **Method**: `PUT`
- **URL**: `/api/users/activation`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the `email` of the user to be re-activated.

Example:

```json
{
  "email": "user@example.com"
}
```

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

If the user is successfully activated, the response will include a success message.

Example:

```json
{
  "message": "User activated"
}
```

### Error Responses

- **401 Unauthorized**: Returned if the request is made without an active session.

Example:

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if the user does not have enough permissions to perform this action.

Example:

```json
{
  "error": "Not enough permissions!"
}
```

- **400 Bad Request**: Returned if the `email` field is missing from the request body.

Example:

```json
{
  "error": "Email not specified!"
}
```

- **500 Internal Server Error**: Returned if there is an error during the activation process.

Example:

```json
{
  "error": "Internal server error"
}
```

---

## **POST** `/api/users`

This endpoint allows an authorized user to create a new user with the provided details, including username, email, role, and password.

---

### Request

- **Method**: `POST`
- **URL**: `/api/users`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the following fields:

- `username` (string): The username of the new user.
- `email` (string): The email address of the new user.
- `selectedRole` (integer): The role ID for the new user.
- `password` (string): The password for the new user.
- `confirmPassword` (string): A confirmation of the password.

Example:

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "selectedRole": 2,
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Response

- **Status Code**: `201 OK`
- **Content-Type**: `application/json`

#### Successful Response

If the user is successfully created, the response will include a success message.

Example:

```json
{
  "message": "User created successfully"
}
```

### Error Responses

- **400 Bad Request**: Returned if any required fields are missing or if the passwords do not match or if the email is invalid.

Example:

```json
{
  "error": "All fields are required"
}
```

or

```json
{
  "error": "Invalid e-mail address"
}
```

or

```json
{
  "error": "Passwords are not same!"
}
```

- **401 Unauthorized**: Returned if the request is made without an active session.

Example:

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if the user does not have enough permissions to create a new user.

Example:

```json
{
  "error": "Not enough permissions!"
}
```

- **409 Conflict**: Returned if the provided email is already in use.

Example:

```json
{
  "error": "Email is already being used"
}
```

- **500 Internal Server Error**: Returned if there is an error during the user creation process.

Example:

```json
{
  "error": "Internal server error"
}
```

---

## **PATCH** `/api/users/password`

This endpoint allows an authenticated user to change their password by providing the old password, a new password, and confirming the new password.

---

### Request

- **Method**: `PATCH`
- **URL**: `/api/users/password`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the following fields:

- `email` (string): The email of the user changing their password.
- `oldPassword` (string): The user's current password.
- `newPassword` (string): The new password the user wants to set.
- `newPasswordConfirm` (string): A confirmation of the new password.

Example:

```json
{
  "email": "user@example.com",
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "newPasswordConfirm": "newpassword123"
}
```

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

If the password is successfully changed, the response will include a success message.

Example:

```json
{
  "message": "Password successfully changed!"
}
```

### Error Responses

- **400 Bad Request**: Returned if the passwords are not same, new password is same as the old one or the current password is invalid.

Example:

```json
{
  "error": "You provided the wrong old password!"
}
```

or

```json
{
  "error": "New password and confirm password are not the same!"
}
```

or

```json
{
  "error": "New password is the same as the old password!"
}
```

- **401 Unauthorized**: Returned if the request is made without an active session or if the user tries to change another user's password.

Example:

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if user wants to change password of someone else.

Example:

```json
{
  "error": "Not enough permissions!"
}
```

- **500 Internal Server Error**: Returned if there is an issue processing the password change.

Example:

```json
{
  "error": "Internal Server Error"
}
```

---

## **PATCH** `/api/users/role`

This endpoint allows an authenticated user with sufficient permissions to change the role of another user.

---

### Request

- **Method**: `PATCH`
- **URL**: `/api/users/role`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the following fields:

- `userId` (number): The ID of the user whose role is being changed.
- `roleId` (number): The new role ID to assign to the user.

Example:

```json
{
  "userId": 42,
  "roleId": 2
}
```

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

If the role is successfully changed, the response will include a success message.

Example:

```json
{
  "message": "Role successfully changed!"
}
```

### Error Responses

- **400 Bad request**: Returned if the `userId` or `roleId` is invalid or missing.

Example:

```json
{
  "error": "Required values are invalid"
}
```

- **401 Unauthorized**: Returned if the request is made without an active session.

Example:

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if the user does not have sufficient permissions to change the role.

Example:

```json
{
  "error": "Not enough permissions!"
}
```

- **500 Internal Server Error**: Returned if there is an issue processing the request.

Example:

```json
{
  "error": "Internal Server Error"
}
```

---

## **PUT** `/api/users/deactivation`

This endpoint allows an authenticated user with sufficient permissions to disable another user by email.

---

### Request

- **Method**: `PUT`
- **URL**: `/api/users/deactivation`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the following fields:

- `email` (string): The email of the user to disable.

Example:

```json
{
  "email": "user@example.com"
}
```

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

If the user is successfully disabled, the response will include a success message.

Example:

```json
{
  "message": "User disabled"
}
```

### Error Responses

- **400 Bad Request**: Returned if the `email` is not specified.

Example:

```json
{
  "error": "Email not specified!"
}
```

- **401 Unauthorized**: Returned if the request is made without an active session.

Example:

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if the user does not have sufficient permissions to disable the user.

Example:

```json
{
  "error": "Not enough permissions!"
}
```

- **500 Internal Server Error**: Returned if there is an issue processing the request.

Example:

```json
{
  "error": "Internal Server Error"
}
```

---

## **GET** `/api/users`

This endpoint allows an authenticated user with sufficient permissions to retrieve a list of all users along with their roles.

---

### Request

- **Method**: `GET`
- **URL**: `/api/users`
- **Content-Type**: `application/json`

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

If the request is successful and the user has sufficient permissions, the response will include a list of users with their roles.

Example:

```json
{
  "users": [
    {
      "id": 1,
      "username": "Skibidi Milan",
      "deleted_at": null,
      "email": "skibidi-lan@gmail.com",
      "roleid": 2
    },
    {
      "id": 2,
      "username": "GYAT lvl 10",
      "deleted_at": null,
      "email": "fanum-tax@seznam.cz",
      "roleid": 3
    }
  ]
}
```

#### Error Responses

- **401 Unauthorized**: Returned if the request is made without an active session or the user does not have the required permissions.

Example:

```json
{
  "error": "Unauthorized!"
}
```

- **403 Forbidden**: Returned if the user does not have sufficient permissions to access the list of users.

Example:

```json
{
  "error": "Not enough permissions!"
}
```

- **500 Internal Server Error**: Returned if there is an issue processing the request.

Example:

```json
{
  "error": "Internal Server Error"
}
```

---

## **POST** `/api/users/self`

This endpoint allows authenticated users to retrieve their own user information based on the email provided. Only the logged-in user can access their own data.

---

### Request

- **Method**: `POST`
- **URL**: `/api/users/self`
- **Content-Type**: `application/json`

#### Request Body

The request body must include the `email` field representing the user's email address.

```json
{ "email": "user@example.com" }
```

### Response

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

A successful response includes the user information.

```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john_doe@example.com",
    "role": 2,
    "type": "admin",
    "permission": 5
  }
}
```

### Error Responses

- **400 Bad Request**: Returned if the `email` field is missing in the request body.

```json
{ "error": "Email not specified!" }
```

- **401 Unauthorized**: Returned if the request is made without an active session.

```json
{ "error": "Unauthorized!" }
```

- **403 Forbidden**: Returned if a user tries to access another user's data.

```json
{ "error": "Not enough permissions" }
```

- **500 Internal Server Error**: Returned if there is an error during the user data retrieval process.

```json
{ "error": "Internal Server Error" }
```
