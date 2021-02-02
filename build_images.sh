USER="piturriti1"
VERSION="v1"
for w in "database" "frontend" "job-queue" "worker"; do
    echo -e "\e[36m##\e[32m Building image \e[33mfaas:$w\e[32m:\e[0m"
    echo -e "Copying proxy classes."
    cp lib/*Proxy.js $w/lib
    echo -e "Building."
    docker build -t $USER/faas:$w$VERSION ./$w
done

for w in "database" "frontend" "job-queue" "worker"; do
    echo -e "\e[36m##\e[35m Pushing image \e[33mzmq:$w\e[32m:\e[0m"
    docker push $USER/faas:$w$VERSION
done
