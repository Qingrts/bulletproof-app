sys_user: 用户基础信息。
sys_role: 角色定义。
sys_menu: 菜单及权限码（如 system:user:add）。
sys_user_role: 用户角色关联。
sys_role_menu: 角色权限关联。
sys_dept: 部门/组织机构。


1. 核心表结构设计
1.1 用户表 (sys_user)
存储账号核心信息。

id: 主键 (UUID 或 Snowflake ID)
username: 登录账号 (唯一索引)
password: 加密后的密码
nickname: 昵称
dept_id: 所属部门 ID (外键)
status: 状态 (0-正常, 1-禁用)
create_time / update_time: 时间戳

1.2 角色表 (sys_role)
定义权限的集合载体。

id: 主键
role_name: 角色名称 (如：超级管理员、财务专员)
role_key: 角色标识权限字符串 (如：admin, finance_staff)
data_scope: 数据范围 (1-全部, 2-本部门, 3-本人等)
sort_order: 显示排序

1.3 菜单/权限资源表 (sys_menu)
最核心的资源定义表，采用树形结构。

id: 主键
parent_id: 父菜单 ID (顶级为 0)
title: 菜单/按钮名称
type: 类型 (M-目录, C-菜单, F-按钮)
path: 路由地址 (前端跳转用)
component: 组件路径 (如：system/user/index)
perms: 权限标识字符串 (如：system:user:add)
app_id: 归属子系统 ID (用于区分不同应用的资源)

1.4 部门表 (sys_dept)
组织架构定义。

id: 主键
parent_id: 父部门 ID
ancestors: 祖级列表 (冗余字段，如 0,1,5, 方便递归查询)
dept_name: 部门名称


<!-- sys_field_privilege -->
字段名           类型, 说明, 示例
id,             Long, 主键, 1
menu_id,        Long, 关联的菜单/页面 ID, 1024 (订单页面)
field_code,     String,数据库字段名或 DTO 属性名,total_amount
field_name,     String,展示名称,订单总金额
control_type,   Integer,控制类型,"1-可见, 2-可编辑, 3-脱敏"

<!-- sys_role_field -->
字段名,          类型,                说明
role_id,        Long,               角色 ID
field_id,       Long,               字段权限 ID
perm_type,      Integer             "具体权限（0-无权限, 1-只读, 2-读写, 3-脱敏）"



图表
 + 所有
 + 柱状图
   + 柱状图
   + 横向柱状图
 + 折线图
 + 饼图
 + 散点图
信息
 + 所有
 + 文本
   + 文字
   + 渐变文字
   + 弹幕文字
 + 控件
   + 时间选择器
   + 下拉选择器
 + 更多
