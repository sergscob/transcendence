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


