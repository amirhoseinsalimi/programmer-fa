FROM node:14.19.1 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
COPY .env .env
RUN git clone https://github.com/vishnubob/wait-for-it.git
