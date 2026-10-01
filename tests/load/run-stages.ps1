param(
  [Parameter(Mandatory=$true)][string]$JMeterHome,
  [string]$Java = 'java',
  [int]$Port = 3200,
  [string]$OutputDirectory = 'evidence/jmeter'
)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force $OutputDirectory | Out-Null
$stages = @(@(1,1,1), @(10,2,5), @(100,5,20), @(1000,10,100), @(10000,20,500))
foreach ($stage in $stages) {
  $count, $threads, $loops = $stage
  $result = Join-Path $OutputDirectory "stage-$count.jtl"
  if (Test-Path -LiteralPath $result) { throw "Use a new output directory. Result already exists: $result" }
  & $Java -Xms256m -Xmx1024m -jar (Join-Path $JMeterHome 'bin/ApacheJMeter.jar') -n -t tests/load/assessment-workflow.jmx "-Jport=$Port" "-Jthreads=$threads" "-Jloops=$loops" '-Jramp=2' -l $result -j (Join-Path $OutputDirectory "stage-$count.log")
  if ($LASTEXITCODE -ne 0) { throw "JMeter failed at $count journeys." }
  $rows = @(Import-Csv -LiteralPath $result)
  if ($rows.Count -ne ($count * 10) -or @($rows | Where-Object success -ne 'true').Count -gt 0) {
    throw "Stage $count returned missing or failed samples. Inspect results before increasing load."
  }
}
