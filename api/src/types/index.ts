import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface Handler {
  id: string;
  fileName: string;
  policyStatements?: PolicyStatement[];
}

export interface Integration {
  id: string;
  lambdaFunction: NodejsFunction;
}

export interface DBIntegration {
  lambdaIntegration?: Integration;
}

export interface RestAPIIntegration {
  resourceName: string;
  method: string;
  lambdaIntegration?: Integration;
}

export interface DBUser {
  tenantId: string;
  email: string;
  connectionId: string;
}

export interface UserData {
  userId: string;
  userEmail: string;
  tenantId: string;
  role: string;
  tokenString: string;
}

export interface Message {
  message?: string;
  to?: string;
  users?: DBUser[];
}

export interface MessageBody {
  user: UserData;
  message?: Message;
}
