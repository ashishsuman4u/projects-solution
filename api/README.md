# Welcome to Projects Api

This is a sample project that uses AWS Cognito to authenticate. AWS RDS Postgres for RBAC

To Setup this project, we will first need to install aws-cdk globally on our local machine.

# Environment variable

- FRONTEND_BASEURL - example 'http://localhost:3000'
- CDK_DEFAULT_REGION- example 'us-east-1'
- CDK_DEFAULT_ACCOUNT- AWS Account ID
- CDK_DEFAULT_VPC_ID - AWS VPC ID
- DB_NAME- example "projects"
- DYNAMODB_TABLE_NAME- example "connections"
- DB_USERNAME- example "postgres"
- DB_PASSWORD="vy.QjZJdC9Epf4" //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME
- RDS_ENDPOINT- example "projectrdsstack-projectrdsstackrds9e53bd9a-oxmy3rtilyso.cmvuku8gqciw.us-east-1.rds.amazonaws.com" //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME
- USER_POOL_ID - Cognito user pool arn to be used for cognito authorizer. //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME
- SOCKET_API_URL- "https://{api-id}.execute-api.{region}.amazonaws.com/{stage}" //TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
- `npx cdk destroy` destroy this stack in your default AWS account/region

# Setup Steps -

The backend Apis needs to be deployed on AWS for the project to work.

- Go to `api` folder and install all dependencies using `npm install`
- Create project VPC and attach private subnets with Nat Gateway for accessing the internet.
- Create a .env file with the above mentioned environment variables and update them with the expected values.
- Execute `npx cdk deploy` to deploy the stack
- Once deployed, go the region of the deployment and AWS RDS.
- Open the RDS security group and add an inbound rule for your IP for post `5432`. This will help you to execute the SQL script added in `script` folder. You will need to change the email id at the last of the script.
- Connect PGAdmin to AWS using the credentials that you have added in the env file.
- Execute the SQL script to create the base tables and data to support RBAC.
- Go to AWS Cognito and create the super-admin user with verified email and temp password using the same use email which was used in the SQL script.
- Update lambda's environment variables marked as "TO BE REPLACED MANUALLY FOR NOW. WE CAN USE SSM FOR THE SAME" with deployed resources value.
