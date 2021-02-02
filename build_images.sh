# NOTA AL INICIAR EL DBManager falla ya que el contenedor mongo puede estar sin arrancar
# Por lo que se reinicia. Al reiniciarse se resetea el DBManager y el socket entre JQManager y DBManager
# falla. por lo que hay que reiniciar JQManager con:
## kumorictl exec -it faasdep jqmanager xxxx -- sh
## > kill 1

USER="piturriti1"
VERSION="v3"
for w in "database" "frontend" "job-queue" "worker"; do
    echo -e "\e[36m##\e[32m Building image \e[33mfaas:$w$VERSION\e[32m:\e[0m"
    echo -e "Copying proxy classes."
    cp lib/*Proxy.js $w/lib
    echo -e "Building."
    docker build -t $USER/faas:$w$VERSION ./$w
done

for w in "database" "frontend" "job-queue" "worker"; do
    echo -e "\e[36m##\e[35m Pushing image \e[33mfaas:$w$VERSION\e[32m:\e[0m"
    docker push $USER/faas:$w$VERSION
done
