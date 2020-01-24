FROM mikehajj/faster-ubuntu:latest
MAINTAINER Mike Hajj <mike@mikehajj.com>

ENV NODE_ENV=production

RUN echo "Installing Node.JS Latest ..."
RUN echo "-----------------------------------------------"
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update
RUN apt-get install --fix-missing -y nodejs
RUN echo "-> Node.JS Installed"
RUN nodejs -v
RUN npm -v

RUN echo "Attaching Deployer Files"
RUN echo "-----------------------------------------------"
RUN mkdir -p /opt/deployer
ADD ./deployer /opt/deployer
RUN echo "-> Deployer attached @ /opt/deployer/"

RUN echo "==============================================="
RUN echo "Image Building Completed, Enjoy!"

CMD ["/bin/bash"]