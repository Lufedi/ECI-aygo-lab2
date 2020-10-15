#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { Lab2IacStack } = require('../lib/lab2iac-stack');

const app = new cdk.App();
new Lab2IacStack(app, 'Lab2IacStack');
