# 42 transcendence

## Description

Backend - Django, frontend - React

## Installation 

```bash
make i
```

or

#### Back :

```bash
cd back
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

#### Front:

```bash
cd front
npm install
```


## Run

#### Back:


```bash
cd back
source venv/bin/activate
#python manage.py runserver
daphne -b 0.0.0.0 -p 8000 core.asgi:application
```
or 
```bash
make back
```

#### Front:

```bash
cd front
npm run dev
```
or 
```bash
make front
```

# Install

#### `python -m venv venv`
#### `source venv/bin/activate`
#### `pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow requests drf_yasg channels`
#### `pip install -r requirements.txt`

# Start 

#### `python manage.py runserver`

# Migrations

#### `python manage.py makemigrations`
#### `python manage.py migrate`

# Start new project

#### `django-admin startproject core .`
#### `python manage.py startapp users`

#### `python manage.py createsuperuser`

#### `pip freeze > requirements.txt`


# Localization

#### `python manage.py makemessages -l ru -l fr`

#### Edit the generated .po files in back/locale/ru/LC_MESSAGES/django.po and back/locale/fr/LC_MESSAGES/django.po. 
#### back/locale/ru/LC_MESSAGES/django.po
#### back/locale/fr/LC_MESSAGES/django.po

#### new entries will look like this:
#### msgid "to_be_translated"
#### msgstr ""

#### Compile the .po files into .mo files that Django can use: 
#### `python manage.py compilemessages`


# React + Vite

## Install

#### `npm install`

## Run

#### `npm run dev`

## Start new project

#### `npm create vite@latest frontend`


## Resources

### React

https://react.dev/

### Tailwind CSS

https://tailwindcss.com/docs/

### Vite

https://vitejs.dev/

### Components

https://ui.shadcn.com/

### Icons

https://react-icons.github.io

https://www.svgrepo.com/

