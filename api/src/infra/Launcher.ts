import { App } from 'aws-cdk-lib';
import { LambdaStack } from './stacks/LambdaStack';
import { CognitoStack } from './stacks/CognitoStack';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RDSStack } from './stacks/RDSStack';
import { RestApiStack } from './stacks/RestApiStack';
import { WebSocketApiStack } from './stacks/WebSocketApiStack';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import 'dotenv/config';
import { DynamoDBStack } from './stacks/DynamoDBStack';

const app = new App();

const rds = new RDSStack(app, 'projectRDSStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const projectLambdas = new LambdaStack(app, 'projectLambdaStack', {
  handlers: [
    {
      id: 'preToken',
      fileName: 'preTokenHandler.ts',
    },
    {
      id: 'registerUser',
      fileName: 'registerUserHandler.ts',
      policyStatements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['cognito-idp:*'],
          resources: ['*'],
        }),
      ],
    },
    {
      id: 'createProject',
      fileName: 'createProjectHandler.ts',
    },
    {
      id: 'chat',
      fileName: 'chatHandler.ts',
      policyStatements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['dynamodb:*'],
          resources: ['*'],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['execute-api:*'],
          resources: ['*'],
        }),
      ],
    },
  ],
  lambdaSecurityGroup: rds.lambdaSecurityGroup,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const dynamodb = new DynamoDBStack(app, 'connectionDB', {
  integration: projectLambdas.integrations.find((integration) => integration.id === 'chat'),
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const cognito = new CognitoStack(app, 'projects-userpool', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  userPoolName: 'projects-userpool',
  preTokenHandler: projectLambdas.integrations.find((integration) => integration.id === 'preToken'),
});

new RestApiStack(app, 'projectApiStack', {
  id: 'projectApi',
  integrations: [
    {
      method: 'POST',
      resourceName: 'register',
      lambdaIntegration: projectLambdas.integrations.find((integration) => integration.id === 'registerUser'),
    },
    {
      method: 'POST',
      resourceName: 'project',
      lambdaIntegration: projectLambdas.integrations.find((integration) => integration.id === 'createProject'),
    },
  ],
  userPool: cognito.userPool,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new WebSocketApiStack(app, 'chatApiStack', {
  id: 'chatApi',
  lambdaIntegration: projectLambdas.integrations.find((integration) => integration.id === 'chat'),
  userPool: cognito.userPool,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
