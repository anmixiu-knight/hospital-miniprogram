---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

# Authentication

# 通用模块

## POST 通用登录

POST /user/login

> Body 请求参数

```json
{
  "username": "ss",
  "password": "123"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## PUT 通用修改密码

PUT /user/update

> Body 请求参数

```json
{
  "oldPassword": "123",
  "newPassword": "123456"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 获取当前用户信息

GET /user/status

> 返回示例

> 200 Response

```json
{
  "success": false,
  "message": "鉴权错误: 您未登录\n",
  "code": 6
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## DELETE 通用登出

DELETE /user/logout

> 返回示例

> 200 Response

```json
{
  "success": false,
  "message": "鉴权错误: 您未登录\n",
  "code": 6
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 超级管理员

## POST 医生注册

POST /admin/doctor/register

> Body 请求参数

```json
{
  "username": "ss2",
  "password": "123456",
  "phone": "11115555"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 查询医生列表

GET /admin/doctor/show

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|limit|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## PUT 超级管理员重置医生密码

PUT /admin/doctor/reset/{doctorid}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|doctorid|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## PUT 提升医生权限

PUT /admin/doctor/upgrade/{doctorid}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|doctorid|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## DELETE 删除医生

DELETE /admin/doctor/delete/{doctorid}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|doctorid|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 医生

## POST 患者注册

POST /doctor/patient/register

> Body 请求参数

```json
{
  "clinicNumber": "11451"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 患者参数

POST /doctor/input

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|age|query|string| 否 |none|
|polypsNumber|query|string| 否 |none|
|longDiameter|query|string| 否 |none|
|shortDiameter|query|string| 否 |none|
|baseType|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 保存预测结果

POST /doctor/save

> Body 请求参数

```json
{
  "clinicNumber": "11451",
  "age": 58,
  "polypsNumber": 1,
  "longDiameter": 10,
  "shortDiameter": 6,
  "baseType": 1,
  "probability": 0.2418029034351955,
  "riskLevel": "Low Risk",
  "advice": "Follow-up ultrasound is recommended at 6 months, 1 year, and 2 years; Follow-up should be discontinued after 2 years in the absence of growth"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 患者记录

GET /doctor/patient/history

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|limit|query|string| 否 |none|
|clinicNumber|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## PUT 追踪记录

PUT /doctor/update

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|formId|query|string| 否 |none|
|isWorse|query|string| 否 |0表示空，1表示非恶性，-1表示恶性？|
|comment|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## DELETE 表单删除

DELETE /doctor/delete/{formid}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|formid|path|string| 是 |none|

> 返回示例

> 200 Response

```json
"404 page not found"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 后台

## GET 查询记录

GET /backstage/get

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|limit|query|string| 否 |none|
|doctorId|query|string| 否 |none|
|doctorName|query|string| 否 |none|
|clinicNumber|query|string| 否 |none|
|age_min|query|string| 否 |none|
|age_max|query|string| 否 |none|
|polypsNumber_min|query|string| 否 |none|
|polypsNumber_max|query|string| 否 |none|
|longDiameter_min|query|string| 否 |none|
|longDiameter_max|query|string| 否 |none|
|shortDiameter_min|query|string| 否 |none|
|shortDiameter_max|query|string| 否 |none|
|baseType|query|string| 否 |none|
|riskLevel|query|string| 否 |none|
|comment|query|string| 否 |模糊搜索|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# 模型

## GET 检查模型加载是否正常

GET /health

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 进行预测

POST /predict

> Body 请求参数

```json
{
  "age": 48,
  "polyps": 1,
  "long_diameter": 10,
  "short_diameter": 6,
  "base": 1
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» age|body|integer| 是 |none|
|» polyps|body|integer| 是 |none|
|» long_diameter|body|integer| 是 |none|
|» short_diameter|body|integer| 是 |none|
|» base|body|integer| 是 |none|

> 返回示例

> 200 Response

```json
{
  "result": {
    "probability": 0,
    "risk_level": "string",
    "risk_level_cn": "string",
    "advice": "string"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» result|object|true|none||none|
|»» probability|number|true|none||none|
|»» risk_level|string|true|none||none|
|»» risk_level_cn|string|true|none||none|
|»» advice|string|true|none||none|

# 数据模型

