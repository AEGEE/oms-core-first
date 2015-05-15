#AEGEE-Europe's Online Membership System

## Introduction

Welcome gentlemen, to Aperture Science. Now you've met one another on the limo ride over, so let me introduce myself: I'm Cave Johnson. I own the place.

Welcome to the OMS Core project page! OMS stands for Online Membership System, and it's a long overdue project within AEGEE-Europe. Things are changing though, and if you're here it means you want to make a glorious contribution to science.


## Language

The language for the Core is Node.js, because there are plenty of REST libraries for the purpose, because there are plenty of tutorials, and finally because the employers LOVE this thing so chances are that when you finish with the Core you find a job without even realising.


## Architecture

The Core will give mechanism for authentication and authorisation, as well as ways to interact with the other database solutions (for event storage, for document management, and so on).

Because the final structure of the whole system will be loosely-coupled services, the architecture has been designed as the Core being a server providing services through REST API.

A good and brief read on the REST concept can be found [here](http://rest.elkstein.org/2008/02/what-is-rest.html). For a shorter explanation, I extracted the most important concepts and you can find them in the docs.

For an example of the ease-of-use of REST API you can check [Twitter's API](https://dev.twitter.com/rest/public). Anybody knows how simple Twitter is, reading briefly just the sidebar and seeing 

## API

Assuming the base URL being < host >/api:

### Create


### Read

> GET /antennae                
:finds all antennae (that exist and have existed)

> GET /antennae/:bodyCode
:finds antenna with specific bodycode

> GET /antennae/:bodyStatus    
:finds antenna with specific body status

> GET /users                   
:finds all users

> GET /user/:uid               
:finds specific users

> GET /user/:membershipdate    
:finds users member since at least...

> GET /user/:membershipuntil   
:finds users with membership until...

### Update

### Delete