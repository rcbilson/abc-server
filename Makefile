docker:
	sudo DOCKER_BUILDKIT=1 docker build -t music_server .

frontend:
	cd src/frontend && yarnpkg run build && cd -

backend:
	cd src/backend && GOBIN=${PWD}/bin go install knilson.org/musicserver/cmd/musicserver && cd -
