
.PHONY: all prod prod-https back front i-back i-front i back-admin

all:
	$(MAKE) back &
	$(MAKE) front &
	wait

prod:
	podman-compose up --build

back:
	cd back && . venv/bin/activate && daphne -b 0.0.0.0 -p 8000 core.asgi:application

back-admin:
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

clearpodman:
	(podman ps -aq | xargs -r podman rm -f) || exit 0
	(podman images -aq | xargs -r podman rmi -f) || exit 0

clearports:
	(lsof -ti :8080 | xargs -r kill -9) || exit 0
	(lsof -ti :8000 | xargs -r kill -9) || exit 0
	(lsof -ti :5173 | xargs -r kill -9) || exit 0

clearback:
	rm -rf back/venv

clearfront:
	rm -rf front/node_modules

fclear:
	$(MAKE) clearpodman
	$(MAKE) clearports
	$(MAKE) clearback
	$(MAKE) clearfront