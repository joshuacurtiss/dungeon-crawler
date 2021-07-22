FROM node:12-alpine
WORKDIR /var/app
COPY package*.json tsconfig.server.json ./
RUN npm ci --only=production
ADD dist dist/
ADD src src/
EXPOSE 4000
CMD ["npm", "run", "server"]
