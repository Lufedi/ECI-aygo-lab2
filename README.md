# ECI-aygo-lab2

This is a small laboratory of the course "AYGO" at Escuela Colombiana de Ingeniería Julio Garavito and part of the Informatics's master degree.


#### Objetives

Create a simple reactive application and build a script to deploy it automatically to AWS EC2 instances

#### Project structure
```
- deploycode : This folder contains the scripts required to deploy the web app to the AWS infrastructure
- deployinfrastructure: This folder contains the scripts to provision the infrastructure in our AWS account
- lab2app : webapp built in expresjs
- pipeline.sh: entrypoint of this project, this will simulate a pipeline to provision the infrastructure and deploy our app to that infrastructure.
- destroy.sh : script to destroy all the AWS resources and the keys created locally.

```



#### Solution

The solution is composed of a variety of tools:  `AWS-cdk` , `AWS-sdk` and `expressjs`.


##### The web-app
The app is a simple `nodejs` application built with the `expressjs` framework, this app can be extended but most of the effort of this laboratory was spent in the other components.


##### The Pipeline

From this point the [pipeline](https://github.com/Lufedi/ECI-aygo-lab2/blob/main/pipeline.sh)  is just a `bash` script that will help us to provision the infrastructure and deploy our application to that infrasctructure.

The pipeline is split in 3 stages
1. Create AWS Key
2. Provision the infrastructure
3. Deploy code
   

###### 1. Create AWS Key
This is a `nodejs` script that is using `aws-sdk` to create a Key pair, this is required later when creating the EC2 instances

###### 2. Provision the Infrastructure
This  step is using `aws-cdk` to create the EC2 instances and all the other components around them (VPN, PublicIP, Security groups, etc). AWS-CDk is a tool to define Infrastructure as Code, so first we need to compile the code running `cdlk synth`, this will generate a Cloudformation template, then we can create the resources in our AWS account with the command `cdk deploy`.

###### 3. Deploy code
This is a `nodejs` script that is using `aws-sdk` to obtain the access information of the instances created in the devious step, then using a ssh client(node-ssh) the script will download all the required dependencies to download, build and run the application (docker, npm, git) 


