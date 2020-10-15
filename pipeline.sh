#!/bin/sh



#create AWS key
cd deploycode
node create-key.js

#deploy infrastructure
cd ../deployinfrastructure
cdk synth
cdk deploy --require-approval never

#deploy code to the machines
cd ../deploycode
node deploy-app.js
