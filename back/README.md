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
