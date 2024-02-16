This repository contains scripts to test the outputs of the EWA.Coordination.Services APIs.

# Installation
Install the node packages required to run the scripts:
```
npm install
```
Add an environment file for the environment you want to test. Example: (for the Validate Develop environment)
```
# develop.env
CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
CLIENT_ID=YOUR_CLIENT_ID_HERE
SCOPE=api://e305979e-418e-46ec-a617-bd64888b2f31/.default
TENANT_ID=9339fae2-efaa-4336-a27a-4821384ea343
```

# Usage
Run a test case by opening powershell and running the following command in the root directory:
```
node main.js test_case_directory_name environment_name
```

If the `enviornment_name` argument is not provided it defaults to Develop. The `environment_name` can be:
- `local` - the local development environment
- `develop` - the NxGen Develop environment on Azure
- *more to follow...*

**Examples**

This will run the test case in the `202401031224` on the Develop environment.
```
node main.js 202401031224
```

This will run the test case in the `1_3_a` on the Local environment (must be running EWA.Coordination.Services).
```
node main.js 1_3_a local
```

# Add Test Cases
Add the following files
```
EWA.Coordination.Services.Tests
| - test_cases
    | - YOUR_TEST_CASE_LABEL
        | + legacy_output.csv
        | + nxgen_input.json 
```
`nxgen_input.json` should have the following format:
```
{
    "licenseType": <string>,
    "scheduleGhs": [
        {
            "lineNum": <number>,
            "locationCode": <string>,
            "locationNum": <number>,
            "frequencyLow": <double>,
            "frequencyHigh": <double>,
            "stationClass": <string>,
            "emissionDesignator": <string>,
            "power": <double>,
            "erp": <double>,
            "haat": <double>,
            "transmittingAntennaHeight": <double>,
            "coordinationCode": <string (1 character "A"/"C")>,
            "requestNum": <number>
        },
        ...
    ],
    "scheduleEs": [
        {
            "state": <string (2 character abbreviated)>,
            "city": <string>,
            "county": <string>,
            "locationNum": <number>,
            "locationCode": <string>,
            "latitude": <double>,
            "longitude": <double>,
            "areaOfOperation": <string>,
            "serviceAreaRadius": <double>,
            "elevation": <double>
        },
        ...
    ]
}
```

`legacy_output.csv` must have the following columns in order:
| Column Name | NxGen Name                |
| ----------- | ------------------------- |
| LogID       | ---                       |
| LineNum     | LineNum                   |
| Loc         | LocationCode              |
| LocNum      | LocationNum               |
| FreqLow     | FrequencyLow              |
| FreqHi      | FrequencyHigh             |
| FreqType    | FrequencyType             |
| Class       | StationClassCode          |
| Emission    | EmissionDesignator        |
| Power       | Power                     |
| Erp         | Erp                       |
| Haat        | Haat                      |
| TxAntHgt    | TransmittingAntennaHeight |
| CoordCode   | CoordinationCode          |
| ErrTxt      | LimitationMessages        |
														