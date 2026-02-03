FROM node:22.13.0

WORKDIR /app
COPY . .

RUN yarn && yarn add moment && yarn add vis-util && npm run build --prod --build-optimizer
RUN npm run compress:brotli

WORKDIR /app/dist

COPY assets-dist www/en/assets

# Create a minimal package.json for serving in the dist folder
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

# Copy the server file to dist folder
COPY server.js .

EXPOSE 3004

CMD [ "npm", "run", "serve:prod" ]