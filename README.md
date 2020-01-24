# Faster NodeJs 12.x
This repository builds a Docker image that provides a performance-tuned Ubuntu 18:04 server with Node.Js installed on it.
This image starts from the high performance ( [Docker Ubuntu 18:04](https://hub.docker.com/r/mikehajj/faster-ubuntu) ) image.
Then it installs Node.Js 12.x and creates a deployer that facilitates deploying Node.Js applications.
The deployer supports pulling source code from github (public/private) or using NPM.

### Operating system:
- Ubuntu: 18.04

### Packages:
- Node.Js: 12.x

# Examples
This image supports deploying Node.Js code after pulling the source code from a Github account.
You can deploy containers using this image by providing a list of environment variables and the main command to execute.
You can also provide a file that contains your environment variables instead of specifying them one by one.
The logs of the Node.Js code are piped to the container's foreground main process and can be read by tailing the logs of the container.

**Deploying From a Private Github Repo**
```
# start docker swarm
> docker swarm init

# create a secret that contains your github token
> printf "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" | docker secret create ms_git_password -

# create a service and consume the secret
> docker service create --name my_nodejs_microservice\
  --secret source=ms_git_password,target=/etc/secrets/ms_git_password\
  --env-file=./myenv.txt\
  --workdir="/opt/deployer"\
  mikehajj/faster-nodejs\
  bash -c '/opt/deployer/run.sh'
```
**Note:**
In order to make sure your github password is not visible and protected, create a secret then set the path of that secret to the environment variable named 'MS_GIT_PASSWORD' (Look at the examples).

**Deploying From a Public Github Repo**
```
# start docker swarm
> docker swarm init

# create a service
> docker service create --name my_nodejs_microservice\
  --env-file=./myenv.txt\
  --workdir="/opt/deployer"\
  mikehajj/faster-nodejs\
  bash -c '/opt/deployer/run.sh'
```

Content of "myenv.txt"
---------------------------------
Export the following environment variables in your file and supply it to the create service docker command.
```
export MS_GIT_USERNAME=%github_username%
export MS_GIT_PASSWORD=%github_token% [Optional, Default='']
export MS_GIT_REPO=%github_repo%
export MS_GIT_BRANCH=%github_branch% [Optional, Default='']
export MS_SERVICE_PATH=%relative path to service entry point% [Optional, Default='']
export MS_MEMORY_LIMIT=%memory limit% [Optional, Default=null]
export MS_LAUNCH_CMD=%service start command% [Optional, Default='/usr/bin/node . ']
```

Simplified Example
---------------------------------
In this example, we only export the mandatory env variables.
```
export MS_GIT_USERNAME=mikehajj
export MS_GIT_REPO=my_repo
```

In this case, the deployer will:
```
1- clone the repo from 'master' branch
2- cd /opt/%repo%/
3- npm install
4- node . 
```
No memory limit will be applied, the repo is public, no need to provide github token.

Full Example
---------------------------------
In this example, we can set all the allowed environment variables and have full control over the deployer behavior.
```
export MS_GIT_USERNAME=mikehajj
export MS_GIT_PASSWORD=/etc/secrets/ms_git_password
export MS_GIT_REPO=my_repo
export MS_GIT_BRANCH=master
export MS_SERVICE_PATH=/
export MS_MEMORY_LIMIT=500
export MS_LAUNCH_CMD=npm start
```
**Note:**
In the final example, we specified the value of the github password to be the location of where the secret will be consumed by the service. We also specified the branch to pull from, a custom path inside the repository to change the directory to, enforced a limit on the Node.JS process to use a maximum of 500MB and finally, set a custom launch command.