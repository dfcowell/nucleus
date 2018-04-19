FROM node:8.10

RUN apt-get update && apt-get install -y rpm createrepo apt-utils dpkg-dev gnupg

COPY . /opt/service/
WORKDIR /opt/service

RUN npm rebuild
RUN npm run build-fe-prod
RUN npm run build-server
#RUN npm prune --production

EXPOSE 8080

ENTRYPOINT ["/opt/service/entrypoint.sh"]