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
