VERSION="v9"
docker run -d -p 27017:27017 --network faas --name mongodb mongo # Runs MongoDB container
docker run -d --name dbm --network faas --env DB_URL="mongodb://mongodb:27017" piturriti1/faas:database$VERSION
docker run -d --name jqm --network faas --env DB_URL="tcp://dbm:27444" piturriti1/faas:job-queue$VERSION
docker run -d --name frontend -p 80:8080 --network faas --env DB_URL="tcp://dbm:27444" --env JQ_URL="tcp://jqm:27445" --env PORT=8080 piturriti1/faas:frontend$VERSION
docker run -d --name worker1 --network faas --env DB_URL="tcp://dbm:27444" --env JQ_URL="tcp://jqm:27445" piturriti1/faas:worker$VERSION

docker container rm -f $(docker container ls -aq)
