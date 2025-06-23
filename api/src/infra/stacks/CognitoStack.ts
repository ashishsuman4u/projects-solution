import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  UserPool,
  UserPoolClient,
  StringAttribute,
  IUserPool,
  IUserPoolClient,
  AccountRecovery,
  UserPoolClientIdentityProvider,
  OAuthScope,
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { Integration } from '../../types';
import 'dotenv/config';

interface CognitoStackProps extends StackProps {
  userPoolName: string;
  preTokenHandler?: Integration;
}

export class CognitoStack extends Stack {
  public readonly userPool: IUserPool;
  public readonly userPoolClient: IUserPoolClient;
  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, id, {
      userPoolName: props.userPoolName,
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      keepOriginal: {
        /**
         * Whether the email address of the user
         * should remain the original value until
         * the new email address is verified.
         */
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        /**
         * This is cognito default policy.
         */
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(30),
      },
      removalPolicy: RemovalPolicy.DESTROY,
      customAttributes: {
        tenant_id: new StringAttribute({ mutable: true }),
        role: new StringAttribute({ mutable: true }),
      },

      accountRecovery: AccountRecovery.EMAIL_ONLY,
      lambdaTriggers: {
        preTokenGeneration: props.preTokenHandler?.lambdaFunction,
      },
    });

    this.userPool.addDomain(id, {
      cognitoDomain: {
        domainPrefix: id,
      },
    });

    this.userPoolClient = new UserPoolClient(this, `${id}-client`, {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        custom: true,
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        callbackUrls: [process.env.BASE_URL ?? 'http://localhost:3000/'],
        logoutUrls: [process.env.LOGIN_URL ?? 'http://localhost:3000/login'],
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      accessTokenValidity: Duration.minutes(20),
      idTokenValidity: Duration.minutes(15),
      refreshTokenValidity: Duration.hours(1),
    });

    new CfnOutput(this, 'userPoolArn', {
      value: this.userPool.userPoolArn,
    });
  }
}
