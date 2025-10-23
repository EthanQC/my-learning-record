# apps/api/Dockerfile
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY . .
RUN apk add --no-cache git && go build -o /out/api ./cmd/server

FROM alpine:3.20
WORKDIR /app
COPY --from=build /out/api /app/api
EXPOSE 9000
ENV ADDR=0.0.0.0:9000
CMD ["/app/api"]
