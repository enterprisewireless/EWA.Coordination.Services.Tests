# Specify the path to the directory containing the folders
$directoryPath = "C:\Users\StephenCharette\source\repos\EWA.Coordination.Services.Tests\test_cases"

# Get the list of folders in the directory
$folderNames = Get-ChildItem -Path $directoryPath -Directory | Select-Object -ExpandProperty Name

# Output the folder names
$folderNames