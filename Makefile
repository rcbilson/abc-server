.PHONY: docker
docker:
	sudo DOCKER_BUILDKIT=1 docker build -t music_server .

.PHONY: frontend
frontend:
	cd frontend && yarnpkg run build && cd -

.PHONY: backend
backend:
	cd backend && GOBIN=${PWD}/bin go install knilson.org/musicserver/cmd/musicserver && cd -
