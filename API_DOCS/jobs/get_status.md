# Get job status


Get the details of the progress of a job execution. Responds with a number: 

- `0` the job is in queue.
- `1` the job is done and the result is available.

**URL** : `/j/:job_id`

**Method** : `GET`

**Response** : `status`


## Example
**Request**
```bash
curl -X GET $URL/j/5ff867daccccb5e5167f5a0f
```

**Response**
```json
{
    "error": false,
    "res": 0
}
```
