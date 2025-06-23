import { CfnOutput, Duration, RemovalPolicy, SecretValue, Stack, StackProps } from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { Integration } from '../../types';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  ISecurityGroup,
  IVpc,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  DatabaseProxy,
  ParameterGroup,
  PostgresEngineVersion,
  ProxyTarget,
} from 'aws-cdk-lib/aws-rds';
import 'dotenv/config';
import { SslPolicy } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { SSLMethod } from 'aws-cdk-lib/aws-cloudfront';

export class RDSStack extends Stack {
  public readonly dbCredentialsSecret: ISecret;
  public readonly lambdaSecurityGroup: ISecurityGroup;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    if (props) {
      const vpc = Vpc.fromLookup(this, 'project_vpc', {
        vpcId: process.env.CDK_DEFAULT_VPC_ID,
        isDefault: false,
      });

      const rdsSecurityGroup = new SecurityGroup(this, 'rdsSecurityGroup', {
        vpc: vpc,
        description: 'Allow Lambda access to RDS',
      });

      this.lambdaSecurityGroup = new SecurityGroup(this, 'lambdaSecurityGroup', {
        vpc: vpc,
        description: 'Allow Lambda access to RDS',
      });

      // RDS Instance
      const dbInstance = new DatabaseInstance(this, `${id}-RDS`, {
        engine: DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_17_2 }),
        vpc: vpc,
        securityGroups: [rdsSecurityGroup],
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
        credentials: Credentials.fromPassword('postgres', SecretValue.unsafePlainText(process.env.DB_PASSWORD ?? '')),
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
        multiAz: false,
        allocatedStorage: 20,
        publiclyAccessible: true, //Not a good idea
        databaseName: 'projects',
        removalPolicy: RemovalPolicy.DESTROY,
        deleteAutomatedBackups: true,
        autoMinorVersionUpgrade: true,
      });

      dbInstance.connections.allowFrom(this.lambdaSecurityGroup, Port.tcp(5432));
    }
  }
}
