package calculator

import (
  k         "kumori.systems/kumori/kmv"
  mongodb   "joarosa.systems/faas/components/mongodb"
  dbmanager "joarosa.systems/faas/components/dbmanager"
  jqmanager "joarosa.systems/faas/components/jqmanager"
  frontend  "joarosa.systems/faas/components/frontend"
  worker    "joarosa.systems/faas/components/worker"
  scaler    "joarosa.systems/faas/components/scaler"
)

let memongodb = mongodb.#Manifest
let medbmanager = dbmanager.#Manifest
let mejqmanager = jqmanager.#Manifest
let mefrontend = frontend.#Manifest
let meworker = worker.#Manifest
let mescaler = scaler.#Manifest

#Manifest: k.#ServiceManifest & {

  ref: {
    domain: "joarsa.systems.faas"
    name: "calccache"
    version: [0,0,1]
  }

  description: {

    srv: {
      server: {
        service: {
          protocol: "http"
          port: 80
        }
      }
    }

    config: {
      parameter: {
        mongodb:    memongodb.description.config.parameter
        dbmanager:  medbmanager.description.config.parameter
        jqmanager:  mejqmanager.description.config.parameter
        frontend:   mefrontend.description.config.parameter
        worker:     meworker.description.config.parameter
        scaler:     mescaler.description.config.parameter
      }
      resource: {}
    }

    // Config spread
    role: {
      mongodb: k.#Role
      mongodb: artifact: memongodb
      mongodb: cfg: parameter: config.parameter.mongodb

      dbmanager: k.#Role
      dbmanager: artifact: medbmanager
      dbmanager: cfg: parameter: config.parameter.dbmanager

      jqmanager: k.#Role
      jqmanager: artifact: mejqmanager
      jqmanager: cfg: parameter: config.parameter.jqmanager

      frontend: k.#Role
      frontend: artifact: mefrontend
      frontend: cfg: parameter: config.parameter.frontend

      worker: k.#Role
      worker: artifact: meworker
      worker: cfg: parameter: config.parameter.worker

      scaler: k.#Role
      scaler: artifact: mescaler
      scaler: cfg: parameter: config.parameter.scaler

    }

    connector: {
      serviceconnector: {kind: "lb"}
      fedbmconnector:   {kind: "lb"}
      fejqmconnector:   {kind: "lb"}
      jqmdbmconnector:  {kind: "lb"}
      mongoconnector:   {kind: "lb"}
      wdbmconnector:    {kind: "lb"}
      wjqmconnector:    {kind: "lb"}
      sjqmconnector:    {kind: "lb"}
      
    }

    link: {
      // Outside -> FrontEnd (LB connector)
			self: service: to: "serviceconnector"
      serviceconnector: to: frontend: "entrypoint"

      // Frontend -> DBManager (LB connector)
			frontend: dbclient: to: "fedbmconnector"
      fedbmconnector: to: dbmanager: "entrypoint"

      // Frontend -> JQManager (LB connector)
			frontend: jqclient: to: "fejqmconnector"
      fejqmconnector: to: jqmanager: "entrypoint"

      // JQManager -> DBManager (LB connector)
			jqmanager: dbclient: to: "jqmdbmconnector"
      jqmdbmconnector: to: dbmanager: "entrypoint"

      // DBManager -> MongoDB (LB connector)
			dbmanager: mongodbclient: to: "mongoconnector"
      mongoconnector: to: mongodb: "entrypoint"

      // Worker -> DBManager (LB connector)
			worker: dbclient: to: "wdbmconnector"
      wdbmconnector: to: dbmanager: "entrypoint"

      // Worker -> JQManager (LB connector)
			worker: jqclient: to: "wjqmconnector"
      wjqmconnector: to: jqmanager: "entrypoint"

      // Scaler -> JQManager (LB connector)
			scaler: jqclient: to: "sjqmconnector"
      sjqmconnector: to: jqmanager: "entrypoint"
   }
  }
}