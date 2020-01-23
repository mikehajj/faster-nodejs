Advanced Ubuntu 18.04 for Microservices built using NodeJs.
================================================================

Equipped with custom instructions overriding default Ubuntu file limits and maximum available ulimit and opened ports.

Packages:
--------------
- Ubuntu: 18.04
- NodeJs: Latest

Usage:
--------------
This image supports deploying Node.JS microservices after pulling the source code from a Github account.


You can deploy containers using this image by providing a list of environment variables and the main command to execute.

You can also provide a file that contains your environment variables instead of specifying them one by one.

```
> docker swarm init
> printf "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" | docker secret create ms_git_password -
> docker service create --name my_nodejs_microservice\
  --secret source=ms_git_password,target=/opt/secrets/ms_git_password\
  --env-file=./myenv.txt\
  --workdir="/opt/deployer"\
  mikehajj/ms-nodejs\
  bash -c '/opt/deployer/run.sh'
```
**Note:**
In order to make sure your github password is not visible and protected, create a secret then set the path of that secret to the environment variable named 'MS_GIT_PASSWORD' (Look at the examples).

Content of "myenv.txt"
---------------------------------
Export the following environment variables in your file and supply it to the create service docker command.
```
export MS_GIT_USERNAME=%github_username%
export MS_GIT_PASSWORD=%github_token%
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
export MS_GIT_PASSWORD=/opt/secrets/ms_git_password
export MS_GIT_REPO=my_repo
```

In this case, the deployer will:
```
1- clone the repo from 'master' branch
2- cd /opt/%repo%/
3- npm install
4- node . 
```
No memory limit will be applied.

Full Example
---------------------------------
In this example, we can set all the allowed environment variables and have full control over the deployer behavior.
```
export MS_GIT_USERNAME=mikehajj
export MS_GIT_PASSWORD=/opt/secrets/ms_git_password
export MS_GIT_REPO=my_repo
export MS_GIT_BRANCH=master
export MS_SERVICE_PATH=/
export MS_MEMORY_LIMIT=500
export MS_LAUNCH_CMD=npm start
```