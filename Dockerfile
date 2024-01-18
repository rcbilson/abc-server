FROM golang:1.21-alpine as build-server
WORKDIR /src
COPY backend/go.mod backend/go.sum .
RUN go mod download
COPY backend .
RUN go build -o /bin/musicserver ./cmd/musicserver

FROM node:19-bullseye as build-frontend
WORKDIR /src
COPY frontend/package.json frontend/yarn.lock .
RUN yarn install
COPY frontend .
RUN yarnpkg run build

FROM alpine:latest
COPY --from=build-frontend /src/build /app/frontend
COPY --from=build-server /bin /app/bin
EXPOSE 9092
ENV MUSICSERVER_PORT 9092
ENV MUSICSERVER_FILEPATH /app/data
ENV MUSICSERVER_FRONTENDPATH /app/frontend
CMD ["/app/bin/musicserver"]
