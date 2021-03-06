# What is it?

This tool will help you report upon quantities of AWS resources as discovered by the [AWS Config Service](https://aws.amazon.com/config/)

# Pre-requisites

To use this tool, you must install both NodeJS and configure the AWS Config service for recording in the regions where you wish to discover resources. You must also configure credentials for the script to use when communicating with the AWS Config Service

*   Step 1 - Install NodeJs

    NodeJS can be installed for your operating systems by following [These Instructions](https://nodejs.org/en/download/package-manager/)

*   Step 2 - Setup AWS Config

    Follow [These Instructions](https://docs.aws.amazon.com/config/latest/developerguide/gs-console.html) to configure the AWS Config Recorder.

    >   Note: It may take several minutes before a newly configured AWS Config Resource Recorder reports resources


*   Step 3 - Configure Credentials

    This tool leverages the AWS SDK and will require credentials for the account being discovered. Speciically, the config:ListDiscoveredResources actions will be required.  Typically credentials are supplied via a [Shared Config File](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html) or via [AWS Environment Variables](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html).



# Installation  
This utility leverages the AWS SDK as delivered by NPM, the package manager for Node.  To install this and any supporting packages, run the following command from within this project directory:
  

```shell
npm install
```

# Usage
Once installed, you can run the script to discover resources.  This may take some time for large AWS Accounts.  Run the script from a terminal in this project directory with a commond like:


```shell
node ./index.js
```

Once the discovery has been completed, a table for resources in each combincation of Region/Resource type, along with a total of all resources across regions is displayed.

**Example Output**
```
cory@osx aws_su_node % node index.js   

Done. Total Resources 7


Resources: 
{
  'us-east-2': {
    'AWS::DynamoDB::Table': 0,
    'AWS::ApiGatewayV2::Api': 1,
    'AWS::ApiGateway::RestApi': 1,
    'AWS::Lambda::Function': 3,
    'AWS::EC2::Instance': 2,
    'AWS::RDS::DBInstance': 0
  },
  'us-east-1': {
    'AWS::RDS::DBInstance': 0,
    'AWS::Lambda::Function': 0,
    'AWS::DynamoDB::Table': 0,
    'AWS::EC2::Instance': 0,
    'AWS::ApiGatewayV2::Api': 0,
    'AWS::ApiGateway::RestApi': 0
  },
  'us-west-1': {
    'AWS::EC2::Instance': 0,
    'AWS::ApiGateway::RestApi': 0,
    'AWS::RDS::DBInstance': 0,
    'AWS::Lambda::Function': 0,
    'AWS::DynamoDB::Table': 0,
    'AWS::ApiGatewayV2::Api': 0
  },
  'us-west-2': {
    'AWS::ApiGatewayV2::Api': 0,
    'AWS::DynamoDB::Table': 0,
    'AWS::Lambda::Function': 0,
    'AWS::RDS::DBInstance': 0,
    'AWS::ApiGateway::RestApi': 0,
    'AWS::EC2::Instance': 0
  }
}
```

> Note: You may adjust the regions and resources used for discovery by editing the [regions.aws.list](regions.aws.list) and [resources.aws.list](resources.aws.list) files prior to running the script.  Regions must include only AWS regions where AWS config is supported as [documented here](https://docs.aws.amazon.com/general/latest/gr/awsconfig.html).  For a list of supported resource types, review the [dcumentation here](https://docs.aws.amazon.com/config/latest/developerguide/resource-config-reference.html)