# Register user

Adds a new user to the database. If the user already existed it is deleted, and substituted by a new one (i.e. the functions are deleted). As long as no error is returned, the operation completed successfully.

**URL** : `/u/:u_name`

**Method** : `POST`

**Response** : `Any`


## Example
**Request**
```bash
curl -X POST $URL/u/user1
```

**Response**
```json
{
    "error": false,
    "res": 1
}
```
