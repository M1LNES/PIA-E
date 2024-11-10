---
title: Accessibility
sidebar_position: 1
slug: /usage/log-in
---

## Logging into application

The page is deployed as a serverless application on [public URL](https://pia-e.vercel.app/) by using Vercel.

To log in, you need firstly to be added into `whitelist` of allowed user by admin - in this case, **contact Milan Janoch**. You will
need to specify your e-mail address. After admin give you permissions, you can log in using two options - by using Google account or by using
credentials (email + password). That password is just temporary - user can immediately change him after logging ing.

## Roles

Each user has 1 role that can be changed by someone who has bigger bigger permission. We currently support these roles:

| Role type  | Permission |                                        Role Capabilities                                        |
| :--------: | :--------: | :---------------------------------------------------------------------------------------------: |
| superadmin |    100     | Creating posts, creating categories, typing comments to posts, managing account, managing users |
|   admin    |     80     | Creating posts, creating categories, typing comments to posts, managing account, managing users |
|   writer   |     40     |         Creating posts, creating categories, typing comments to posts, managing account         |
|   reader   |     20     |                                        Managing account                                         |

## Pages

|    Page name     |                                                  Description                                                  |
| :--------------: | :-----------------------------------------------------------------------------------------------------------: |
|       Home       | Page with all loaded posts, public to everyone, every role (except reader) can write comments below each post |
| Managing account |                         Page where user can change his password - public to everyone                          |
|   Create Post    |                       Page for creating a posts - accessible to everyone except reader                        |
| Create Category  |                    Page for creating a new category - accessible to everyone except reader                    |
|   Manage Users   |     Page for managing (activating, deactivating, creating) users - allowed only to admins and superadmin      |
