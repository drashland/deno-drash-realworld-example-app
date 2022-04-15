db:
	psql -h 0.0.0.0 -p 54320 -U user -d realworld --password

up-m1:
	docker-compose -f docker-compose.m1.yml build && docker-compose -f docker-compose.m1.yml up

up:
	sudo docker-compose build && sudo docker-compose up
