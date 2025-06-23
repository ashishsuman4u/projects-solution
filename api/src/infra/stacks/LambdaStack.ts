import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { Handler, Integration } from '../../types';
import { ISecurityGroup, IVpc, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import 'dotenv/config';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

interface LambdaStackProps extends StackProps {
  handlers: Handler[];
  lambdaSecurityGroup: ISecurityGroup;
}

export class LambdaStack extends Stack {
  public readonly integrations: Integration[] = [];
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);
    const vpc = Vpc.fromLookup(this, 'project_vpc', {
      vpcId: process.env.CDK_DEFAULT_VPC_ID,
      isDefault: false,
    });
    for (let index = 0; index < props.handlers.length; index++) {
      const handler = props.handlers[index];
      const lambda = new NodejsFunction(this, handler.id, {
        runtime: Runtime.NODEJS_22_X,
        handler: 'handler',
        entry: join(__dirname, '..', '..', 'services', handler.fileName ?? ''),
        vpc: vpc,
        securityGroups: [props.lambdaSecurityGroup],
        vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
        environment: {
          DYNAMODB_TABLE_NAME: 'connections',
          DB_NAME: 'projects',
          DB_USERNAME: 'postgres',
          DB_PASSWORD: 'DB_PASSWORD', //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME
          RDS_ENDPOINT: 'RDS_ENDPOINT', //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME
          SOCKET_API_URL: 'SOCKET_API_URL', //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME
          USER_POOL_ID: 'USER_POOL_ID', //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME
        },
      });
      if (handler.policyStatements) {
        handler.policyStatements.forEach((policy) => {
          lambda.addToRolePolicy(policy);
        });
      }
      this.integrations.push({
        id: handler.id,
        lambdaFunction: lambda,
      });
    }
  }
}
