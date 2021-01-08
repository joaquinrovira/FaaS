# Register function

Execute a function. The parameters are given via the post body. Responds with the queue's job's id.

**URL** : `/u/:u_name/fn/:f_name`

**Method** : `POST`

**Response** : `Job ID`

**Data constraints**

The body of the `POST` request must be an array of parameters for the job. Any content-type allowed. 

*Example body:* 
```json
[4,7]
```

## Example
**Request**
```bash
curl -X POST -d "[4,7]" $URL/u/user1/fn/add/run
```

**Response**
```json
{
    "error": false,
    "res": "5ff867daccccb5e5167f5a0f"
}
```
