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
## Run a single test case
Run a single test case by opening Powershell and running the following command in the root directory:
```
node main.js test_case_directory_name environment_name
```

*Note*: See [Arguments](#Arguments) for more information on cli arguments available for main.js.

**Examples**

This will run the test case in the `202401031224` on the Develop environment.
```
node main.js 202401031224
```

This will run the test case in the `1_3_a` on the Local environment (must be running EWA.Coordination.Services).
```
node main.js 1_3_a local
```

## Run a regression test
To run multiple test cases at once, or to regression test, open a Powershell window and run the following command in the root directory:
```
node regression.js environment_name --exclude "old, not_working"
```

**Examples**

This will run all the test cases in `./test_cases` on the Develop environment.
```
node regression.js develop
```

This will run all the test cases in `./test_cases` other than "old" and "not_working" on the Release environment.
```
node regression.js develop --exclude "old, not_working"
```

If the `environment_name` argument is not provided, it defaults to Develop. The `environment_name`

## Arguments
| Argument      | Default Value | Use cases | Available values |
| ----------- | ----------- | ----------- | ----------- |
| `enviornment_name` | develop | main.js, regression.js | develop, release, *more to follow...* |
| `test_case_directory_name` | null | main.js | directory name in `./test_cases` |
| `--exclude "value"` | null | regression.js | directories in `./test_cases` you don't want to run, comma separated. All whitespace in the "value" will be removed. |

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
            "elevation": <double>,
            "areaOfOperationCode": <string>
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
														

# Improvements to be made
- **PRIORITY** Allow for another file for adjusted legacy results so we don't have to see discrepancies that have been approved. 
- Add project directories such as Tools and AutoCoord instead of just Validate test cases.
- Add different node scripts for `/External?` or `/Internal?` or have a parameter to signal.