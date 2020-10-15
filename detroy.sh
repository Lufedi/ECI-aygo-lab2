#!/bin/sh

cd deployinfrastructure
yes | cdk destroy -y
rm deploycode/key.pem
