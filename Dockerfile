# Base image
FROM node:16-alpine

# Working directory
WORKDIR /app

# our package.json not change often 
# so we dont need to run below two command
# every time our codebase change
# for more optimization 
COPY package* .

RUN npm install

# Copy over files
COPY . .

EXPOSE 3001

# above things run when create a image

# below run when start the container
CMD [ "node", "index.js" ]