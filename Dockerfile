FROM golang:1.23-alpine AS build-server
WORKDIR /src
COPY backend/go.mod backend/go.sum .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download && go mod verify
COPY backend .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o /bin/musicserver ./cmd/musicserver

FROM node:23-bullseye AS build-frontend
WORKDIR /src/abcjs
COPY abcjs .
RUN yarn link
WORKDIR /src
COPY frontend/package.json frontend/yarn.lock .
RUN yarn link abcjs
RUN yarn install
COPY frontend .
RUN yarnpkg run build

FROM alpine:latest
COPY --from=build-frontend /src/build /app/frontend
COPY --from=build-server /bin /app/bin
EXPOSE 9092
ENV MUSICSERVER_PORT=9092
ENV MUSICSERVER_FILEPATH=/app/data
ENV MUSICSERVER_FRONTENDPATH=/app/frontend
CMD ["/app/bin/musicserver"]
