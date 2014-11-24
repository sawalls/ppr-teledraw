# DOCKER-VERSION 0.3.4

FROM	ubuntu:latest

# Setting the DEBIAN_FRONTEND variable is required to not get prompts
RUN	DEBIAN_FRONTEND=noninteractive \
	/bin/bash -c 'apt-get update -y; apt-get install -y nodejs npm'

# Copy this folder (on the host machine) to /src (in the container)
COPY	. /src

# Install dependencies from package.json
RUN cd /src; npm install

EXPOSE 80

CMD ["nodejs", "/src/teledraw.js"]
