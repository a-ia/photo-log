FROM node:20-slim

WORKDIR /app

# install system dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# copy package files
COPY package*.json ./

# install dependencies and rebuild better-sqlite3
RUN npm install && npm rebuild better-sqlite3

# copy application files
COPY . .

# create uploads directory
RUN mkdir -p uploads

# create volume mount points
VOLUME ["/app/uploads", "/app/data"]

EXPOSE 8228

CMD ["npm", "start"]


#FROM node:20-slim

#WORKDIR /app

# install system dependencies for better-sqlite3
#RUN apt-get update && apt-get install -y \
#    python3 \
#    build-essential \
#    && rm -rf /var/lib/apt/lists/*

# copy package files
#COPY package*.json ./

# install dependencies
#RUN npm install

# copy application files
#COPY . .

# create uploads directory
#RUN mkdir -p uploads

# create volume mount points
#VOLUME ["/app/uploads", "/app/data"]

#EXPOSE 8228

#CMD ["npm", "start"]
