# Get job status


Get the result of a job execution. Responds with the return value of the function call or execution errors if any ocurred. The return value is always a string, even if the function returned some other type.

**URL** : `/j/:job_id/res`

**Method** : `GET`

**Response** : `string`


## Example
**Request**
```bash
curl -X GET $URL/j/5ff867daccccb5e5167f5a0f/res
```

**Response**
```json
{
    "error": false,
    "res": "11"
}
```
