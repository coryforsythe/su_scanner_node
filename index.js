const fs = require('fs');
const AWS = require('aws-sdk');
const Multispinner = require('multispinner')

let configservice = {}

//the list of regions to discover
const Regions = fs.readFileSync('./regions.aws.list', 'utf8').toString().split('\n');

//the list of AWS Config resources to discover
const ResourceTypes = fs.readFileSync('./resources.aws.list', 'utf8').toString().split('\n');

//Stores the counts
let total = 0;
let counts={};

//helper function to sleep the main thread for API safety (throttling control)
const sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Calls the AWS Config service 
const discovery = async function (region, resourceType, nextToken) {
    AWS.config.update({ region });
    configservice = new AWS.ConfigService({ region });
    return await configservice.listDiscoveredResources({ resourceType: resourceType, includeDeletedResources: false, nextToken: (nextToken == "init" ? "" : nextToken) }).promise();
}

//CLI Spinners
let spinnerLabels=[];
Regions.map(function(r){
    ResourceTypes.map(function(rt){

        spinnerLabels.push(r.replace('\r','')+" "+rt.replace('\r',''));
    })
});

const multispinner = new Multispinner(spinnerLabels,{
    autoStart: true,
  clear: true
});
  

//Stores the counts
const putCount = function(region,resourceType,count){
    if(counts[region]){
        if(counts[region].resourceType){
            counts[region][resourceType]+=count
        }
        else{
            counts[region][resourceType]=count;
        }
    }
    else{
        counts[region]={};
        counts[region][resourceType]=count
    }
}

//Reports stats when complete
multispinner.on('done', () => {
    console.info("\n\nDone. Total Resources " + total);
    console.debug("\n\nResources: ");
    console.dir(counts);
  })

//Start discovery for each region
Regions.map(async (region) => {
    if (region != "") {
        region=region.replace('\r','')
        //Loop resource types
        await Promise.all(ResourceTypes.map(async (rt) => {

            if (rt != "") {
                rt=rt.replace('\r','')
                //setup pagination
                let nextToken = "init";
                let morepages = true;
                let label=region+" "+rt;
                //If we are init or more pages exist, iterate
                try{
                while (morepages) {
                    const res = await discovery(region, rt, nextToken);
                    putCount(region,rt,res.resourceIdentifiers.length);
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
                multispinner.success(label);
            }
            catch(ex){
                multispinner.error(label);

            }
            }
        }));

    }
});