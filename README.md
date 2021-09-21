# What is it?

This tool will help you report upon quantities of AWS resources as discovered by the [AWS Config Service](https://aws.amazon.com/config/)

# Pre-requisites

To use this tool, you must install both NodeJS and configure the AWS Config service for recording in the regions where you wish to discover resources.

*   Step 1 - Install NodeJS

    NodeJS can be installed for your operating systems by following [These Instructions](https://nodejs.org/en/download/package-manager/)

*   Step 2 - Setup AWS Config

    Follow [These Instructions](https://docs.aws.amazon.com/config/latest/developerguide/gs-console.html) to configure the AWS Config Recorder.

>   Note: It may take several minutes before a newly configured AWS Config Resource Recorder reports resources

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
Discovering Region us-east-2
Discovering Region us-east-1
Discovering Region us-west-1
Discovering Region us-west-2
|  us-east-1   AWS::DynamoDB::Table 0
|  us-east-1   AWS::ApiGateway::RestApi 0
|  us-east-1   AWS::ApiGatewayV2::Api 0
|  us-east-2   AWS::Lambda::Function 3
|  us-east-2   AWS::DynamoDB::Table 0
|  us-east-2   AWS::RDS::DBInstance 0
|  us-east-2   AWS::ApiGateway::RestApi 1
|  us-east-2   AWS::ApiGatewayV2::Api 1
|  us-east-2   AWS::EC2::Instance 2
|  us-east-1   AWS::EC2::Instance 0
|  us-east-1   AWS::Lambda::Function 0
|  us-east-1   AWS::RDS::DBInstance 0
|  us-west-1   AWS::ApiGatewayV2::Api 0
|  us-west-1   AWS::RDS::DBInstance 0
|  us-west-1   AWS::Lambda::Function 0
|  us-west-1   AWS::EC2::Instance 0
|  us-west-1   AWS::DynamoDB::Table 0
|  us-west-1   AWS::ApiGateway::RestApi 0
|  us-west-2   AWS::EC2::Instance 0
|  us-west-2   AWS::ApiGateway::RestApi 0
|  us-west-2   AWS::DynamoDB::Table 0
|  us-west-2   AWS::RDS::DBInstance 0
|  us-west-2   AWS::ApiGatewayV2::Api 0
|  us-west-2   AWS::Lambda::Function 0
Done. Total Resources 7
```

> Note: You may adjust the regions and resources used for discovery by editing the [regions.aws.list](regions.aws.list) and [resources.aws.list](resources.aws.list) files prior to running the script.  Regions must include only AWS regions where AWS config is supported as [documented here](https://docs.aws.amazon.com/general/latest/gr/awsconfig.html).  For a list of supported resource types, review the [dcumentation here](https://docs.aws.amazon.com/config/latest/developerguide/resource-config-reference.html)