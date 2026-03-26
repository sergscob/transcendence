
.PHONY: all prod back front

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


cleardocker:
	docker rm -f $(docker ps -aq)	
	docker rmi -f $(docker images -aq)

clearports:
	lsof -ti :8000 | xargs -r kill -9
	lsof -ti :5173 | xargs -r kill -9
