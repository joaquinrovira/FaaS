package jqmanager

import k "kumori.systems/kumori/kmv"

#Manifest : k.#ComponentManifest & {

  ref: {
    domain: "joarsa.systems.faas"
    name: "faasjqmanager"
    version: [0,0,1]
  }

  description: {

    srv: {
      server: entrypoint: {
        protocol: "tcp"
        port:     27445
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
      }
    }

    size: {
      $_memory: *"100Mi" | uint
      $_cpu: *"100m" | uint
    }

    code: jobqueue: k.#Container & {
      name: "jobqueue"
      image: {
        hub: {
          name: "registry.hub.docker.com"
          secret: ""
        }
        tag: "piturriti1/faas:job-queuev22"
      }
      mapping: {
        filesystem: []
        env: {
          DB_URL: "\(config.parameter.dburl):\(config.parameter.dbport)"
          PORT: "\(srv.server.entrypoint.port)"
        }
      }
    }
  }
}
