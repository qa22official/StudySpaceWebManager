# API 接口文档

基础地址：`http://127.0.0.1:5000/api`

统一响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

错误响应：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "错误原因",
  "data": null
}
```

## 鉴权说明

登录成功后，接口会返回 `access_token`。需要鉴权的接口必须在请求头中携带：

```http
Authorization: Bearer <access_token>
```

权限规则：

| 接口类型 | 需要身份 |
| --- | --- |
| `/admin/**` | 管理员 token |
| `POST /reservations` | 学生 token |
| `GET /reservations` | 学生或管理员 token |
| `POST /reservations/{id}/check-in` | 学生 token，且只能操作自己的预约 |
| `POST /reservations/{id}/cancel` | 学生 token，且只能操作自己的预约 |
| `/dashboard/**`、`/reports/**`、`/blacklist` | 管理员 token |

## 1. 认证与账户

### 学生登录

`POST /auth/student/login`

```json
{
  "student_id": "20260001",
  "password": "123456"
}
```

说明：学生登录必须校验数据库中的密码。

返回中的 `access_token` 用于后续学生预约、签到、取消和查询自己的预约。

### 学生修改密码

`PATCH /auth/student/password`

需要学生 token。

请求体：
```json
{
  "old_password": "旧密码",
  "new_password": "新密码"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "updated": true
  }
}
```

### 管理员登录

`POST /auth/admin/login`

```json
{
  "admin_id": "admin",
  "password": "admin123"
}
```

返回中的 `access_token` 用于后续管理员接口。

## 2. 管理员管理学生

### 查询学生

`GET /admin/students?keyword=张三&status=active`

需要管理员 token。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "20260001",
      "name": "张三",
      "college": "信息学院",
      "major": "软件工程",
      "status": "active",
      "violation_count": 0,
      "created_at": "2026-07-02T18:25:21",
      "updated_at": "2026-07-02T18:25:21"
    }
  ]
}
```

### 添加学生

`POST /admin/students`

需要管理员 token。

```json
{
  "id": "20260002",
  "name": "李四",
  "password": "123456",
  "college": "信息学院",
  "major": "计算机科学与技术",
  "status": "active"
}
```

响应：
```json
{
  "code": 0,
  "message": "created",
  "data": {
    "id": "20260002",
    "name": "李四",
    "college": "信息学院",
    "major": "计算机科学与技术",
    "status": "active",
    "violation_count": 0,
    "created_at": "2026-07-07T14:50:00",
    "updated_at": "2026-07-07T14:50:00"
  }
}
```

### 修改学生

`PATCH /admin/students/{student_id}`

需要管理员 token。

管理员可修改学生基础信息和密码：

```json
{
  "name": "李四",
  "password": "new-password",
  "status": "active"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "20260002",
    "name": "李四",
    "college": "信息学院",
    "major": "计算机科学与技术",
    "status": "active",
    "violation_count": 0,
    "created_at": "2026-07-07T14:50:00",
    "updated_at": "2026-07-07T14:51:00"
  }
}
```

### 删除学生

`DELETE /admin/students/{student_id}`

说明：学生存在未结束预约时不允许删除。

需要管理员 token。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "deleted": true
  }
}
```

## 3. 自习室管理

### 查询自习室

`GET /rooms`

查询参数：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| campus | 否 | `翔安校区` 或 `思明校区` |
| building | 否 | 楼栋 |
| floor | 否 | 楼层 |

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "room_dw_301",
      "campus": "翔安校区",
      "building": "德望图书馆",
      "floor": 3,
      "name": "德望图书馆三楼自习室",
      "open_time": "08:00",
      "close_time": "22:30",
      "total_seats": 24,
      "status": "open",
      "created_at": "2026-07-02T18:25:21",
      "updated_at": "2026-07-02T18:25:21"
    }
  ]
}
```

### 创建自习室

`POST /rooms`

需要管理员 token。

```json
{
  "campus": "翔安校区",
  "building": "德望图书馆",
  "floor": 3,
  "name": "德望图书馆三楼自习室",
  "open_time": "08:00",
  "close_time": "22:30",
  "total_seats": 24
}
```

响应：
```json
{
  "code": 0,
  "message": "created",
  "data": {
    "id": "room_dw_301",
    "campus": "翔安校区",
    "building": "德望图书馆",
    "floor": 3,
    "name": "德望图书馆三楼自习室",
    "open_time": "08:00",
    "close_time": "22:30",
    "total_seats": 24,
    "status": "open",
    "created_at": "2026-07-07T14:50:00",
    "updated_at": "2026-07-07T14:50:00"
  }
}
```

厦门大学校区规则：

| 校区 | 楼栋限制 |
| --- | --- |
| 思明校区 | 楼栋不做具体限制，楼层必须大于 0 |
| 翔安校区 | 只能使用下表楼栋和楼层范围 |

翔安校区楼栋：

| 楼栋 | 最高楼层 |
| --- | --- |
| 一号楼-学武楼 | 5 |
| 二号楼-坤銮楼 | 5 |
| 西部片区2号楼 | 2 |
| 西部片区4号楼 | 3 |
| 德望图书馆 | 6 |

### 自习室详情

`GET /rooms/{room_id}`

返回自习室基础信息和座位列表。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "room_dw_301",
    "campus": "翔安校区",
    "building": "德望图书馆",
    "floor": 3,
    "name": "德望图书馆三楼自习室",
    "open_time": "08:00",
    "close_time": "22:30",
    "total_seats": 24,
    "status": "open",
    "created_at": "2026-07-02T18:25:21",
    "updated_at": "2026-07-02T18:25:21",
    "seats": [
      {
        "id": "room_dw_301_seat_01",
        "room_id": "room_dw_301",
        "code": "1-1",
        "row": 1,
        "col": 1,
        "status": "available",
        "power_socket": true
      }
    ]
  }
}
```

### 更新自习室

`PATCH /rooms/{room_id}`

需要管理员 token。

请求体：
```json
{
  "name": "德望图书馆三楼自习室(改)",
  "open_time": "08:30"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "room_dw_301",
    "campus": "翔安校区",
    "building": "德望图书馆",
    "floor": 3,
    "name": "德望图书馆三楼自习室(改)",
    "open_time": "08:30",
    "close_time": "22:30",
    "total_seats": 24,
    "status": "open",
    "created_at": "2026-07-02T18:25:21",
    "updated_at": "2026-07-07T14:52:00"
  }
}
```

### 删除自习室

`DELETE /rooms/{room_id}`

说明：自习室存在未结束预约时不允许删除。

需要管理员 token。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "deleted": true
  }
}
```

## 4. 查询座位状态

`GET /rooms/{room_id}/seats`

查询参数：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| date | 是 | 日期，格式 `YYYY-MM-DD` |
| start_time | 是 | 开始时间，格式 `HH:MM` |
| end_time | 是 | 结束时间，格式 `HH:MM` |

示例：

```bash
curl "http://127.0.0.1:5000/api/rooms/room_dw_301/seats?date=2026-07-02&start_time=09:00&end_time=11:00"
```

响应：

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "room_dw_301_seat_01",
      "room_id": "room_dw_301",
      "code": "1-1",
      "row": 1,
      "col": 1,
      "status": "available", 
      "booking_status": "available",
      "power_socket": true,
      "reservation_id": null
    },
    {
      "id": "room_dw_301_seat_02",
      "room_id": "room_dw_301",
      "code": "1-2",
      "row": 1,
      "col": 2,
      "status": "occupied",
      "booking_status": "occupied",
      "power_socket": false,
      "reservation_id": "resv_xyz123"
    }
  ]
}
```
*(注：返回中的 `status` 和 `booking_status` 均代表该座位在此查询时间段内的预订状态，取值为 `available` 可用、`occupied` 已占座、`maintenance` 维护中。)*

## 5. 创建预约

`POST /reservations`

需要学生 token。后端会从 token 中读取学生学号，前端不用传 `student_id`，也不能代替其他学生预约。

```json
{
  "room_id": "room_dw_301",
  "seat_id": "room_dw_301_seat_01",
  "date": "2026-07-02",
  "start_time": "09:00",
  "end_time": "11:00"
}
```

业务限制：

- 学生必须存在于数据库。
- 黑名单学生不可预约。
- 单日预约次数默认最多 2 次。
- 同一学生同一时间段不可重复预约。
- 同一座位同一时间段不可重复预约。
- 预约时间必须在自习室开放时间内。

响应：
```json
{
  "code": 0,
  "message": "created",
  "data": {
    "id": "resv_abcdef1234",
    "student_id": "20260001",
    "student_name": "张三",
    "room_id": "room_dw_301",
    "seat_id": "room_dw_301_seat_01",
    "date": "2026-07-02",
    "start_time": "09:00",
    "end_time": "11:00",
    "status": "active",
    "created_at": "2026-07-07T14:53:00",
    "checked_in_at": null,
    "cancelled_at": null,
    "released_at": null,
    "reason": null
  }
}
```

## 6. 查询预约

`GET /reservations`

需要学生或管理员 token。

说明：

- 学生 token 只能查询自己的预约，即使传其他 `student_id` 也会被忽略。
- 管理员 token 可以按查询参数筛选所有预约。

查询参数：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| student_id | 否 | 学号 |
| room_id | 否 | 自习室 ID |
| status | 否 | `active`、`checked_in`、`cancelled`、`released`、`no_show` |
| date | 否 | 日期 |

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "resv_abcdef1234",
      "student_id": "20260001",
      "student_name": "张三",
      "room_id": "room_dw_301",
      "seat_id": "room_dw_301_seat_01",
      "date": "2026-07-02",
      "start_time": "09:00",
      "end_time": "11:00",
      "status": "active",
      "created_at": "2026-07-07T14:53:00",
      "checked_in_at": null,
      "cancelled_at": null,
      "released_at": null,
      "reason": null
    }
  ]
}
```

## 7. 签到和取消

### 预约签到

`POST /reservations/{reservation_id}/check-in`

需要学生 token，且只能签到自己的预约。

规则：

- 预约开始前 30 分钟内可签到。
- 预约开始后默认 15 分钟内可签到。
- 超过宽限时间后，后台定时扫描会释放座位并记录爽约。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "resv_abcdef1234",
    "student_id": "20260001",
    "student_name": "张三",
    "room_id": "room_dw_301",
    "seat_id": "room_dw_301_seat_01",
    "date": "2026-07-02",
    "start_time": "09:00",
    "end_time": "11:00",
    "status": "checked_in",
    "created_at": "2026-07-07T14:53:00",
    "checked_in_at": "2026-07-07T14:55:00",
    "cancelled_at": null,
    "released_at": null,
    "reason": null
  }
}
```

### 学生取消预约

`POST /reservations/{reservation_id}/cancel`

需要学生 token，且只能取消自己的预约。

```json
{
  "reason": "临时有事"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "resv_abcdef1234",
    "student_id": "20260001",
    "student_name": "张三",
    "room_id": "room_dw_301",
    "seat_id": "room_dw_301_seat_01",
    "date": "2026-07-02",
    "start_time": "09:00",
    "end_time": "11:00",
    "status": "cancelled",
    "created_at": "2026-07-07T14:53:00",
    "checked_in_at": null,
    "cancelled_at": "2026-07-07T14:56:00",
    "released_at": null,
    "reason": "临时有事"
  }
}
```

### 管理员释放座位

`POST /admin/reservations/{reservation_id}/release`

需要管理员 token。

```json
{
  "reason": "现场核验无人使用"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "resv_abcdef1234",
    "student_id": "20260001",
    "student_name": "张三",
    "room_id": "room_dw_301",
    "seat_id": "room_dw_301_seat_01",
    "date": "2026-07-02",
    "start_time": "09:00",
    "end_time": "11:00",
    "status": "released",
    "created_at": "2026-07-07T14:53:00",
    "checked_in_at": null,
    "cancelled_at": null,
    "released_at": "2026-07-07T14:57:00",
    "reason": "现场核验无人使用"
  }
}
```

## 8. 后台超时扫描

服务启动后会按 `OVERDUE_SCAN_INTERVAL_SECONDS` 配置定时扫描数据库，释放超时未签到的预约。

本地审查时也可以手动触发一次：

`POST /admin/tasks/release-overdue`

需要管理员 token。

返回：

```json
{
  "released_count": 1
}
```

## 9. 实时看板热力图

`GET /dashboard/rooms/{room_id}`

需要管理员 token。

查询参数：
- `date` (可选)：查询日期，格式 `YYYY-MM-DD`，默认为当天
- `time` (可选)：查询时间，格式 `HH:MM`，默认为当前服务器时间

返回该自习室指定时间点的座位热力图、总座位数、占用座位数、可用座位数和占用率。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "date": "2026-07-02",
    "time": "14:00",
    "total_seats": 24,
    "occupied_seats": 5,
    "available_seats": 19,
    "occupancy_rate": 0.2083,
    "room": {
      "id": "room_dw_301",
      "campus": "翔安校区",
      "building": "德望图书馆",
      "floor": 3,
      "name": "德望图书馆三楼自习室",
      "open_time": "08:00",
      "close_time": "22:30",
      "total_seats": 24,
      "status": "open",
      "created_at": "2026-07-02T18:25:21",
      "updated_at": "2026-07-02T18:25:21"
    },
    "heatmap": [
      {
        "seat_id": "room_dw_301_seat_01",
        "code": "1-1",
        "row": 1,
        "col": 1,
        "status": "occupied"
      },
      {
        "seat_id": "room_dw_301_seat_02",
        "code": "1-2",
        "row": 1,
        "col": 2,
        "status": "available"
      }
    ]
  }
}
```

## 10. 使用率报表

`GET /reports/usage?start_date=2026-07-01&end_date=2026-07-07`

需要管理员 token。

返回每个自习室的预约次数、使用小时数、平均使用率和热门时段。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "room_id": "room_dw_301",
      "room_name": "德望图书馆三楼自习室",
      "campus": "翔安校区",
      "building": "德望图书馆",
      "reservation_count": 12,
      "used_hours": 36.5,
      "average_usage_rate": 0.1086,
      "peak_slot": "14:00"
    }
  ]
}
```

## 11. 黑名单管理

### 查询黑名单

`GET /blacklist`

需要管理员 token。

返回当前仍在限制期内的学生黑名单。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "student_id": "20260001",
      "reason": "爽约 3 次，自动加入黑名单",
      "violation_count": 3,
      "until_date": "2026-07-09",
      "created_at": "2026-07-02T18:25:21"
    }
  ]
}
```

### 手动解除黑名单

`DELETE /admin/blacklist/{student_id}`

需要管理员 token。

解除该学生的黑名单锁定状态，并将其爽约次数/违约计数清零。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "lifted": true
  }
}
```

## 12. 基础元数据维护 (校区与楼栋)

### 查询校区列表

`GET /campuses`

无需 token，公开接口。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "campus_xa",
      "name": "翔安校区",
      "created_at": "2026-07-02T18:25:20"
    }
  ]
}
```

### 创建校区

`POST /admin/campuses`

需要管理员 token。

```json
{
  "name": "新校区名称"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "campus_new",
    "name": "新校区名称",
    "created_at": "2026-07-07T15:00:00"
  }
}
```

### 修改校区

`PATCH /admin/campuses/{campus_id}`

需要管理员 token。

```json
{
  "name": "修改后的校区名称"
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "campus_new",
    "name": "修改后的校区名称",
    "created_at": "2026-07-07T15:00:00"
  }
}
```

### 删除校区

`DELETE /admin/campuses/{campus_id}`

需要管理员 token。若该校区下仍有楼栋或自习教室绑定，将拒绝删除。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "deleted": true
  }
}
```

### 查询楼栋列表

`GET /buildings`

无需 token，公开接口。

查询参数：
- `campus_id` (可选)：按校区 ID 过滤
- `campus_name` (可选)：按校区名称过滤

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "building_dw",
      "campus_id": "campus_xa",
      "campus_name": "翔安校区",
      "name": "德望图书馆",
      "max_floor": 6,
      "created_at": "2026-07-02T18:25:20"
    }
  ]
}
```

### 创建楼栋

`POST /admin/buildings`

需要管理员 token。

```json
{
  "campus_id": "campus_xa",
  "name": "德望图书馆",
  "max_floor": 6
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "building_new",
    "campus_id": "campus_xa",
    "campus_name": "翔安校区",
    "name": "德望图书馆",
    "max_floor": 6,
    "created_at": "2026-07-07T15:00:00"
  }
}
```

### 修改楼栋

`PATCH /admin/buildings/{building_id}`

需要管理员 token。

```json
{
  "name": "修改后的楼栋名称",
  "max_floor": 8
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "building_new",
    "campus_id": "campus_xa",
    "campus_name": "翔安校区",
    "name": "修改后的楼栋名称",
    "max_floor": 8,
    "created_at": "2026-07-07T15:00:00"
  }
}
```

### 删除楼栋

`DELETE /admin/buildings/{building_id}`

解绑说明：需要管理员 token。若该楼栋下仍有自习教室绑定，将拒绝删除。

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "deleted": true
  }
}
```

## 13. 座位物理排布与属性管理

### 重置自习室座位排布

`POST /admin/rooms/{room_id}/seats/regenerate`

需要管理员 token。重置会将指定自习室现有的所有座位删除，并按指定行列排布重新生成。

> [!WARNING]
> 若该自习室目前仍有生效中或待签到的预约，重置操作将被拒绝。

```json
{
  "total_seats": 12,
  "columns": 4
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "room_dw_301",
    "campus": "翔安校区",
    "building": "德望图书馆",
    "floor": 3,
    "name": "德望图书馆三楼自习室",
    "open_time": "08:00",
    "close_time": "22:30",
    "total_seats": 12,
    "status": "open",
    "created_at": "2026-07-02T18:25:21",
    "updated_at": "2026-07-07T15:00:00"
  }
}
```

### 修改单座属性/状态

`PATCH /admin/seats/{seat_id}`

需要管理员 token。可单点修改座位的可用性状态（如设为维护状态）或插座配备。

> [!WARNING]
> 当将座位设为 `maintenance` (维护中) 时，如果该座位当前存在生效中的预订，操作将被拒绝。

```json
{
  "status": "maintenance", // 选填，'available' 或 'maintenance'
  "power_socket": false // 选填，布尔值
}
```

响应：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "room_dw_301_seat_01",
    "room_id": "room_dw_301",
    "code": "1-1",
    "row": 1,
    "col": 1,
    "status": "maintenance",
    "power_socket": false
  }
}
```
