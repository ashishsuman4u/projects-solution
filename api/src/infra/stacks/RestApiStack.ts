import { Stack, StackProps } from 'aws-cdk-lib';
import {
  RestApi,
  Cors,
  CfnAuthorizer,
  AuthorizationType,
  Authorizer,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { RestAPIIntegration } from '../../types';
import { IUserPool, UserPool } from 'aws-cdk-lib/aws-cognito';
import 'dotenv/config';

interface RestApiStackProps extends StackProps {
  id: string;
  integrations: RestAPIIntegration[];
  userPool: IUserPool;
}

export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props);

    const auth = new CognitoUserPoolsAuthorizer(this, 'upload-authorizer', {
      cognitoUserPools: [props.userPool],
    });

    const api = new RestApi(this, props.id);

    props.integrations.forEach((integration) => {
      if (integration.lambdaIntegration) {
        const uploadResource = api.root.addResource(integration.resourceName, {
          defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: Cors.ALL_METHODS,
            allowHeaders: Cors.DEFAULT_HEADERS,
          },
        });
        uploadResource.addMethod(
          integration.method,
          new LambdaIntegration(integration.lambdaIntegration.lambdaFunction),
          {
            authorizer: auth,
            authorizationType: AuthorizationType.COGNITO,
          }
        );
      }
    });
  }
}
