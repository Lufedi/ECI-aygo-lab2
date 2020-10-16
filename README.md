# ECI-aygo-lab2

This is a small laboratory of the course "AYGO" at Escuela Colombiana de Ingeniería Julio Garavito and part of the Informatics's master degree.




#### Objetives

Create a simple reactive application and build a script to deploy it automatically to AWS EC2 instances

#### Project structure

- deploycode : This folder contains the scripts required to deploy the web app to the AWS infrastructure
- deployinfrastructure: This folder contains the scripts to provision the infrastructure in our AWS account
- lab2app : webapp built in expresjs
- pipeline.sh: entrypoint of this project, this will simulate a pipeline to provision the infrastructure and deploy our app to that infrastructure.
- destroy.sh : script to destroy all the AWS resources and the keys created locally.




#### Solution

The solution is composed of a variety of tools:  `AWS-cdk` , `AWS-sdk` and `expressjs`.


#### Prerequisites

For running this project it's required to have installed and configured in your env
- aws-cli
- aws-cdk
- node >10 and npm > 6
- Aws account and aws credential configured (aws configure)

##### The web-app
The app is a simple `nodejs` application built with the `expressjs` framework, this app can be extended but most of the effort of this laboratory was spent in the other components.


##### The Pipeline

From this point the [pipeline](https://github.com/Lufedi/ECI-aygo-lab2/blob/main/pipeline.sh)  is just a `bash` script that will help us to provision the infrastructure and deploy our application to that infrasctructure.

The pipeline is split in 3 stages
1. Create AWS Key
2. Provision the infrastructure
3. Deploy code
   

###### 1. Create AWS Key
This is a `nodejs` [script](https://github.com/Lufedi/ECI-aygo-lab2/blob/main/deploycode/create-key.js) that is using `aws-sdk` to create a Key pair, this key is required later when creating the EC2 instances

![](https://drive.google.com/uc?export=view&id=1CbQnJOK9gslsOI1eGsDWApW3poG6ZaL4)

A private key will be also stored locally with the name `key.pem`, this will needed to connect via ssh to the EC2 instances.



###### 2. Provision the Infrastructure
This  step is using `aws-cdk` to create the EC2 instances and all the other components around them (VPN, PublicIP, Security groups, etc). AWS-CDk is a tool to define Infrastructure as Code, so first we need to compile the code running `cdk synth`, this will generate a Cloudformation template file locally.

This is an example of how to define a [security group](https://github.com/Lufedi/ECI-aygo-lab2/blob/main/deployinfrastructure/lib/lab2iac-stack.js#L35) using cdk constructs.

![](https://drive.google.com/uc?export=view&id=1b5w8mz_OS8x8AegD2IXEklChLFZkP0Ds)

Then we can create the resources in our AWS account with the command `cdk deploy`.
![](https://drive.google.com/uc?export=view&id=1X9iC7X8KiDIFshdqOZd0bD7h2pajE6CC)

Once the deployment has finished we can see a `CloudFormation` stack created with all the resources, in this case 29 resources where created including IAM roles, EC2 instances a VPN and a security group.

![](https://drive.google.com/uc?export=view&id=1t6DSEiJOjUwJ363AmET5VnfjGCAu5k8s)

###### 3. Deploy code
This is a `nodejs` script that is using `aws-sdk` to obtain the access information of the instances created in the devious step, then using a ssh client (node-ssh) the script will download, build and run the application (docker, npm, git) 


First the script finds all the instances created in the previous step using the tag "stackName"

![](https://drive.google.com/uc?export=view&id=1Nhlh_2PAydPRJFg0BphoVs2N_uelyX_c)

Then using a [node-ssh](https://www.npmjs.com/package/node-ssh) and the private key create in the step 1 a [bounch of commands](https://github.com/Lufedi/ECI-aygo-lab2/blob/main/deploycode/deploy-app.js#L80-L96) are executed to install docker and git, then this repository is downloaded, and finally the docker container is created running in with port 80.

Running docker service:
![](https://drive.google.com/uc?export=view&id=1SjQeqP-74fKKvFdr5lBcGLQvUJAFTIIi)

Running the container with port 80
![](https://drive.google.com/uc?export=view&id=1wc8MTOn-HDyNGJ-6SVrplLevofHPXK7q)

This step is repeated for each EC2 instance found.




#### The result

The web app is accessible from the EC2 public domain.

Testing the app after the `pipeline` finished


![](https://drive.google.com/uc?export=view&id=15GbNNQFD-rJKceOnGvn2VFo9knUuLDAY)

This application can be extended to any web application-


### TODO
- [x] Pipeline deployed
- [ ] Try Jenkins or another CI/CD tool
- [ ] Explore gitlab devops