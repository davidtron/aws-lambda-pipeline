# Simple template for AWS Lambda with API
Build status [![Circle CI](https://circleci.com/gh/davidtron/aws-lambda-pipeline/tree/master.svg?style=svg)](https://circleci.com/gh/davidtron/aws-lambda-pipeline/tree/master)

A simple and reproducible walkthrough to create a CORS enabled API backed by a nodejs function running on Amazon Lambda.
The idea is to have as much of this configured programmatically (ie reproducible) and checked into version control.

At present this relies on manually creating the API endpoint and lambda the first time before automating subsequent deployments.

Moving forward this could be done through the API or using of the [swagger import tool][AWS-swagger] and [serverless][serverless]

### Prerequisites, user accounts for AWS

1. Register for an AWS account and create an IAM admin account. [See AWS walkthrough][AWS-setup]
2. We need to create a user that can access AWS programmatically through the API. Log in as admin to IAM console: https://console.aws.amazon.com/iam/
3. Select Policies, Create Policy, Create Your Own Policy
   Name 'APIGatewayAccessPolicy'
   Description 'Provides access to all API Gateway actions and resources for the associated AWS account'

   Policy Document
   ```
   {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "apigateway:*"
        ],
        "Resource": [
          "*"
        ]
      }
    ]
  }
  ```

4. Select Groups, create new Group 'lambda-and-api'
5. From the policy list add 'AWSLambdaFullAccess' and 'APIGatewayAccessPolicy'
6. Select Users, Create New User 'ci-deploy' leave the 'Generate an access key for each user' checked
7. Select create, save the credentials.

8. We also need to set up a policy and role to allow that allows the API to execute a Lambda function
   In IAM console: https://console.aws.amazon.com/iam/ select Roles, click Create New Role
   Name 'APIGatewayLambdaInvokeRole'
   Select AWS Service Roles, Amazon EC2
   In the filter select AWSLambdaFullAccess

9. We need to associate this role with just API and not EC2.  In the list of roles, choose APIGatewayLambdaInvokeRole
10. Trust Relationships area, choose Edit Trust Relationship.
   Replace ec2.amazonaws.com with apigateway.amazonaws.com
   Press update trust policy

11. Create policy to allow lambda to execute code.
  Open the IAM console: https://console.aws.amazon.com/iam/.
  In the Details area, choose Policies.
  Choose Create Policy.
  Next to Create Your Own Policy, choose Select.
  For Policy Name, type a name for the policy (for example, APIGatewayLambdaExecPolicy).
  For Description, type Enables Lambda to execute code.
  For Policy Document, type the following, and then choose Create Policy.

  ```
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": [
          "logs:*"
        ],
        "Effect": "Allow",
        "Resource": "arn:aws:logs:*:*:*"
      }
    ]
  }
  ```

12. Create role to allow lambda to execute the code
  In the Details area, choose Roles.
  Choose Create New Role.
  In the Role Name box, type a name for the execution role 'APIGatewayLambdaExecRole', and then choose Next Step.
  Next to AWS Lambda, choose Select.
  Select APIGatewayLambdaExecPolicy

----
### Manually creating first API

Initially this is a copy of the [getting started][AWS-getting-started] walkthrough. I'd like for this to be done as part of the gulp deployment.

1. Go to the API console https://console.aws.amazon.com/apigateway/
2. If Get Started Now is displayed, choose it.
   If Create API is displayed, choose it.

3. Create name 'MyDemoApi'. Do not clone from existing API. Press Create API
4. Should see / Methods. Press Create Resource and give name 'demo', leave path as default /demo

----
### Manually creating first Lambda

Initially this is a copy of the [getting started][AWS-getting-started] walkthrough. I'd like for this to be done as part of the gulp deployment.

1. Open the Lambda console at https://console.aws.amazon.com/lambda/
  If a welcome page appears, choose Get Started Now.
  If the Lambda: Function list choose Create a Lambda function
  Skip the blueprint
  Name, type GetHelloWithName
  Description 'Returns hello world with name'

2. Paste in lambda code
 Leave handler as index.handler
 For Role, choose the Lambda execution role you created earlier, APIGatewayLambdaExecRole.
 Choose Create Lambda function.

3. Press test and change the body to be the event payload we are expecting
 ```
 {
   "name": "User"
 }
 ```

4. Configure the API to call this lambda. Go back to API gateway
  Select MyDemoAPI
  Click 2 Resources
  Select /demo and press Create Method
  Choose POST and press tick
  Chose Lambda integration, region (eu-west-1), type GetHelloWithName
  Allow API to call that Lambda

5. Test that its wired up correctly, press the POST link and then in the panel that is displayed press Test (with the lightening bolt beneath it).

6. Deploy the API
  Press Deploy API
  Select New Stage
  Give a stage name (ie prod or test) and descriptions
  Press Save changes

7. Test with curl

  ```sh
curl -H "Content-Type: application/json" -X POST -d '{ "operation" : "succeed", "payload" : { "radiohead" : "karma police" } }' https://fooo.execute-api.eu-west-1.amazonaws.com/test/demo
  ```
8. Enable CORS
  Select 'MyDemoAPI' and then \demo
  Press Enable CORS and use the default settings.
  If you have done this previously, delete the OPTIONS resource before retrying it.
  Once complete you have to Deploy API for it to take effect.

9. Simple jquery to test CORS
  ```javascript
    var data = { "radiohead" : "karma police" } };

    jQuery.ajax({
      url: 'https://fooo.execute-api.eu-west-1.amazonaws.com/test/demo',
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      success: function(resp){
          console.log(resp);
      }
    });
  ```

----

### Using this project

1. Clone the repo and npm install
2. Set up your AWS credentials in ~/.aws/credentials

```
[default]

aws_access_key_id = <key id you set up in step 7 of prequisites>
aws_secret_access_key = <key you set up in step 7 of prequisites>
region = eu-west-1
```

3. Update your lambda (in index.js and associated test in index-test.js)
4. Config for the lambda is in lambda-config.js
5. Test locally ```npm test``
6. Deploy from local ```node node_modules/gulp/bin/gulp.js deploy``` or if you have gulp installed globally ```gulp deploy```

### Auto deploy from circle CI

1. Register and connect to github
2. Select project (aws-lambda-pipeline)
3. Build
4. Set the IAM user 
    Project Settings -> Continuos Deployment -> AWS CodeDeploy

    Set the credentials that you have in your ~/.aws/credentials and that you configured in step 7. of prerequisites.




[AWS-setup]: <https://docs.aws.amazon.com/lambda/latest/dg/setting-up.html>
[AWS-getting-started]: <http://docs.aws.amazon.com/apigateway/latest/developerguide/getting-started.html>
[AWS-swagger]: <https://github.com/awslabs/aws-apigateway-importer>
[serverless]: <https://github.com/serverless/serverless>
