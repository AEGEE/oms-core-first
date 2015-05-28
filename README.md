#AEGEE-Europe's Online Membership System

## Introduction

Welcome gentlemen, to Aperture Science. [Now you've met one another on the limo ride over, so let me introduce myself](http://i1.theportalwiki.net/img/4/4d/Cave_Johnson_fifties_intro03.wav): [I'm Cave Johnson. I own the place.](http://i1.theportalwiki.net/img/e/e2/Cave_Johnson_fifties_intro04.wav)


Welcome to the OMS Core project page! OMS stands for Online Membership System, and it's a long overdue project within AEGEE-Europe. Things are changing though, and if you're here it means you want to make a [glorious contribution to science](http://i1.theportalwiki.net/img/c/c4/Cave_Johnson_fifties_outro02.wav).

## How to contribute

Have a read at [this branching model](http://nvie.com/posts/a-successful-git-branching-model/), then fork the repo and start contributing in any way you want! Don't forget to add your name to contributors.txt

## Language

The language for the Core is Node.js, because there are plenty of REST libraries for the purpose, because there are plenty of tutorials, and finally because the employers LOVE this thing so chances are that when you finish with the Core you find a job without even realising.


## Architecture

You can read more about the architecture on the [wiki](https://bitbucket.org/aegeeitc/oms-core/wiki/Home)

## API

Assuming the base URL being < host >/api:

### Create

```
#!python

POST /users/create
```          
:creates new user

```
#!python

POST /users/:userId/memberships/create
```          
:creates new membership for an user

### Read

```
#!python

GET /antennae
```          
:finds all antennae (that exist and have existed)

```
#!python

GET /antennae/:bodyCode 
```
:finds antenna with specific bodycode

```
#!python

GET /antennae/:bodyStatus
```
:finds antenna with specific body status (NOT IMPLEMENTED)

```
#!python

GET /users
```
:finds all users

```
#!python

GET /user/:userId
```
:finds specific users

```
#!python

GET /user/:userId/memberships
```
:finds specific users' memberships

```
#!python

GET /user/:membershipdate    
```
:finds users member since at least... (NOT IMPLEMENTED)

```
#!python

GET /user/:membershipuntil
```
:finds users with membership until... (NOT IMPLEMENTED)

### Update

### Delete