#!/bin/sh



#create AWS key
node deploycode/create-key.js

#deploy infrastructure
cd deployingrastructure
cdk synth
cdk deploy

#deploy code to the machines

cd ..
cd deploycode
node deploy-code.js

