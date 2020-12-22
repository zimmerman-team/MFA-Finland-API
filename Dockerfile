# base
FROM node:alpine

WORKDIR /usr/src/app

# install packages
COPY package.json ./
# To handle 'not get uid/gid'
RUN npm install --silent

# copy src files
COPY . .

# expose app on port
EXPOSE 4200

# run
CMD ["sh","-c","npm run start-prod"]