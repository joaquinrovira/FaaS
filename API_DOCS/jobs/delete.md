# Dequeue job

Removes from the execution queue. As long as no error is returned, the operation completed successfully.

**URL** : `/j/:job_id`

**Method** : `DELETE`

**Response** : `Any`


## Example
**Request**
```bash
curl -X DELETE $URL/j/5ff867daccccb5e5167f5a0f
```

**Response**
```json
{
    "error": false,
    "res": 1
}
```
