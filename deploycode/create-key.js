const fs = require("fs")

// Load the AWS SDK for Node.js
const { FSx } = require('aws-sdk');
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-west-2'});

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

var params = {
   KeyName: 'AYGOLAB2'
};

// Create the key pair
ec2.createKeyPair(params, function(err, data) {
   if (err) {
      console.log("Error", err);
   } else {
        fs.writeFileSync("key.pem",data.KeyMaterial)
   }
});