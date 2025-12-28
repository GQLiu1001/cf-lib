# api-doc
## 统一返回结构
成功
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
失败
```json
{
  "code": 400,
  "message": "FAIL",
  "data": {}
}
```
分页
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "items": [],
    "page": 1,
    "size": 10,
    "total": 278
  }
}
```
## 1. 用户
### 1.1 用户登录
POST /api/v1/auth/login

权限：无

请求体
```json
{
  "username": "admin",
  "password": "Admin@123456"
}
```
成功响应
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "accessToken": "token_xxx",
    "user": {
      "id": "1",
      "username": "admin",
      "nickname": "管理员",
      "status": 1,
      "roles": ["ADMIN"]
    }
  }
}

```
### 1.2 注册
POST /api/v1/auth/register

权限：无

请求体：
```json
{
  "username": "reader99",
  "password": "Reader@123456",
  "nickname": "读者99",
  "phone": "13900009999",
  "email": "reader99@example.com"
}
```
成功响应 （注册后直接给 token）
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "accessToken": "asdiasdasdhsad...",
    "user": {
      "id": "99",
      "username": "reader99",
      "nickname": "读者99",
      "status": 1,
      "roles": ["READER"]
    }
  }
}
```
### 1.3 忘记密码
POST /api/v1/auth/password/reset

权限：无

请求体：
```json
{
  "username": "reader99",
  "newPassword": "asdawdx"
}
```
成功响应
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 1.4 退出登录
POST /api/v1/auth/logout

权限：无

成功响应
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
## 2. 角色 & 用户管理
### 2.1 用户列表（分页）
GET /api/v1/users?page=1&size=10&keyword=read&status=1

权限：ADMIN

请求参数：

- page（可选）默认1

- size（可选）默认10

- keyword（可选）

- status（可选）

成功响应（分页）
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "1",
        "username": "admin",
        "nickname": "管理员",
        "phone": "13800000001",
        "email": "admin@example.com",
        "status": 1,
        "roles": ["ADMIN"]
      },
      {
        "id": "5",
        "username": "reader01",
        "nickname": "读者01",
        "phone": "13900000001",
        "email": "reader01@example.com",
        "status": 1,
        "roles": ["READER"]
      }
    ],
    "page": 1,
    "size": 10,
    "total": 28
  }
}
```
### 2.2 新增用户
POST /api/v1/users

权限：ADMIN

请求体：
```json
{
  "username": "reader99",
  "password": "Reader@123456",
  "nickname": "读者99",
  "phone": "13900009999",
  "email": "reader99@example.com",
  "status": 1,
  "roles": ["READER"]
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 2.3 修改用户
PUT /api/v1/users/{id}

权限：ADMIN

请求体（不改密码）：
```json
{
  "nickname": "读者99-改",
  "phone": "13900009998",
  "email": "reader99_new@example.com",
  "status": 1
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 2.4 删除用户
DELETE /api/v1/users/{id}

权限：ADMIN

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 2.5 设置用户角色（覆盖式）
PUT /api/v1/users/{id}?roles=LIBRARIAN

权限：ADMIN

请求参数：roles 

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 2.6 角色列表
GET /api/v1/roles

权限：ADMIN

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "id": "1",
      "roleCode": "ADMIN",
      "roleName": "系统管理员",
      "status": 1
    },
    {
      "id": "2",
      "roleCode": "LIBRARIAN",
      "roleName": "图书管理员",
      "status": 1
    },
    {
      "id": "3",
      "roleCode": "READER",
      "roleName": "读者",
      "status": 1
    }
  ]
}
```
## 3. 图书分类（lib_category）
### 3.1 分类列表
GET /api/v1/categories

权限：无

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": [
    { "id": "1", "parentId": "0", "name": "文学", "code": "LIT" },
    { "id": "5", "parentId": "4", "name": "计算机", "code": "CS" },
    { "id": "6", "parentId": "5", "name": "人工智能", "code": "AI" }
  ]
}
```
### 3.2 新增分类
POST /api/v1/categories

权限：ADMIN,LIBRARIAN

请求体：
```json
{
  "parentId": "5",
  "name": "分布式",
  "code": "DIST"
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 3.3 修改分类
PUT /api/v1/categories/{id}

权限：ADMIN,LIBRARIAN

请求体：
```json
{
  "parentId": "5",
  "name": "分布式系统",
  "code": "DIST"
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 3.4 删除分类
DELETE /api/v1/categories/{id}

权限：ADMIN,LIBRARIAN

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
## 4. 图书书目（lib_book）
### 4.1 图书列表（分页）
GET /api/v1/books?page=1&size=10&keyword=工程化&categoryId=5

权限：无

请求参数：
- page（可选）默认1

- size（可选）默认10

- keyword（可选）

- categoryId（可选）

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "6",
        "isbn": "9787362863730",
        "title": "算法与数据结构：工程化",
        "author": "韩磊",
        "publisher": "北京大学出版社",
        "publishDate": "2025-02-20",
        "categoryId": "6",
        "tags": "AI,MySQL",
        "description": "示例数据：算法与数据结构：工程化，用于CRUD/RBAC联调与分页检索。"
      },
      {
        "id": "12",
        "isbn": "9787273461957",
        "title": "深入理解 工程化",
        "author": "高峰",
        "publisher": "北京大学出版社",
        "publishDate": "2021-10-07",
        "categoryId": "5",
        "tags": "DDD,Network,Java,OS",
        "description": "示例数据：深入理解 工程化，用于CRUD/RBAC联调与分页检索。"
      }
    ],
    "page": 1,
    "size": 10,
    "total": 2
  }
}
```
### 4.2 新增图书书目
POST /api/v1/books

权限：ADMIN,LIBRARIAN

请求体：
```json
{
  "isbn": "9787111111111",
  "title": "Go 并发编程实战",
  "author": "张三",
  "publisher": "人民邮电出版社",
  "publishDate": "2024-01-01",
  "categoryId": "7",
  "tags": "Go,Concurrency",
  "description": "用于图书管理系统练手"
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 4.3 修改图书书目
PUT /api/v1/books/{id}

权限：ADMIN,LIBRARIAN

请求体：
```json
{
  "isbn": "9787111111111",
  "title": "Go 并发编程实战（第2版）",
  "author": "张三",
  "publisher": "人民邮电出版社",
  "publishDate": "2024-01-01",
  "categoryId": "7",
  "tags": "Go,Concurrency",
  "description": "更新描述"
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 4.4 删除图书书目
DELETE /api/v1/books/{id}

权限：ADMIN,LIBRARIAN

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
## 5. 图书副本（lib_book_copy）
> 一个书目（book）可以有多个副本（copy），副本用于“借还”。
### 5.1 副本列表（分页）
GET /api/v1/copies?page=1&size=10&bookId=6&status=1

权限：无

请求参数：

- page（可选）默认1

- size（可选）默认10

- bookId（可选）

- status（可选）：1在馆 2借出 3遗失 4维修

成功响应（分页）：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "10",
        "bookId": "6",
        "copyCode": "BC2025000010",
        "location": "A-9-12",
        "status": 2
      },
      {
        "id": "11",
        "bookId": "6",
        "copyCode": "BC2025000011",
        "location": "A-9-18",
        "status": 1
      }
    ],
    "page": 1,
    "size": 10,
    "total": 2
  }
}
```
### 5.2 新增副本
POST /api/v1/copies

权限：ADMIN,LIBRARIAN

请求体：
```json
{
  "bookId": "6",
  "copyCode": "BC2025999999",
  "location": "A-1-01",
  "status": 1
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 5.3 修改副本
PUT /api/v1/copies/{id}

权限：ADMIN,LIBRARIAN

请求体：
```json
{
  "location": "A-1-02",
  "status": 4
}
```
成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 5.4 删除副本
DELETE /api/v1/copies/{id}

权限：ADMIN,LIBRARIAN

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
## 6. 借阅（lib_loan）
### 6.1 借阅记录列表（分页）
GET /api/v1/loans?page=1&size=10&userId=5&status=1

权限：ADMIN,LIBRARIAN,READER

请求参数：

- page（可选）默认1

- size（可选）默认10

- userId（可选，ADMIN/LIBRARIAN 才能用）

- status（可选）：1借出中 2已归还 3逾期未还 4取消

成功响应（分页）：
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "items": [
      {
        "id": "2",
        "loanNo": "LN20251228000002",
        "userId": "22",
        "copyId": "15",
        "borrowedAt": "2025-08-08 10:00:00",
        "dueAt": "2025-08-29 10:00:00",
        "returnedAt": null,
        "status": 3
      }
    ],
    "page": 1,
    "size": 10,
    "total": 1
  }
}
```
### 6.2 借书
POST /loans/borrow?copyId=11&days=14

权限：LIBRARIAN,READER

请求参数：

- copyId

- days

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```
### 6.3 还书
POST /api/v1/loans/return?copyId=11

权限：LIBRARIAN,READER

请求参数：

- copyId

成功响应：
```json
{
  "code": 200,
  "message": "OK",
  "data": {}
}
```

