
const ec2 = require("@aws-cdk/aws-ec2");
const autoscaling = require("@aws-cdk/aws-autoscaling");
const cdk = require('@aws-cdk/core');
const { Tags } = require("@aws-cdk/core");
const { SubnetType } = require("@aws-cdk/aws-ec2");

class Lab2IacStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  stackName = "aygolab2"
  keyPairName = "AYGOLAB2"
  securityGroup = null;
  vpc = null;


  createAutoScalingGroup() {
    const asGroup = new autoscaling.AutoScalingGroup(this, `${this.stackName}-ASG`, {
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
      keyName: this.keyPairName,
      securityGroup: this.securityGroup,
      minCapacity: 3,
      maxCapacity: 4,
      associatePublicIpAddress: true,
      vpcSubnets: { subnetType: SubnetType.PUBLIC},
    });
  }

  createSecurityGroup() {
    this.securityGroup = new ec2.SecurityGroup(this, 
      `${this.stackName}-sg`, {
        vpc: this.vpc,
        allowAllOutbound: true,
      });
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH from anywhere');
    this.securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'web');
  }

  buildVPC() {
    this.vpc = new ec2.Vpc(this, `${this.stackName}-vpc`);
  }

  
  constructor(scope, id, props) {
    super(scope, id, props);

    Tags.of(scope).add("stack", this.stackName);
    this.buildVPC();
    this.createSecurityGroup();
    this.createAutoScalingGroup();

  }


  get availabilityZones() {
    return ['us-west-2a', 'us-west-2b'];
  }



}

module.exports = { Lab2IacStack }
