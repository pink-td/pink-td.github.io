$ErrorActionPreference = 'Continue'

docker network inspect daily_me_default *> $null
if ($LASTEXITCODE -ne 0) {
    docker network create daily_me_default
    if ($LASTEXITCODE -ne 0) { throw 'Cannot create the daily_me network.' }
}

$existing = docker ps -aq --filter 'name=^/daily_me$'
if ($LASTEXITCODE -ne 0) { throw 'Cannot access Docker.' }
if ($existing) {
    docker start daily_me
    exit $LASTEXITCODE
}

$old = docker ps -aq --filter 'label=com.docker.compose.project=daily_me' --filter 'label=com.docker.compose.service=db'
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect the previous database container.' }
if ($old) {
    $inspection = docker inspect $old
    if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect the previous database volume.' }
    $mounts = ($inspection | Out-String | ConvertFrom-Json).Mounts
    $volume = $mounts | Where-Object { $_.Type -eq 'volume' -and $_.Destination -eq '/var/lib/postgresql/data' }
    if ($volume.Name -ne 'daily_me_blog_data') {
        throw 'The previous database is not using the expected volume.'
    }
    docker stop $old
    if ($LASTEXITCODE -ne 0) { throw 'Cannot stop the previous database container.' }
}

docker run -d --name daily_me --network daily_me_default --publish 127.0.0.1:5435:5432 --volume daily_me_blog_data:/var/lib/postgresql/data --env POSTGRES_DB=daily_me --env POSTGRES_USER=daily_me --env POSTGRES_PASSWORD=local_daily_me postgres:17
if ($LASTEXITCODE -ne 0) { throw 'Cannot start daily_me. The database volume is retained.' }

if ($old) {
    docker rm $old
    if ($LASTEXITCODE -ne 0) { throw 'daily_me started. The stopped previous container could not be removed.' }
}


