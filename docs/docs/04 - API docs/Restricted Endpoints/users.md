---
title: Users
sidebar_position: 7
slug: /api/rest/users
---

This documentation page provides details on the routes prefixed with `/api/users`.

## **PUT** `/api/users/active-user`

This endpoint allows authorized users to activate a previously deactivated user.

---

### Request

- **Method**: `PUT`
- **URL**: `/api/users/active-user`
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
  "message": "User activated",
  "status": 200
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

## **POST** `/api/users/add-user`

This endpoint allows an authorized user to create a new user with the provided details, including username, email, role, and password.

---

### Request

- **Method**: `POST`
- **URL**: `/api/users/add-user`
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

- **Status Code**: `200 OK`
- **Content-Type**: `application/json`

#### Successful Response

If the user is successfully created, the response will include a success message.

Example:

```json
{
  "message": "User created successfully",
  "status": 200
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

- **400 Bad Request**: Returned if any required fields are missing or if the passwords do not match.

Example:

```json
{
  "error": "All fields are required"
}
```

- **400 Bad Request**: Returned if the email address is invalid.

Example:

```json
{
  "error": "Invalid e-mail address"
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

## **POST** `/api/users/change-password`

This endpoint allows an authenticated user to change their password by providing the old password, a new password, and confirming the new password.

---

### Request

- **Method**: `POST`
- **URL**: `/api/users/change-password`
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
  "message": "Password successfully changed!",
  "status": 200
}
```

### Error Responses

- **401 Unauthorized**: Returned if the request is made without an active session or if the user tries to change another user's password.

Example:

```json
{
  "error": "Unauthorized to change password!!!"
}
```

- **404 Not Found**: Returned if the user is not found in the database (e.g., deactivated user).

Example:

```json
{
  "error": "User not found!"
}
```

- **422 Unprocessable Entity**: Returned if the old password is incorrect, the new password and confirmation do not match, or the new password is the same as the old password.

Example:

```json
{
  "error": "You provided the wrong old password!"
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

## **POST** `/api/users/change-role`

This endpoint allows an authenticated user with sufficient permissions to change the role of another user.

---

### Request

- **Method**: `POST`
- **URL**: `/api/users/change-role`
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
  "message": "Role successfully changed!",
  "status": 200
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

- **422 Unprocessable Entity**: Returned if the `userId` or `roleId` is invalid or missing.

Example:

```json
{
  "error": "Required values are invalid"
}
```

- **403 Forbidden**: Returned if the user does not have sufficient permissions to change the role.

Example:

```json
{
  "error": "Not enough permissions!"
}
```

- **404 Not Found**: Returned if the user or role is not found in the database.

Example:

```json
{
  "error": "User or role not found"
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

## **PUT** `/api/users/disabled-user`

This endpoint allows an authenticated user with sufficient permissions to disable another user by email.

---

### Request

- **Method**: `PUT`
- **URL**: `/api/users/disabled-user`
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
  "message": "User disabled",
  "status": 200
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

- **400 Bad Request**: Returned if the `email` is not specified.

Example:

```json
{
  "error": "Email not specified!"
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

## **GET** `/api/users/get-all-users`

This endpoint allows an authenticated user with sufficient permissions to retrieve a list of all users along with their roles.

---

### Request

- **Method**: `GET`
- **URL**: `/api/users/get-all-users`
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

## **POST** `/api/users/get-user`

This endpoint allows authenticated users to retrieve their own user information based on the email provided. Only the logged-in user can access their own data.

---

### Request

- **Method**: `POST`
- **URL**: `/api/users/get-user`
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

- **401 Unauthorized**: Returned if the request is made without an active session.

```json
{ "error": "Unauthorized!" }
```

- **400 Bad Request**: Returned if the `email` field is missing in the request body.

```json
{ "error": "Email not specified!" }
```

- **403 Forbidden**: Returned if a user tries to access another user's data.

```json
{ "error": "Unauthorized to get user info" }
```

- **500 Internal Server Error**: Returned if there is an error during the user data retrieval process.

```json
{ "error": "Internal Server Error" }
```