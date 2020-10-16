#!/bin/sh

cd deployinfrastructure
yes | cdk destroy -y
cd ../deploycode
node delete-key.js
rm key.pem
