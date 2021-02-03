# List user's functions

List the current functions registered to a user. Responds with an object where the keys are the function names and the values the source code of the function.

**URL** : `/u/:u_name/fn`

**Method** : `GET`

**Response** : `{ key: string }`


## Example
**Request**
```bash
curl -X GET $URL/u/user1/fn
```

**Response**
```json
{
    "error": false,
    "res": {
        "add": "function add(a,b){return a+b;}",
        "mult": "function mult(a,b){return a*b;}"
    }
}
```
