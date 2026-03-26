
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
	docker ps -aq | xargs -r docker rm -f
	docker images -aq | xargs -r docker rmi -f

clearports:
	lsof -ti :8000 | xargs -r kill -9
	lsof -ti :5173 | xargs -r kill -9
