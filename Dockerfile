FROM python:3.10.12

WORKDIR /usr/nodeapp

COPY ./requirements.txt ./

RUN pip install -r requirements.txt

COPY ./package.json ./

# Download and install Node.js
RUN curl -sL https://nodejs.org/dist/v18.9.1/node-v18.9.1-linux-x64.tar.xz -o node-v18.9.1-linux-x64.tar.xz \
    && tar -xf node-v18.9.1-linux-x64.tar.xz \
    && mv node-v18.9.1-linux-x64 /usr/local/nodejs \
    && rm node-v18.9.1-linux-x64.tar.xz

# Set the PATH environment variable
ENV PATH="/usr/local/nodejs/bin:$PATH"
# Specify the desired version of npm
ARG NPM_VERSION=9.8.0
# Install the specified version of npm
RUN npm install -g npm@$NPM_VERSION

RUN npm install

COPY ./ ./

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0

CMD [ "npm", "start" ]