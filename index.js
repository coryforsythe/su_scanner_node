const fs = require('fs');
const AWS = require('aws-sdk');
let configservice = {}

const Regions = fs.readFileSync('./regions.aws.list', 'utf8').toString().split('\n');
const ResourceTypes = fs.readFileSync('./resources.aws.list', 'utf8').toString().split('\n');
let total = 0;
Promise.all(Regions.map(async (region) => {
    region=region.replace('\r','');
    if (region != "") {
        console.info
        console.info("Discovering Region " + region);
        AWS.config.update({ region });
        configservice = new AWS.ConfigService({ region });

       await Promise.all(ResourceTypes.map(async (rt) => {
            rt=rt.replace('\r','');
            if (rt != "") {
                const res = await configservice.listDiscoveredResources({ resourceType:rt, includeDeletedResources: false }).promise();
                total += res.resourceIdentifiers.length
                console.info("|  " +region+"   "+ rt + " " + res.resourceIdentifiers.length);
            }
        }));

    }
})).then(
()=>{
    console.info("Done. Total Resources " + total);
}
);
