# bb-content-copy

TODO

# Installation

```
npm install @kapitchi/bb-content-copy
```

# Usage

TODO

# API

## Classes

<dl>
<dt><a href="#CopyService">CopyService</a></dt>
<dd><p>Content copy service</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#HttpMethod">HttpMethod</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#FilesystemMethod">FilesystemMethod</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="CopyService"></a>

## CopyService
Content copy service

**Kind**: global class  

* [CopyService](#CopyService)
    * [new CopyService(copyServiceOpts, copyServiceMessagePublisher)](#new_CopyService_new)
    * [.copy(params)](#CopyService+copy) ⇒ <code>Promise</code>

<a name="new_CopyService_new"></a>

### new CopyService(copyServiceOpts, copyServiceMessagePublisher)

| Param | Type | Description |
| --- | --- | --- |
| copyServiceOpts | <code>Object</code> |  |
| copyServiceOpts.progressUpdatePeriod | <code>number</code> | How often is copyServiceProgress.next() is called |
| copyServiceMessagePublisher | <code>Object</code> |  |
| copyServiceMessagePublisher.next | <code>function</code> |  |

<a name="CopyService+copy"></a>

### copyService.copy(params) ⇒ <code>Promise</code>
Copy source to destination

**Kind**: instance method of [<code>CopyService</code>](#CopyService)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> |  |
| params.id | <code>string</code> | Unique copy operation ID |
| params.source | [<code>FilesystemMethod</code>](#FilesystemMethod) \| [<code>HttpMethod</code>](#HttpMethod) |  |
| [params.source.size] | <code>number</code> | Content size (if not provided it will be detected) |
| [params.source.mime] | <code>number</code> | MIME type of the content (if not provided it will be detected) |
| params.destination | [<code>FilesystemMethod</code>](#FilesystemMethod) \| [<code>HttpMethod</code>](#HttpMethod) |  |

<a name="HttpMethod"></a>

## HttpMethod : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Value: http |
| url | <code>string</code> |  |
| method | <code>string</code> | HTTP method |
| headers | <code>Object</code> |  |

<a name="FilesystemMethod"></a>

## FilesystemMethod : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Value: filesystem |
| path | <code>string</code> | File path |


# Development

Run the command below before release.

```
npm run build
```

## Tests

```
npm test
```

# Contribute

Please feel free to submit an issue/PR or contact me at matus.zeman@gmail.com.

# License

[MIT](LICENSE)
