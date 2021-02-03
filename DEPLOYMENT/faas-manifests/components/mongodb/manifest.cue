package mongodb

import k "kumori.systems/kumori/kmv"

#Manifest:  k.#ComponentManifest & {

  ref: {
    domain: "joarsa.systems.faas"
    name: "faasmongodb"
    version: [0,0,1]
  }

  description: {

    srv: {
      server: entrypoint: {
        protocol: "tcp"
        port:     27017 // Default mongodb port
      }
    }

    config: {
      resource: {}
      parameter: {}
    }

    size: {
      $_memory: *"100Mi" | uint
      $_cpu: *"100m" | uint
    }

    code: mongodb: k.#Container & {
      name: "mongodb"
      image: {
        hub: {
          name: "registry.hub.docker.com"
          secret: ""
        }
        tag: "bitnami/mongodb:latest"
      }
      mapping: {
        filesystem: []
        env: {}
      }
    }
  }
}