FROM node:12.13.1-alpine3.10
WORKDIR /server
COPY ./server /server/
RUN npm i --registry=https://registry.npm.taobao.org
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["npm", "run","start"]
