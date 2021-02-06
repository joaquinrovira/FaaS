package dbmanager

import k "kumori.systems/kumori/kmv"

#Manifest : k.#ComponentManifest & {

  ref: {
    domain: "joarsa.systems.faas"
    name: "faasdbmanager"
    version: [0,0,1]
  }

  description: {

    srv: {
      server: entrypoint: {
        protocol: "tcp"
        port:     27444
      }
      client: mongodbclient: {
        protocol: "tcp"
      }
    }

    config: {
      resource: {}
      parameter: {
        dburl: string | *"mongodb://0.mongodbclient:80" //*"mongodb://0.mongodbclient:27017"
      }
    }

    size: {
      $_memory: *"100Mi" | uint
      $_cpu: *"100m" | uint
    }

    code: database: k.#Container & {
      name: "database"
      image: {
        hub: {
          name: "registry.hub.docker.com"
          secret: ""
        }
        tag: "piturriti1/faas:databasev19"
      }
      mapping: {
        filesystem: []
        env: {
          DB_URL: "\(config.parameter.dburl)"
          PORT: "\(srv.server.entrypoint.port)"
        }
      }
    }
  }
}
