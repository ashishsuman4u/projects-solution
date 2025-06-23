import { Stack, StackProps } from 'aws-cdk-lib';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { Integration } from '../../types';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import 'dotenv/config';
import {
  WebSocketApi,
  WebSocketAuthorizer,
  WebSocketAuthorizerType,
  WebSocketStage,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import 'dotenv/config';

interface WebSocketApiStackProps extends StackProps {
  id: string;
  lambdaIntegration?: Integration;
  userPool: IUserPool;
}

export class WebSocketApiStack extends Stack {
  constructor(scope: Construct, id: string, props: WebSocketApiStackProps) {
    super(scope, id, props);

    if (props.lambdaIntegration) {
      const webSocketApi = new WebSocketApi(this, props.id, {
        connectRouteOptions: {
          integration: new WebSocketLambdaIntegration('ConnectIntegration', props.lambdaIntegration.lambdaFunction),
        },
        disconnectRouteOptions: {
          integration: new WebSocketLambdaIntegration('DisconnectIntegration', props.lambdaIntegration.lambdaFunction),
        },
      });

      webSocketApi.addRoute('setUser', {
        integration: new WebSocketLambdaIntegration('SetUserIntegration', props.lambdaIntegration.lambdaFunction),
      });

      webSocketApi.addRoute('sendPublicMessage', {
        integration: new WebSocketLambdaIntegration(
          'SendPublicMessageIntegration',
          props.lambdaIntegration.lambdaFunction
        ),
      });

      webSocketApi.addRoute('sendPrivateMessage', {
        integration: new WebSocketLambdaIntegration(
          'SendPrivateMessageIntegration',
          props.lambdaIntegration.lambdaFunction
        ),
      });

      const apiStage = new WebSocketStage(this, 'v1', {
        webSocketApi,
        stageName: 'v1',
        autoDeploy: true,
      });
    }
  }
}
