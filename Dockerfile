FROM node:22.13.0

WORKDIR /app
COPY . .
#RUN npm i yarn
#RUN yarn global add @angular/cli@latest

RUN yarn && yarn add moment && yarn add vis-util && npm run build --prod --build-optimizer
#RUN ng build --prod --outputPath=dist/www/en --baseHref=/ --i18nLocale=en --verbose=true
RUN npm run compress:brotli
#RUN npm run compress:gzip

WORKDIR /app/dist
COPY assets/iGOT/client-assets/dist www/en/assets

RUN echo '{ \
  "name": "fusion-server", \
  "version": "1.0.0", \
  "scripts": { \
    "serve:prod": "node server.js" \
  }, \
  "dependencies": { \
    "express": "^4.18.2", \
    "compression": "^1.7.4", \
    "express-healthcheck": "^0.1.0" \
  } \
}' > package.json

RUN npm install --legacy-peer-deps --force --production
COPY server.js .

EXPOSE 3004

CMD [ "npm", "run", "serve:prod" ]

