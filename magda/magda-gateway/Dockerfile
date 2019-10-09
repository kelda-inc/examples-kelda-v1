FROM node:10

RUN mkdir -p /usr/src/app/component
COPY . /usr/src/app/component
WORKDIR /usr/src/app/component
ENTRYPOINT [ "node", "/usr/src/app/component/src/index.js" ]
