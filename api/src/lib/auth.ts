import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

export default class Auth {
  cognito: CognitoIdentityProviderClient;
  constructor() {
    this.cognito = new CognitoIdentityProviderClient();
    console.log(this.cognito);
  }

  addUserToCognito = async (email: string, tenantId: string, role: string) => {
    const command = new AdminCreateUserCommand({
      UserPoolId: process.env.USER_POOL_ID!,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'custom:tenant_id', Value: tenantId },
        { Name: 'custom:role', Value: role },
      ],
    });
    console.log(command);
    return this.cognito.send(command);
  };
}
