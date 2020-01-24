#! /bin/bash

echo "###########################################################"
echo "# Initializing Deployer ..."
echo "###########################################################"

echo "-> Creating new Logs Directory ...."
mkdir -p /opt/logs/
echo "-> Logs Directory created at /opt/logs/ ...."

echo "###########################################################"
echo "# Starting Microservice ..."
echo "###########################################################"

export MS_NODE_BIN="$(which node)"
export MS_NPM_BIN="$(which npm)"
export MS_GIT_BIN="$(which git)"

#node /opt/deployer/start.js
node ./start.js