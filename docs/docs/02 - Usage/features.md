---
title: Key Features
sidebar_position: 2
slug: /usage/features
---

## Switching Languages

Application support multiple language support - currently just Czech and English. By default, the language is set from headers sent in request - so if you have
OS in english, you will most likely have application in English. But you can always change taht in navbar - at the bottom, you can see two buttons **EN** and **CS**.
By using them, you can switch between languages easily!

## Changing password

Every single user can change his password. There is no restriction on the password yet. The only restriction is that the new password cannot be same as the old one. How to change the password:

1. Go to **My Account** page
2. Complete the form
3. Submit form

After that, you successfully changed your password!

## Posts

### Creating Post

Every single user can see the posts on the home page and also the comments below them. But how does the creating of posts works?

It's quite simple:

1. Go to **Create new post** page
2. Set title, short description of post (e.g. feature you want into product) and select category
3. Submit form

After that, you will be able to see that post in home page!

### Creating Category

But what if I am product owner and I don't have category for my projects/products category yet?

Follow these steps:

1. Go to **Create new category** page
2. Set the title of new category - the category must not exist. Otherwise you won't be able to create new one
3. Submit form

After that, you can see that your category was successfuly created!

### Loading comments

By default, comments are not shown for posts. It's provided just like on Facebook or Instagram - when you want to see comments, you need to expand that menu
and after that, the comments are loaded. It's for optimization purposes so the user doesn't load data he does not even need.

### Live updating comments

Comments are being live-updated as can be seen in the clip below. When someone starts typing, you can see that (inspired from Slack/Messenger). After that, the new comments are being shown with green frame.

![Live updating comments!](../../static//img/live.webp)

## Managing Users

Managing users is provided by **Manage users** page.

### Overview of existing users

You can overview all of the users in table below the form in the bottom of the page.

### Changing roles

In the table, you can modify a user's role using a select box. However, you can only change a user's role if their current permissions are lower than yours and if the new role you're assigning also has fewer permissions than your own. This ensures that role assignments maintain the correct hierarchy of access and permissions.

### Creating new user

If you want to add new user, you can do it via the form. The form also validates if the user already does exists and won't allow you to create already
existing user.

:::warning

Remember - you can only create or modify user with **lower permissions** than you.

:::

### Deactivating / reactivating user

You can also disable and re-active user with lower permissions than you. You can do it via the table under the form. Again you must have greater
permissions than that user.

## API

Application also offers provides API endpoints. The list of endpoints can be found [here](/api/public).
