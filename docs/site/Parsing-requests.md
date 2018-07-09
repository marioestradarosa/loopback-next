---
lang: en
title: 'Parsing requests'
keywords: LoopBack 4.0, LoopBack 4
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Parsing-requests.html
summary:
---

## Parsing Requests

This is an action in the default HTTP sequence, it parses arguments from an
incoming request and uses them as inputs to invoke the corresponding controller
method.

This action contains 3 steps:

- Parses arguments from request query, body, path and header according to the
  operation's OpenAPI specification.
- Coerces parameters from string to its corresponding JavaScript run-time type.
- Performs validation on the parameters and body data.

### Parsing Raw Data

The code below defines a typical endpoint by decorating a controller method with
rest decorators.

```ts
class TodoController() {
  @put('/todos/{id}')
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }
}
```

An operation specification will be generated in-memory to describe it, and raw
datas are parsed from request according to the specification. For example the
first parameter is from source `path`, then its value will be parsed from a
request's path.

_See [controller](Controller.md) for more details of defining an endpoint._

_See
[OpenAPI operation object](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#operationObject)
to know more about its structure._

### Coercion

The parameters parsed from path, header, query of a http request are always in
the string format. Therefore when invoking a controller function, a parameter
need to be converted to its corresponding JavaScript runtime type, which is
inferred from its parameter specification.

Give the example operation `replaceTodo` in section
[parsing raw data](#parsing-raw-data), which takes in a number `id` as the first
input, coercion means users don't need to do a type conversion by themselves in
the controller function like below:

```ts
@put('/todos/{id}')
async replaceTodo(
  @param.path.number('id') id: number,
  @requestBody() todo: Todo,
): Promise<boolean> {
  // NO need to do the "string to number" convertion as below
  id = +id;
  return await this.todoRepo.replaceById(id, todo);
}
```

### Validation

Validations are applied on the parameters and the request body data. They also
use OpenAPI specification as the reference to infer the validation rules.

#### Parameters

We have the data type safety check for the parameters parsed from header, path,
query. For example, if a parameter should be an integer, then a number with
decimal like "1.23" will be rejected.

You can specify a parameter's type by calling shortcut decorators of `@param`
like `@param.query.integer()`. A list of available shortcuts can be found in the
[api documents](https://apidocs.strongloop.com/@loopback%2fdocs/openapi-v3.html#param).
And please check [parameter decorators](Decorators.md#parameter-decorator) for
how to decorate the controller parameter.

Here are our default validation rules for each type:

- number: validated by `isNaN(Number(data))`.
- integer: validated by `Number.isInteger(data)`.
- long: validated by `Number.isSafeInteger(data)`.
- date-time: should be a valid date-time defined in
  [RFC3339](https://xml2rfc.tools.ietf.org/public/rfc/html/rfc3339.html#anchor14).
- date: should be a valid full-date defined in
  [RFC3339](https://xml2rfc.tools.ietf.org/public/rfc/html/rfc3339.html#anchor14).
- boolean: after converted to all upper case, should be one of the following
  values: `TRUE`, `1`, `FALSE` or `0`.

#### Request Body

The data from request body is validated against its OpenAPI schema
specification. We use module [AJV](https://github.com/epoberezkin/ajv) to
perform the validation, which validates data with a JSON schema generated from
the OpenAPI schema specification.

Take operation `replaceTodo` as an instance again:

```ts
import {Todo} from './models/todo-model.ts';

...
  @put('/todos/{id}')
  async replaceTodo(
    @param.path.number('id') id: number,
    @requestBody() todo: Todo,
  ): Promise<boolean> {
    return await this.todoRepo.replaceById(id, todo);
  }
...
```

The request body specification is defined by applying `@requestBody()` to
argument `todo`, and the schema specification inside it is inferred from its
type `Todo`. The type is exported from a `Todo` model.

_See [model](Model.md) to know more details about how to decorate a model class_

When the `PUT` method `/todo/{id}` get called, the `todo` instance from request
body will be validated with a well defined specification.

Section [RequestBody Decorator](Decorators.md#requestbody-decorator) has a very
detailed explanation of the various ways to provide a request body
specification. It would be a redundant to repeat it here. So make sure you read
that section to understand how to use `@requestBody()`.

A few tips worth mentioning:

- If a model property's type refers to another model, make sure it is also
  decorated with `@model` decorator.

- By the API first approach, you can also provide the request body specification
  in decorators like `route()` and [`api()`](Decorators.md#api-decorator), this
  requires you to provide a completed request body specification.

#### Localizing errors

A body data may contain multiple invalid things, like missing required field,
data in a wrong type, data that exceeds the maximum length, etc...The validation
errors are returned in batch mode, and user can find all of them in
`error.details`, which describes errors in a machine-readable way.

_Note: I am adding more stuff after PR
https://github.com/strongloop/loopback-next/pull/1511 lands_
