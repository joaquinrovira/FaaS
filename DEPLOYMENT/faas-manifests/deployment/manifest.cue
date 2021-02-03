package calculator_deployment

import (
  k "kumori.systems/kumori/kmv"
  c "joarosa.systems/faas/service:calculator"
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
      description: role: worker: rsize: $_instances: 1
    }

    config: {
      parameter: {
        frontend: {
          config: {
            param_one : "myparam_one"
            param_two : 123
          }
          calculatorEnv: "The_calculator_env_value"
          restapiclientPortEnv: "80"
        }
      }
    }
  }
}
