USER="joarosa"
kumorictl init
kumorictl login $USER
kumorictl config --user-domain joarosa.faas
kumorictl fetch-dependencies faas-manifests/

# Register certificate (MUST CONTAIN '.wildcard')
kumorictl register certificate faascert.wildcard \
    --domain *.vera.kumori.cloud \
    --cert-file cert/wildcard.vera.kumori.cloud.crt \
    --key-file cert/wildcard.vera.kumori.cloud.key

# Register inboud
kumorictl register http-inbound faasinb \
    --domain faas-joarosa.vera.kumori.cloud \
    --cert faascert.wildcard

# Register deployment
kumorictl register deployment faasdep \
    --deployment ./faas-manifests/deployment

# Link inboud to deployment
kumorictl link faasdep:service faasinb

# View deployment
kumorictl describe deployment faasdep

# Undo everything
kumorictl unlink faasdep:service faasinb
kumorictl unregister deployment faasdep
kumorictl unregister http-inbound faasinb
kumorictl unregister certificate faascert.wildcard
