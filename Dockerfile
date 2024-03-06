FROM node:20.11.0
WORKDIR /app
COPY ["package.json","package-lock.json*","./"]
RUN npm install
COPY . . 
CMD ["npm","run","dev"]