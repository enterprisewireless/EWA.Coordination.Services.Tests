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

This will only check the differences between the nxgen output file and the legacy output file, it will not contact the server. You would use this when making changes to the `legacy_results_adjusted` file and want to quickly run the difference again.
```
node main.js 1_3_a --use-existing-output
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
| Argument      | Default Value | Use cases | Available values | Description |
| ----------- | ----------- | ----------- | ----------- | ----------- |
| `enviornment_name` | develop | main.js, regression.js | develop, release, *more to follow...* | |
| `test_case_directory_name` | null | main.js | directory name in `./test_cases` | |
| `--exclude "value"` | null | regression.js | directories in `./test_cases` you don't want to run, comma separated. All whitespace in the "value" will be removed. | |
| `--use-existing-output` | develop | main.js | N/A | Use this when you don't need new nxgen output just want to re-run differences |

# Add Test Cases
Add the following files
```
EWA.Coordination.Services.Tests
| - test_cases
    | - YOUR_TEST_CASE_LABEL
        | + legacy_output.csv
        | + nxgen_input.json 
        | (OPTIONAL) + legacy_output_adjusted.csv
```
`legacy_output_adjusted.csv` is a copy of `legacy_output.csv` but with adjustments made from approved discrepancies. This data in this file is typically updated by adding or removing messages from the `ErrTxt` column.

*Note*: See [Apply verified adjustments](#Apply-verified-adjustments) for more information on how to adjust the legacy output using verified discrepancies.

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

## Apply verified adjustments
If a test case has verified differences between the legacy and NxGen output then you can add a file in the test case directory named `legacy_output_adjusted.csv` and it will use this file to compare against rather than the `legacy_output.csv` file.

This way you can make adjustments to the legacy output to match with NxGen so you don't have to see discrepancies that you know will always show up.

## Adding a rule to a legacy output record
You can add a rule message to a legacy output record by finding it using the differences key using the frequency, station class code, and location number. Once you have found the line number for this record you can find the `ErrTxt` column and insert the missing text.

**Example** from 6e_SafeHarborHaatExceeded test case 

`./test_cases/6e_SafeHarborHaatExceeded/legacy_results.csv`
```
20230321171624,12,L,12,173.2875,0,,MO,11K0F3E,110,110,0,0,A,"Rule 40: Shared with Public Safety for Remote Control and Telemetry Operations|Rule 41: Operational fixed stations must employ either directional and omnidirectional antennas."
```
`./test_cases/6e_SafeHarborHaatExceeded/legacy_results.csv`
(adding Rule 93)
```
20230321171624,12,L,12,173.2875,0,,MO,11K0F3E,110,110,0,0,A,"Rule 40: Shared with Public Safety for Remote Control and Telemetry Operations|Rule 41: Operational fixed stations must employ either directional and omnidirectional antennas.|Rule 93: Telemetry/VRS frequency: Station Class must be FXO, FXOT or MO3|Rule 94: Licensee required to show Min. 50 mobile units per freq. before requesting additional frequencies"
```

## Removing a rule to a legacy output record
Removing a rule from a legacy record is very similar to adding a rule, just remove the text from the `ErrTxt` column that is part of the rule's text.

# Improvements to be made
- Add project directories such as Tools and AutoCoord instead of just Validate test cases.
- Add different node scripts for `/External?` or `/Internal?` or have a parameter to signal.