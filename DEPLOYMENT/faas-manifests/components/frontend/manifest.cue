package frontend

import k "kumori.systems/kumori/kmv"

#Manifest : k.#ComponentManifest & {

  ref: {
    domain: "joarsa.systems.faas"
    name: "faasfrontend"
    version: [0,0,1]
  }

  description: {

    srv: {
      server: entrypoint: {
        protocol: "http"
        port:     80
      }
      client: jqclient: {
        protocol: "tcp"
      }
      client: dbclient: {
        protocol: "tcp"
      }
    }

    config: {
      resource: {}
      parameter: {
        dburl: string | *"tcp://0.dbclient"
        dbport: number | *80// *27444
        jqurl: string | *"tcp://0.jqclient"
        jqport: number | *80// *27445
      }
    }

    size: {
      $_memory: *"100Mi" | uint
      $_cpu: *"100m" | uint
    }

    code: frontend: k.#Container & {
      name: "frontend"
      image: {
        hub: {
          name: "registry.hub.docker.com"
          secret: ""
        }
        tag: "piturriti1/faas:frontendv14"
      }
      mapping: {
        filesystem: []
        env: {
          DB_URL: "\(config.parameter.dburl):\(config.parameter.dbport)"
          JQ_URL: "\(config.parameter.jqurl):\(config.parameter.jqport)"
          PORT: "\(srv.server.entrypoint.port)"
        }
      }
    }
  }
}
