USER="piturriti1"
VERSION="v21"

# Copy deployment to Scaler
rm -r scaler/manifests/*
cp -r ../DEPLOYMENT/faas-manifests/* scaler/manifests/

# Build each image
for w in "database" "frontend" "job-queue" "worker" "scaler"; do
    echo -e "\e[36m##\e[32m Building image \e[33mfaas:$w$VERSION\e[32m:\e[0m"
    echo -e "Copying proxy classes."
    cp lib/*Proxy.js $w/lib
    echo -e "Building."
    docker build -t $USER/faas:$w$VERSION ./$w
done

# Push each image to docker-hub
for w in "database" "frontend" "job-queue" "worker" "scaler"; do
    echo -e "\e[36m##\e[35m Pushing image \e[33mfaas:$w$VERSION\e[32m:\e[0m"
    docker push $USER/faas:$w$VERSION
done
