FROM node:10.15

ENV APP_HOME /opt/gi-visualizer

RUN mkdir -p $APP_HOME && \
 mkdir -p $APP_HOME/uploads && \
 chown -R node:node $APP_HOME

VOLUME /opt/gi-visualizer/uploads

EXPOSE 3000

WORKDIR /opt/gi-visualizer
USER node
ADD package.json .
ADD package-lock.json .
RUN npm install

ADD /api $APP_HOME/api
ADD /frontend $APP_HOME/frontend
ADD /migrations $APP_HOME/migrations
ADD .babelrc $APP_HOME/
ADD index.html $APP_HOME/
ADD knexfile.js $APP_HOME/
ADD server.js $APP_HOME/

RUN npm run build

CMD npm run migrate && npm run start