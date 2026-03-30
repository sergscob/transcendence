
.PHONY: all prod back front i-back i-front i

all:
	$(MAKE) back &
	$(MAKE) front &
	wait

prod:
	docker-compose up --build

back:
	cd back && . venv/bin/activate && python3 manage.py runserver 0.0.0.0:8000

front:
	cd front && npm run dev 

i-back:
	cd back && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt

i-front:
	cd front && npm install

i:
	$(MAKE) i-back
	$(MAKE) i-front

cleardocker:
	docker ps -aq | xargs -r docker rm -f
	docker images -aq | xargs -r docker rmi -f

clearports:
	lsof -ti :8000 | xargs -r kill -9
	lsof -ti :5173 | xargs -r kill -9
