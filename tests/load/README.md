# JMeter workflow

Use Java 17 or newer and Apache JMeter 5.6.3. Run against an isolated local database. Do not point this write-heavy test at a database you want to preserve.

From the project root, build and start the server in one PowerShell terminal:

```powershell
npm run build
$env:DATABASE_PATH='data/load-test.db'
npm run start -- --hostname 127.0.0.1 --port 3200
```

Then run in a second terminal:

```powershell
./tests/load/run-stages.ps1 -JMeterHome 'C:/tools/apache-jmeter-5.6.3' -OutputDirectory evidence/jmeter-new
```

The plan uses HTTP requests, not browser rendering. Each journey creates, reads and updates a word list, saves and generates Wordle and Word Search configurations, reads metrics, deletes the list with its linked activities, and checks health. JSON extractors carry the created IDs into later requests. Non-success HTTP statuses fail their samples. Response and connect timeouts are 30 and 10 seconds.

| Stage journeys | Concurrent threads | Loops per thread | HTTP requests |
| --- | --- | --- | --- |
| 1 | 1 | 1 | 10 |
| 10 | 2 | 5 | 100 |
| 100 | 5 | 20 | 1000 |
| 1000 | 10 | 100 | 10000 |
| 10000 | 20 | 500 | 100000 |

These are equivalent staged volumes, not 10000 simultaneous users. There is no think time and no assertion of internet-scale capacity. Generation events intentionally remain after test configurations are deleted. Use a fresh DATABASE_PATH for each independent run. The runner stops if a stage has any failed or missing samples.

Open the JMX file in JMeter to inspect it, or load a JTL in an Aggregate Report listener. The submitted summary is derived from the submitted JTL samples; it is not fabricated output from a plan.
