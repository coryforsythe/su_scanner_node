#!/usr/bin/env node

const fs = require('fs');
const AWS = require('aws-sdk');
const Multispinner = require('multispinner');
const { default: cluster } = require('cluster');


//the list of regions to discover
const Regions = fs.readFileSync('./regions.aws.list', 'utf8').toString().split('\n');

//the list of AWS Config resources to discover
const ResourceTypes = fs.readFileSync('./resources.aws.list', 'utf8').toString().split('\n');

//Stores the counts
let total = 0;
let errorMessages = [];
let counts = {};

//helper function to sleep the main thread for API safety (throttling control)
const sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Calls the AWS Config service 
const configDisco = async function (region, resourceType, nextToken) {
    let configservice = new AWS.ConfigService({ region });
    return await configservice.listDiscoveredResources({ resourceType: resourceType, includeDeletedResources: false, nextToken: (nextToken == "init" ? "" : nextToken) }).promise();
}

//Calls the AWS ECS service
const ecsDisco = async function (region) {
    let ecsservice = new AWS.ECS({ region });
    let nextToken = "init";
    let morepages = true;
    let label = region + " ECS Tasks";

    let containers = 0;

    //If we are init or more pages exist, iterate
    try {
        while (morepages) {
            //List the tasks running in the region
            const clusters = await ecsservice.listClusters({ nextToken: (nextToken == "init" ? "" : nextToken) }).promise();

            //For each task, describe to get the container count.
            await Promise.all(
                clusters.clusterArns.map(async (cluster) => {
                    let taskNextToken = "init";
                    let taskMorepages = true;
                    while (taskMorepages) {
                        const taskRes = await ecsservice.listTasks({
                            nextToken: (taskNextToken == "init" ? "" : taskNextToken),
                            cluster
                        }).promise();

                        await Promise.all(taskRes.taskArns.map(async (taskArn) => {
                            const taskMapRes = await ecsservice.describeTasks({
                                tasks: [taskArn],
                                cluster
                            }).promise();
                            taskMapRes.tasks.map((t) => {
                                containers += t.containers.length;
                            })
                            await sleep(500); //sleep as to not burden the API
                        }));

                        if (taskRes.nextToken) {
                            taskNextToken = taskRes.nextToken;
                            taskMorepages = true;
                            await sleep(500); //sleep as to not burden the API

                        }
                        else {
                            taskMorepages = false;
                        }

                    }//end task while
                })

            )

            if (clusters.nextToken) {
                nextToken = clusters.nextToken;
                morepages = true;
                await sleep(500); //sleep as to not burden the API
            }
            else {
                morepages = false;
            }

        }//end while

        putCount(region, 'AWS::ECS::Containers', containers);
        total += containers;
        multispinner.success(label);

    }
    catch (ex) {
        multispinner.error(label);
        errorMessages.push("Error occured processing " + label + ": " + ex);
    }
}

//CLI Spinners to track progress and trigger the total count display on completion
let spinnerLabels = [];
Regions.map(function (r) {
    const region = r.replace('\r', '')
    if (region != "") {
        spinnerLabels.push(region + ' AWS Config');
        spinnerLabels.push(region + ' ECS Tasks');
    }
});


const multispinner = new Multispinner(spinnerLabels, {
    autoStart: true,
    clear: true
});


//Stores the counts
const putCount = function (region, resourceType, count) {
    if (counts[region]) {
        if (counts[region].resourceType) {
            counts[region][resourceType] += count
        }
        else {
            counts[region][resourceType] = count;
        }
    }
    else {
        counts[region] = {};
        counts[region][resourceType] = count
    }
}

//Reports stats when complete
multispinner.on('done', () => {
    console.info("\n\nDone. Total Resources " + total);
    console.debug("\n\nResources: ");
    console.dir(counts);
    if (errorMessages.length > 0) {
        console.error("\n\n" + errorMessages.length + " ERRORS\n\n");
        console.dir(errorMessages);
    }
})

//Start aws config discovery for each region
Regions.map(async (region) => {
    if (region != "") {
        region = region.replace('\r', '')


        //Loop resource types and scan with AWS Config
        await Promise.all(ResourceTypes.map(async (rt) => {

            if (rt != "") {
                rt = rt.replace('\r', '')
                //setup pagination
                let nextToken = "init";
                let morepages = true;
                let label = region + " " + rt;
                //If we are init or more pages exist, iterate
                try {
                    while (morepages) {
                        const res = await configDisco(region, rt, nextToken);
                        putCount(region, rt, res.resourceIdentifiers.length);
                        total += res.resourceIdentifiers.length
                        if (res.nextToken) {
                            nextToken = res.nextToken;
                            morepages = true;
                            await sleep(500); //sleep as to not burden the API
                        }
                        else {
                            morepages = false;
                        }
                    }//end while
                    multispinner.success(region + ' AWS Config');
                }
                catch (ex) {
                    multispinner.error(region + ' AWS Config');
                    errorMessages.push("Error occured processing " + label + ": " + ex);
                }
            }
        }));

        //ECS Discovery per region
        await ecsDisco(region);


    }
});
