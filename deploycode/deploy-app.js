const AWS = require("aws-sdk");
const path = require("path")
const { NodeSSH } = require('node-ssh');
const { exit } = require("process");


const sleep = ms => new Promise((resolve) => { setTimeout(resolve, ms) })






AWS.config.update({region:'us-west-2'});

const getInstances =  async () => {
    //wait for Infrastructure to finish running the instances
    console.log("waiting for infra ...")
    await sleep(40000)

    const ec2 = new AWS.EC2()
    const response = await ec2.describeInstances().promise()
    
    const instances = response.Reservations.map(data => 
         data.Instances.filter(
             instance => instance.Tags.filter(tag => tag.Key === "Name" && tag.Value === "Lab2IacStack/aygolab2-ASG").length > 0
        )
    )
    .flat()
    .filter(({ PublicDnsName }) => !!PublicDnsName)
    .map(({ PublicDnsName }) => ({ PublicDnsName }))

    console.log("Instances found")
    console.log(instances)

    return instances
}


const copyFiles = async (sshConnection ) => {
  console.log("Copying files ...")
  const failed = []
  const successful = []
  const appPath = path.resolve(__filename, "../../lab2app")


  const status = await sshConnection.putDirectory(appPath, '/home/ec2-user/lab2app', {
    recursive: true,
    concurrency: 10,
    validate: function(itemPath) {
      const baseName = path.basename(itemPath)
      return baseName.substr(0, 1) !== '.' && // do not allow dot files
             baseName !== 'node_modules' // do not allow node_modules
    },
    tick: function(localPath, remotePath, error) {
      if (error) {
        failed.push(localPath)
      } else {
        successful.push(localPath)
      }
    }

  })

  if(!status || failed.length > 0){
    throw Error("Something wrong happened copying some files")
  }

  console.log('the directory transfer was', status ? 'successful' : 'unsuccessful')
  console.log('failed transfers', failed.join(', '))
  console.log('successful transfers', successful.join(', '))
}

const runCommands = async (ssh, commands) => {
  for(const command of commands) {
    console.log("-----------------------")
    console.log("ssh: " + command)
    const result = await ssh.execCommand(command)
    console.log("stdout: " + result.stdout)
    console.log("stderr: " + result.stderr)
    await sleep(4000)
  }
}

const initializeInstances = async (instances) => {    
  const INSTALL_DOCKER_COMMANDS = [
    "sudo yum update -y",
    "sudo yum install docker -y",
    "sudo service docker start",
    "sudo usermod -a -G docker ec2-user",
    "sudo docker info",
  ]

  const CLONE_PROJECT = [
    "sudo yum install git -y",
    "git clone https://github.com/Lufedi/ECI-aygo-lab2.git"
  ]

  const RUN_IMAGE_COMMANDS = [
    "cd ECI-aygo-lab2/lab2app && sudo docker build -t lufedi/lab2app .",
    "sudo docker run -p 80:80 -d lufedi/lab2app"
  ]


  for(const instance of instances) {
    console.log(`Copying and running app in ${instance.PublicDnsName}` )
    const ssh = new NodeSSH()
    await ssh.connect({
        host: instance.PublicDnsName,
        username: 'ec2-user',
        privateKey: './key.pem'
    })
    
    //TODO refactor this
    await runCommands(ssh,INSTALL_DOCKER_COMMANDS)
    await runCommands(ssh,CLONE_PROJECT)
    await runCommands(ssh,RUN_IMAGE_COMMANDS)   
    console.log("App running! in " + instance)
  }
 
}


AWS.config.getCredentials(async function(err) {
  if (err) {
    console.log("Your credentials could not be validated")
    console.log(err.stack);
  } else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
    const instances = await getInstances()
    await initializeInstances(instances)
    console.log("finsidh")
    exit()
  }
});
 

