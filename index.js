const fs = require('fs');
const AWS = require('aws-sdk');
let configservice = {}

const Regions = fs.readFileSync('./regions.aws.list', 'utf8').toString().split('\n');
const ResourceTypes = fs.readFileSync('./resources.aws.list', 'utf8').toString().split('\n');
let total = 0;

const discovery = async function (region, resourceType, nextToken) {
    AWS.config.update({ region });
    configservice = new AWS.ConfigService({ region });
    return await configservice.listDiscoveredResources({ resourceType: resourceType, includeDeletedResources: false, nextToken: (nextToken == "init" ? "" : nextToken) }).promise();
}

Promise.all(Regions.map(async (region) => {
    region = region.replace('\r', '');
    if (region != "") {
        console.info
        console.info("Discovering Region " + region);


        await Promise.all(ResourceTypes.map(async (rt) => {
            rt = rt.replace('\r', '');
            if (rt != "") {
                let nextToken = "init";
                let morepages = true;
                while (morepages) {
                    const res = await discovery(region, rt, nextToken);
                    total += res.resourceIdentifiers.length
                    console.info("|  " + region + "   " + rt + " " + res.resourceIdentifiers.length);
                    if (res.nextToken) {
                        nextToken = res.nextToken;
                        morepages = true;
                    }
                    else {
                        morepages = false;
                    }
                }
            }
        }));

    }
})).then(
    () => {
        console.info("Done. Total Resources " + total);
    }
);
