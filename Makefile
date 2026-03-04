dev:
	docker compose -f docker-compose.yml up --build

prod:
	docker compose -f docker-compose.prod.yml up --build -d

stop:
	docker compose -f docker-compose.yml down
	docker compose -f docker-compose.prod.yml down

clean-db:
	docker volume rm 6ixresolve_postgres_data