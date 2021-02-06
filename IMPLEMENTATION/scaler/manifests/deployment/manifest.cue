package calculator_deployment

import (
  k "kumori.systems/kumori/kmv"
  c "joarosa.systems/faas/service:calculator"
  nw "joarosa.systems/faas/variables/num_workers"
)

#Manifest: k.#MakeDeployment & {

  _params: {
    ref: {
      domain: "joarsa.systems.faas"
      name: "calccachecfg"
      version: [0,0,1]
    }

    inservice: c.#Manifest & {
      description: role: mongodb: rsize: $_instances: 1
      description: role: dbmanager: rsize: $_instances: 1
      description: role: jqmanager: rsize: $_instances: 1
      description: role: frontend: rsize: $_instances: 1
      description: role: worker: rsize: $_instances: nw.#NUM_WORKERS
      description: role: scaler: rsize: $_instances: 1
    }

    config: {
      parameter: {}
    }
  }
}
