package scaler

import k "kumori.systems/kumori/kmv"

#Manifest : k.#ComponentManifest & {

  ref: {
    domain: "joarsa.systems.faas"
    name: "faasscaler"
    version: [0,0,1]
  }

  description: {

    srv: {
      client: jqclient: {
        protocol: "tcp"
      }
    }

    config: {
      resource: {}
      parameter: {
        jqurl: string | *"tcp://0.jqclient"
        jqport: number | *80// *27445
      }
    }

    size: {
      $_memory: *"1000Mi" | uint// Large image requires more memory
      $_cpu: *"100m" | uint
    }

    code: scaler: k.#Container & {
      name: "scaler"
      image: {
        hub: {
          name: "registry.hub.docker.com"
          secret: ""
        }
        tag: "piturriti1/faas:scalerv21"
      }
      mapping: {
        filesystem: []
        env: {
          JQ_URL: "\(config.parameter.jqurl):\(config.parameter.jqport)"
        }
      }
    }
  }
}
