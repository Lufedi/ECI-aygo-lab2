const AWS = require("aws-sdk");
const path = require("path")
const { NodeSSH } = require('node-ssh');
const { exit } = require("process");

AWS.config.update({region:'us-west-2'});

const getInstances =  async () => {
    const ec2 = new AWS.EC2()
    const response = await ec2.describeInstances().promise()
    
    const instances = response.Reservations.map(data => 
         data.Instances.filter(
             instance => instance.Tags.filter(tag => tag.Key === "Name" && tag.Value === "Lab2IacStack/aygolab2-ASG").length > -1
        )
    )
    .flat()
    .map(({ PublicDnsName }) => ({ PublicDnsName }))

    console.log("Instances found")
    console.log(instances)

    return instances
}


/*const copyFiles = async (sshConnection ) => {
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
}*/

const runCommands = (ssh, commands) => {
  return Promise.all(commands.map( async command => {
    console.log("ssh: " + command)
    const result = await ssh.execCommand(command)
    console.log(result.stdout)
    console.log(result.stderr)
  }))
}

const initializeInstances = async (instances) => {    
  const INSTALL_DOCKER_COMMANDS = [
    "sudo yum update -y",
    "sudo yum install docker -y",
    "sudo service docker start",
    "sudo usermod -a -G docker ec2-user",
    "docker info",
  ]

  const CLONE_PROJECT = [
    "sudo yum install git -y",
    "git clone "
  ]

  const RUN_IMAGE_COMMANDS = [
    "cd /home/ec2-user/lab2app && docker build -t lufedi/lab2app .",
    "docker run -p 80:80 -d lufedi/lab2app"
  ]

  await Promise.all(instances.map( async instance => {

      console.log(`Copying and running app in ${instance.PublicDnsName}` )
      const ssh = new NodeSSH()
      await ssh.connect({
          host: instance.PublicDnsName,
          username: 'ec2-user',
          privateKey: './key.pem'
      })
      
      //TODO refactor this
      await runCommands(ssh,INSTALL_DOCKER_COMMANDS)
      
      await runCommands(ssh,INSTALL_DOCKER_COMMANDS)   
      console.log("App running!")
  }))  
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
 

