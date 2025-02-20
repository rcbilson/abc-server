SHELL=/bin/bash
SERVICE=music

.PHONY: up
up: docker
	/n/config/compose up -d ${SERVICE}

.PHONY: docker
docker:
	docker build . -t rcbilson/${SERVICE}

.PHONY: frontend
frontend:
	cd frontend && yarnpkg run build && cd -

.PHONY: backend
backend:
	cd backend && GOBIN=${PWD}/bin go install knilson.org/musicserver/cmd/musicserver && cd -
