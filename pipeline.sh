#!/bin/sh



#create AWS key
node deploycode/create-key.js

#deploy infrastructure
cd deployinfrastructure
cdk synth
yes | cdk deploy

#deploy code to the machines
cd ../deploycode
node deploy-app.js
