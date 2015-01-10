# DOCKER-VERSION 0.3.4

# Get OS and packages
FROM	ubuntu:14.04

RUN	apt-get update; apt-get install -y \
		nodejs=0.10* \
		npm=1.3.10*


# Get nodejs packages. It's weird to copy 1 file first, but npm install takes a
# long time and this makes it only happen when package.json changes
COPY	./package.json /src/
WORKDIR /src
RUN npm install

# Copy the rest of the files over and run
EXPOSE 80
COPY . /src

CMD ["nodejs", "teledraw.js"]
