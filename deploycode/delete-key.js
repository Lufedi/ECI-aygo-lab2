const AWS = require("aws-sdk")

AWS.config.update({region: 'us-west-2'});

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
ec2.deleteKeyPair({
    KeyName: "AYGOLAB2"
}, (err, data) => {
    if(err){
        console.error("An error ocurred deleting the key");
    } else {
        console.log("Key deleted");
    }
})