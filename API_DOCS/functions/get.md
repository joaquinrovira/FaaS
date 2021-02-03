# Get function details

Get the details of a given user's function. Responds with an object with two parameters `f_name` and `src`. 

- `f_name` is the same function name as requested.
- `src` is the source code of the function.

**URL** : `/u/:u_name/fn/:f_name`

**Method** : `GET`

**Response** : `{ fname: string, src: string }`


## Example
**Request**
```bash
curl -X GET $URL/u/user1/fn/add
```

**Response**
```json
{
    "error": false,
    "res": {
        "f_name": "add",
        "src": "function add(a,b) {return a+b;}"
    }
}
```
