# Register function

Register a function. As this is a basic implementation, it doesn't do any code verification checks. The function should be valid source code of a [`NodeJS`](https://nodejs.org/) function. As long as no error is returned, the operation completed successfully.

**URL** : `/u/:u_name/fn/:f_name`

**Method** : `POST`

**Response** : `Any`

**Data constraints**

The body of the `POST` request must be the source code of the function. Any content-type and async functions are allowed.

*Example body:* 
```
function NAME(param1, param2, ....) {
    ...
    return X;
}
```

## Example
**Request**
```bash
curl -X POST -d "function add(a,b){return a+b;}" $URL/u/user1/fn/add
```

**Response**
```json
{
    "error": false,
    "res": 1
}
```
