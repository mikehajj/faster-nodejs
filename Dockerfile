FROM ubuntu:18.04
MAINTAINER Mike Hajj <mike.hajj@gmail.com>

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

RUN echo "Upgrading OS max File Limits and uLimits"
RUN echo "-----------------------------------------------"
RUN echo "-> Override default file limits"
ADD ./limits.conf /etc/security/limits.conf

RUN echo "-> Override default cached session"
ADD ./common-session /etc/pam.d/common-session

RUN echo "-> Override default ports limits"
ADD ./sysctl.conf /etc/sysctl.conf

RUN echo "Installing Dependencies Modules ..."
RUN echo "-----------------------------------------------"
RUN echo "-> ( vim, git, curl, unzip, make, g++, build-essentials, software-properties-common )"
RUN apt-get update
RUN apt-get install --fix-missing -y vim git curl build-essential software-properties-common unzip make g++

RUN echo "Installing Node.JS Latest ..."
RUN echo "-----------------------------------------------"
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install --fix-missing -y nodejs
RUN echo "-> Node.JS Installed"
RUN nodejs -v
RUN npm -v

RUN echo "Attaching Deployer Files"
RUN echo "-----------------------------------------------"
RUN mkdir -p /opt/secrets
RUN mkdir -p /opt/deployer
ADD ./deployer /opt/deployer
RUN echo "-> Deployer attached @ /opt/deployer/"

RUN echo "==============================================="
RUN echo "Image Building Completed, Enjoy!"

CMD ["/bin/bash"]