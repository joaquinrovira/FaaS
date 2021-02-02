# FaaS REST API Documentation

This is a basic REST API implementation of a Function as a Service (FaaS) application. All messages received from the API have the following structure:

```json
{
    "error": "<Boolean>",
    "res": "<Content>"
}
```

The `error` paramenter accounts for any unknown errors happening server-side. If the server answers with an `error: true` message, the response parameter `res` will contain further information about the error.

If the request completes successfully with `error: false`, the response paramenter `res` will contain the message as detailed in the API documentation below.

## Users

Endpoint used to manage existing **users**. Basic implementation with no secutity checks.

* [Registration](users/post.md) : `POST /u/:u_name`
* [Unregister](users/delete.md) : `DELETE /u/:u_name`


## Functions

Endpoint used to manage users' **functions**. 

* [List user functions](functions/get_all.md) : `GET /u/:u_name/fn`
* [Get function details](functions/get.md) : `GET /u/:u_name/fn/:f_name`
* [Register function](functions/post.md) : `POST /u/:u_name/fn/:f_name`
* [Unregister function](functions/delete.md) : `DELETE /u/:u_name/fn/:f_name`
* [Execute function](functions/execute.md) : `POST /u/:u_name/fn/:f_name/run`


## Jobs

Endpoint used to manage function calls, known as **jobs**.

* [Get job status](jobs/get_status.md) : `GET /j/:job_id`
* [Get job result](jobs/get_result.md) : `GET /j/:job_id/res`
* [Remove job](jobs/delete.md) : `DELETE /j/:job_id`