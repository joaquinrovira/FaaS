# Unregister user

Removes the user from the database. As long as no error is returned, the operation completed successfully.

**URL** : `/u/:u_name`

**Method** : `DELETE`

**Response** : `Any`


## Example
**Request**
```bash
curl -X DELETE $URL/u/user1
```

**Response**
```json
{
    "error": false,
    "res": 1
}
```
