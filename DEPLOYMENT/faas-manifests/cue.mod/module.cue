module: "joarosa.systems/faas"

creds = {
  kumori: {
    type: "token",
    username: "cuacua",
    token: "xB17FTzNCsgko3533Mnf"
  }
}

dependencies: {
  "kumori.systems/kumori": {
    repository: "https://gitlab.com/kumori/cuemodules/kumori"
    credentials: creds.kumori
    tag: "2.0.1-alpha2"
  }
}
