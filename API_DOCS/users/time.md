# Get user's accumulated execution time

Get user's accumulated execution time. Each time a function is executed via the service, the execution time of each call is added to a user's account for (future) billing. Responds with the total execution time in *ms*. 

**URL** : `/u/:u_name/time`

**Method** : `GET`

**Response** : `int`


## Example
**Request**
```bash
curl -X GET $URL/u/user1/time
```

**Response**
```json
{
    "error": false,
    "res": 125156
}
```
