# [系统名称]-中远海科数据库设计说明书

## 文档信息
- 文档编号：
- 编写单位：
- 编写日期：[基于本模版生成时须取**当前系统日期**，格式如：YYYY年M月D日]
- 版本号：1.0

> **生成规范：** 基于本模版生成文档时，文档信息中的「编写日期」、变更记录表中的「日期」等须使用**当前系统日期**（生成时动态获取，勿写死固定日期）。

> **项目级数据库设计文档生成要求：**
> 1. 检索当前目录下的所有详设文档，将文档中所有涉及数据库内容汇总成数据库设计文档
> 2. 要考虑已有库表，不要重复建设
> 3. 要考虑表的关联性
> 4. 必须遵守框架设计标准

> **DDL 生成要求（v1.1 新增）：**
> 1. 根据「数据库环境」中填写的**数据库类型**，为每张表生成对应数据库语法的 DDL
> 2. 每张表的 DDL 置于该表「DDL（可拷贝执行）」小节，为**完整可执行脚本**（建表 + 约束 + 索引 + 注释）
> 3. DDL 代码块内不夹杂说明文字，便于整段复制到数据库客户端直接执行

> **DDL 展示形式（v1.2 新增）：**
> 1. DDL 使用**可折叠区块**展示，默认收缩，**点击标题后再展开**，便于文档阅读时保持简洁
> 2. 采用 HTML `<details>` / `<summary>` 实现，在支持该标签的 Markdown 预览（如 GitHub、VS Code、Cursor 等）中点击即可展开/收起
> 3. 生成文档时仅保留与所选数据库类型一致的一个可折叠区块，其余删除

## 文档控制

### 变更记录

| 日期 | 作者 | 版本 | 变更索引 | 变更说明 |
|------|------|------|----------|----------|
| [日期，生成时取当前系统日期] | [作者] | V1.2 | 002 | 新增：DDL 部分收缩展示，点击后再展开（可折叠区块） |
| [日期，生成时取当前系统日期] | [作者] | V1.1 | 001 | 新增：按数据库类型生成 DDL；每表提供可拷贝执行的 DDL 脚本 |
| ... | ... | ... | ... | ... |

## 目录
1. [系统名称]数据库设计说明书
   1.1 设计概述
   1.2 数据表总体说明
   1.3 数据表详细设计（含 DDL 可拷贝执行）
   1.4 数据表关系设计
   1.5 数据库设计规范
   1.6 数据迁移说明（如适用）
   1.7 数据备份与恢复（如适用）

---

## 1. [系统名称]数据库设计说明书

### 1.1 设计概述

**设计目的：**
本文档描述[系统名称]的数据库设计，包括数据表结构、字段定义、索引、约束及表关系等，为系统开发提供数据层设计依据。

**设计范围：**
- [模块1名称]：[简要说明]
- [模块2名称]：[简要说明]
- ...

**设计依据：**
- 业务需求说明书：[文档名称/编号]
- 详细设计说明书：[文档名称/编号]
- 遵守CCF数据架构规范
- 遵守CCF框架基类说明

**数据库环境：**
- **数据库类型：** [Oracle / MySQL / PostgreSQL / KingbaseES，必填，用于生成对应 DDL]
- 数据库版本：[版本号]
- 字符集：[如：UTF8/AL32UTF8]
- 表空间：[如：USER_DATA、USER_INDEX；Oracle/KingbaseES 适用；MySQL/PostgreSQL 可填“不适用”]

**DDL 生成说明：**
- 文档中每张表的「DDL（可拷贝执行）」小节，须根据上表**数据库类型**生成**该类型**的完整 DDL
- 每段 DDL 包含：`CREATE TABLE`（含主键、唯一/检查/外键约束）、`CREATE INDEX`、表及列注释
- 生成文档时仅保留与所选数据库类型一致的一段 DDL，保证整段复制即可在客户端执行
- **展示形式（v1.2）：** DDL 以**可折叠区块**呈现，默认收缩，**点击区块标题后展开**，便于阅读与复制

---

### 1.2 数据表总体说明

**⚠️ 重要：** 所有继承框架基类的表必须在字段表格中列出对应的默认字段（与业务字段同一表格）。字段顺序：id 放最前，业务字段在中间，其余默认字段放最后。主键统一命名为 `id`，外键命名为 `xxx_id`（如主表 ord_t_order 主键 id，子表 ord_t_order_item 主键 id、外键 order_id）。

| 序号 | 表名 | 表说明 | 操作类型 | 表类型 | 实体基类 | 备注 |
|------|------|--------|----------|--------|----------|------|
| 1 | [表名1] | [表说明] | 查询、新增、修改、删除 | 主表 | BaseEntity | [备注说明] |
| 2 | [表名2] | [表说明] | 查询、新增、修改 | 子表 | BaseEntity | [备注说明] |
| 3 | [表名3] | [表说明] | 查询 | 中间表 | IdEntity | [备注说明] |
| ... | ... | ... | ... | ... | ... | ... |

**表类型说明：**
- **主表：** 业务核心表，承载主要业务数据
- **子表：** 与主表存在一对多关系，通过外键关联主表
- **中间表：** 多对多关系的关联表，表名格式为`<模块>_RT_<表名>`

**操作类型说明：** 查询、新增、修改、删除（根据实际业务需求填写）

---

### 1.3 数据表详细设计

#### 1.3.1 [表名1]（[表说明]）

**表基本信息：**
- **表名：** `[模块名称]_T_[表名称]`（如：`TAS_T_DOSSIER`）
- **表说明：** [表的业务含义和作用]
- **实体基类：** [使用的基类，如：BaseEntity<Long>、TenantBaseEntity<Long>、OrganizationBaseEntity<Long>、TreeEntity<Long, T>等]
- **表空间：** [表空间名称，如：USER_DATA]
- **表类型：** [主表/子表/中间表]
- **是否分区：** [是/否，如分区需说明分区策略]
- **关联业务：** [关联的详细设计模块/功能点]

**字段设计：**

**⚠️ 重要：默认字段与业务字段在同一表格中列出，不单独显示默认字段表。字段顺序：id 放表结构最前，业务字段在中间，其余默认字段（created_user、created_time 等）放最后。主键统一命名为 `id`，外键命名为 `xxx_id`（如子表外键 order_id 关联主表 ord_t_order.id）。**

**字段列表（默认字段与业务字段同一表）：**

| 序号 | 字段名 | 数据类型 | 长度 | 是否为空 | 默认值 | 主键 | 外键 | 字段说明 | 备注 |
|------|--------|----------|------|----------|--------|------|------|----------|------|
| 1 | id | BIGINT | - | NOT NULL | - | ✓ | - | 主键 | 继承自IdEntity/BaseEntity，放表结构最前 |
| 2 | [业务字段1] | VARCHAR2 | [长度] | [NULL/NOT NULL] | [默认值] | - | - | [字段说明] | [备注，如：业务含义、取值范围等] |
| 3 | [业务字段2] | DATE | - | NULL | - | - | - | [字段说明] | [备注] |
| 4 | [业务字段3/外键] | BIGINT | - | NULL | - | - | ✓ | [字段说明] | 外键，关联[主表名].id（如 order_id 关联 ord_t_order） |
| 5 | created_user | BIGINT | - | NULL | - | - | - | 创建人ID | 继承自BaseEntity，放表结构最后 |
| 6 | created_time | TIMESTAMP WITH TIME ZONE | - | NULL | - | - | - | 创建时间 | 继承自BaseEntity |
| 7 | modified_user | BIGINT | - | NULL | - | - | - | 修改人ID | 继承自BaseEntity |
| 8 | modified_time | TIMESTAMP WITH TIME ZONE | - | NULL | - | - | - | 修改时间 | 继承自BaseEntity |
| 9 | version | INT | - | NULL | 0 | - | - | 乐观锁版本号 | 继承自BaseEntity |
| 10 | is_delete | BOOLEAN/SMALLINT | - | NULL | false/0 | - | - | 逻辑删除标记 | 继承自BaseEntity |
| 11 | tenant_id | BIGINT | - | NULL | - | - | - | 租户ID | 继承自TenantBaseEntity（如适用） |
| 12 | org_id | BIGINT | - | NULL | - | - | - | 组织ID | 继承自OrganizationBaseEntity（如适用） |
| 13 | org_level_no | VARCHAR2 | [长度] | NULL | - | - | - | 组织层级号 | 继承自OrganizationBaseEntity（如适用） |
| 14 | ent_level_no | VARCHAR2 | [长度] | NULL | - | - | - | 企业层级号 | 继承自OrganizationBaseEntity（如适用） |

**字段设计说明：**
- **同一表格列出：** 默认字段与业务字段在同一表格中列出，不单独分表；**id 放最前，业务字段在中间，其余默认字段放最后**
- **主外键命名：** 所有主表及子表主键统一命名为 `id`；外键命名为 `xxx_id`（xxx 为主表逻辑名/简称，如 order_id）
- **字段顺序：** 非空字段在前，可空字段在后（在同一类字段内部）
- **字符类型：** 定长使用CHAR，不定长使用VARCHAR2
- **日期类型：** DATE精确到微秒；时间字段使用TIMESTAMP WITH TIME ZONE

**索引设计：**

| 序号 | 索引名 | 索引类型 | 索引字段 | 是否唯一 | 说明 |
|------|--------|----------|----------|----------|------|
| 1 | IND_[表名]_U1 | 唯一索引 | id | 是 | 主键索引 |
| 2 | IND_[表名]_N1 | 普通索引 | [字段1], [字段2] | 否 | [索引说明，如：用于查询条件、排序等] |
| 3 | IND_[表名]_N2 | 普通索引 | [字段3] | 否 | [索引说明] |
| ... | ... | ... | ... | ... | ... |

**索引设计规范：** 单个表索引不超过5个；小表（<5000条）不创建索引；索引重复率不超过20%；将差别数最多的列放在索引最前面；ORDER BY DESC时创建DESC索引

**约束设计：**

| 约束类型 | 约束名称 | 约束字段 | 说明 |
|----------|----------|----------|------|
| 主键约束 | PK_[表名] | id | 主键约束 |
| 唯一约束 | UK_[表名]_[字段] | [字段名] | [唯一性约束说明] |
| 检查约束 | CK_[表名]_[字段] | [字段名] | [检查约束说明，如：取值范围限制] |
| 外键约束 | FK_[表名]_[字段] | [字段名] | [外键约束说明，关联表名] |
| ... | ... | ... | ... |

**约束设计规范：** 必须设置主键；唯一性约束允许为空；检查约束用于限制特定值（如性别、状态等）；外键约束保证引用完整性；触发子约束一般不使用

**表注释：**
```sql
COMMENT ON TABLE [表名] IS '[表说明]';
COMMENT ON COLUMN [表名].[字段名] IS '[字段说明]';
```

**DDL（可拷贝执行）：**

以下为可折叠区块，**点击标题展开**后即可查看/复制。根据文档「数据库环境」所填数据库类型择一保留；生成文档时**仅保留与所选数据库类型一致的一个区块**，整段复制到对应数据库客户端即可执行。

<details>
<summary><strong>▶ 点击展开 DDL（Oracle / KingbaseES）</strong></summary>

```sql
-- [表名] DDL (Oracle/KingbaseES)，可直接复制执行
CREATE TABLE [表名] (
    id                 NUMBER(20) NOT NULL,
    [业务字段1]        VARCHAR2([长度]) [NULL|NOT NULL] [DEFAULT 默认值],
    [业务字段2]        DATE,
    [业务字段3_外键]   NUMBER(20),
    created_user       NUMBER(20),
    created_time       TIMESTAMP WITH TIME ZONE,
    modified_user      NUMBER(20),
    modified_time      TIMESTAMP WITH TIME ZONE,
    version            NUMBER(10) DEFAULT 0,
    is_delete          NUMBER(1) DEFAULT 0
) TABLESPACE USER_DATA;

ALTER TABLE [表名] ADD CONSTRAINT PK_[表名] PRIMARY KEY (id) USING INDEX TABLESPACE USER_INDEX;
ALTER TABLE [表名] ADD CONSTRAINT UK_[表名]_[字段] UNIQUE ([字段名]);
ALTER TABLE [表名] ADD CONSTRAINT CK_[表名]_[字段] CHECK ([字段名] 条件);
ALTER TABLE [表名] ADD CONSTRAINT FK_[表名]_[字段] FOREIGN KEY ([字段名]) REFERENCES [主表名](id);

CREATE UNIQUE INDEX IND_[表名]_U1 ON [表名](id) TABLESPACE USER_INDEX;
CREATE INDEX IND_[表名]_N1 ON [表名]([字段1],[字段2]) TABLESPACE USER_INDEX;

COMMENT ON TABLE [表名] IS '[表说明]';
COMMENT ON COLUMN [表名].id IS '主键';
COMMENT ON COLUMN [表名].[字段名] IS '[字段说明]';
```

</details>

<details>
<summary><strong>▶ 点击展开 DDL（MySQL）</strong></summary>

```sql
-- [表名] DDL (MySQL)，可直接复制执行
CREATE TABLE `[表名]` (
    `id`               BIGINT NOT NULL,
    `[业务字段1]`      VARCHAR([长度]) [NULL|NOT NULL] [DEFAULT 默认值],
    `[业务字段2]`      DATETIME,
    `[业务字段3_外键]` BIGINT,
    `created_user`     BIGINT,
    `created_time`     TIMESTAMP NULL,
    `modified_user`    BIGINT,
    `modified_time`    TIMESTAMP NULL,
    `version`          INT DEFAULT 0,
    `is_delete`        TINYINT DEFAULT 0,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_[表名]_[字段]` (`[字段名]`),
    CONSTRAINT `CK_[表名]_[字段]` CHECK ([条件]),
    CONSTRAINT `FK_[表名]_[字段]` FOREIGN KEY (`[字段名]`) REFERENCES `[主表名]` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='[表说明]';

CREATE UNIQUE INDEX `IND_[表名]_U1` ON `[表名]`(`id`);
CREATE INDEX `IND_[表名]_N1` ON `[表名]`(`[字段1]`,`[字段2]`);
```

</details>

<details>
<summary><strong>▶ 点击展开 DDL（PostgreSQL）</strong></summary>

```sql
-- [表名] DDL (PostgreSQL)，可直接复制执行
CREATE TABLE [表名] (
    id                 BIGINT NOT NULL,
    [业务字段1]        VARCHAR([长度]) [NULL|NOT NULL] [DEFAULT 默认值],
    [业务字段2]        TIMESTAMP,
    [业务字段3_外键]   BIGINT,
    created_user       BIGINT,
    created_time       TIMESTAMPTZ,
    modified_user      BIGINT,
    modified_time      TIMESTAMPTZ,
    version            INT DEFAULT 0,
    is_delete          SMALLINT DEFAULT 0,
    CONSTRAINT PK_[表名] PRIMARY KEY (id),
    CONSTRAINT UK_[表名]_[字段] UNIQUE ([字段名]),
    CONSTRAINT CK_[表名]_[字段] CHECK ([条件]),
    CONSTRAINT FK_[表名]_[字段] FOREIGN KEY ([字段名]) REFERENCES [主表名](id)
);

CREATE UNIQUE INDEX IND_[表名]_U1 ON [表名](id);
CREATE INDEX IND_[表名]_N1 ON [表名]([字段1],[字段2]);

COMMENT ON TABLE [表名] IS '[表说明]';
COMMENT ON COLUMN [表名].id IS '主键';
COMMENT ON COLUMN [表名].[字段名] IS '[字段说明]';
```

</details>

---

#### 1.3.2 [表名2]（[表说明]）

[按照 1.3.1 的格式描述，含表基本信息、字段列表、索引、约束、表注释、**DDL（可拷贝执行）**；DDL 仅保留与文档数据库类型一致的一个可折叠区块，**点击标题后展开**。]

---

### 1.4 数据表关系设计

#### 1.4.1 表关系图

[可在此处插入ER图，或说明ER图位置]

#### 1.4.2 表关系说明

| 序号 | 主表 | 从表 | 关系类型 | 关联字段 | 说明 |
|------|------|------|----------|----------|------|
| 1 | ord_t_order | ord_t_order_item | 一对多 | ord_t_order.id = ord_t_order_item.order_id | 示例：主表主键 id，子表外键 order_id |
| 2 | [表名1] | [表名2] | 一对多 | [表名1].id = [表名2].[xxx_id] | [关系说明] |
| 3 | [表名1] | [表名3] | 多对多 | 通过中间表[表名4]关联 | [关系说明] |
| ... | ... | ... | ... | ... | ... |

#### 1.4.3 业务与数据映射

| 业务功能/模块 | 涉及表 | 主要操作 | 说明 |
|---------------|--------|----------|------|
| [功能1] | [表1], [表2] | 查询、新增、修改 | [说明] |
| [功能2] | [表1], [表3] | 查询、删除 | [说明] |
| ... | ... | ... | ... |

---

### 1.5 数据库设计规范

#### 1.5.1 命名规范

**必须遵守：**
- **表名：** `<模块名称>_T_<表名称>`（业务表）；`<模块名称>_RT_<表名称>`（中间表）
- **主键：** 统一命名为 `id`
- **外键：** 命名为 `xxx_id`（xxx 为主表逻辑名/简称，如 order_id）
- **索引：** 普通索引 `IND_<表名>_N<序号>`；位图索引 `IND_<表名>_B<序号>`；唯一索引 `IND_<表名>_U<序号>`
- **约束：** 主键 `PK_<表名>`；唯一 `UK_<表名>_<字段>`；外键 `FK_<表名>_<字段>`；检查 `CK_<表名>_<字段>`
- 使用有意义的英文词汇，避免缩写
- 不允许使用数据库关键字和保留字

#### 1.5.2 建表规范

**必须遵守：**
- 不允许将表建立在SYSTEM表空间上
- 表和索引建立在不同表空间上
- 建表时必须指明表空间
- 非空列在前，可空列在后
- 数据量大且有热数据时可分区
- 必须设置主键
- **必须添加默认字段：** 根据实体基类添加对应的默认字段（详见1.5.3），不得遗漏

#### 1.5.3 字段设计规范（基于CCF框架基类）

**基类字段规范：** 详见技术规则要求实体类设计规则

**字段设计建议：**

| Java字段名 | 数据库字段名 | Java类型 | 数据库类型 | 说明 |
|-----------|-------------|----------|-----------|------|
| id | id | ID（通常为BIGINT） | BIGINT | 主键（继承自IdEntity） |
| createdUser | created_user | ID（通常为BIGINT） | BIGINT | 创建人ID |
| createdTime | created_time | OffsetDateTime | TIMESTAMP WITH TIME ZONE | 创建时间 |
| modifiedUser | modified_user | ID（通常为BIGINT） | BIGINT | 修改人ID |
| modifiedTime | modified_time | OffsetDateTime | TIMESTAMP WITH TIME ZONE | 修改时间 |
| version | version | Integer | INT | 乐观锁版本号 |
| delete | is_delete | boolean | BOOLEAN/SMALLINT | 逻辑删除标记 |

**基类对应关系（id 放表结构最前，其余默认字段放最后，业务字段在中间）：**
- **IdEntity：** `id`
- **BaseEntity：** `id`、`created_user`、`created_time`、`modified_user`、`modified_time`、`version`、`is_delete`
- **TenantBaseEntity：** BaseEntity所有字段 + `tenant_id`
- **OrganizationBaseEntity：** TenantBaseEntity所有字段 + `org_id`、`org_level_no`、`ent_level_no`

**主外键设计规范：**
- **主键：** 所有主表及子表主键统一命名为 `id`（BIGINT）；约束命名 `PK_<表名>`
- **外键：** 命名为 `xxx_id`；约束命名 `FK_<表名>_<字段>`
- **唯一性约束：** 允许为空；命名 `UK_<表名>_<字段>`
- **检查约束：** 用于限制特定值；命名 `CK_<表名>_<字段>`

#### 1.5.4 索引设计规范

**必须遵守：**
- 使用普通B树索引
- 小表（<5000条）不创建索引
- 单个表索引不超过5个
- 索引重复率不超过20%
- 将差别数最多的列放在索引最前面
- ORDER BY DESC时创建DESC索引
- 分区表使用分区索引

**索引建议（基于CCF框架基类）：**
- 主键自动创建聚集索引
- 多租户系统必须为`tenant_id`创建索引
- 组织权限系统必须为`org_id`创建索引
- 时间范围查询建议为`created_time`、`modified_time`创建索引
- 查询未删除数据建议为`is_delete`创建索引

#### 1.5.5 SQL编写规范

**查询语句规范：**
- 表连接不超过8个表
- 嵌套查询不超过5层
- 合理使用索引
- LIKE通配符%避免出现在字符串开始
- NULL值判定会引起全表扫描
- 使用相同数据类型比较

**DML语句规范：**
- 批量操作时先删除索引再重建
- 大容量操作可暂时禁用约束和触发器
- 事务尽可能小
- 不同事务中对表的操作顺序保持一致避免死锁

#### 1.5.6 注释规范

**必须遵守：**
- 表和字段必须添加注释
- 复杂SQL语句加注释说明算法和功能
- 注释单独成行放在语句前面
- 注释采用`/**/`方式

**详细规范请参考：** `rule/Other/CCF数据架构.md`

---

### 1.6 数据迁移说明（如适用）

**迁移场景：** [如：从旧系统迁移、数据初始化等]

**迁移策略：** [迁移策略说明]

**迁移脚本：**

| 序号 | 脚本名称 | 说明 | 执行顺序 |
|------|----------|------|----------|
| 1 | [脚本1.sql] | [说明] | 1 |
| 2 | [脚本2.sql] | [说明] | 2 |
| ... | ... | ... | ... |

**回滚方案：** [回滚策略说明]

---

### 1.7 数据备份与恢复（如适用）

**备份策略：** [数据备份策略说明，如：全量备份、增量备份频率等]

**恢复策略：** [数据恢复策略说明]

**备份范围：** [需备份的表或表空间]

---

## 附录A 默认字段规则速查

**⚠️ 重要：** 所有继承框架基类的实体表在设计数据库表时，必须在字段表格中完整列出对应的所有默认字段（与业务字段同一表格）。字段顺序：id 放表结构最前，业务字段在中间，其余默认字段放最后。

| 基类 | 包含字段 |
|------|----------|
| IdEntity | id |
| BaseEntity | id, created_user, created_time, modified_user, modified_time, version, is_delete |
| TenantBaseEntity | BaseEntity + tenant_id |
| OrganizationBaseEntity | TenantBaseEntity + org_id, org_level_no, ent_level_no |

---

## 附录B 模版填写指南

### 填写说明

1. **设计概述**：说明数据库设计的目的、范围、依据及环境；**数据库类型**必填，用于生成对应 DDL
2. **数据表总体说明**：列出所有表的概览，包括表名、说明、操作类型、表类型、实体基类
3. **数据表详细设计**：按表逐一设计，包括：
   - 表基本信息
   - 字段列表（**默认字段与业务字段同一表**，id 最前，业务字段中间，默认字段最后）
   - 索引设计
   - 约束设计
   - 表注释 SQL
   - **DDL（可拷贝执行）**：根据数据库类型生成一种完整 DDL，使用**可折叠区块**（点击标题后展开），整段可复制执行
4. **数据表关系设计**：说明表之间的关联关系及业务与数据映射
5. **数据库设计规范**：引用CCF规范，项目特有规范可在此补充
6. **数据迁移/备份**：如有需要则填写

### 注意事项

- **日期填写：** 基于本模版生成文档时，须使用**当前系统日期**
- 所有占位符（用[]括起来的内容）需要替换为实际内容
- 根据实际业务需求，可增加或删除表及字段
- 数据表设计必须遵循CCF数据架构规范
- **默认字段与业务字段同一表**：不单独显示默认字段表，字段顺序：id → 业务字段 → 默认字段
- **主外键命名**：主键 `id`，外键 `xxx_id`
- **DDL**：每表仅保留与「数据库环境」中数据库类型一致的一个可折叠区块，保证可拷贝执行；**DDL 默认收缩，点击标题后展开**（v1.2）

---

## 附录C DDL 按数据库类型语法对照（供生成 DDL 时参考）

| 设计类型/项 | Oracle / KingbaseES | MySQL | PostgreSQL |
|-------------|---------------------|-------|------------|
| 主键/大整型 | NUMBER(20) | BIGINT | BIGINT |
| 整型 | NUMBER(10) | INT | INT |
| 小整型/布尔 | NUMBER(1) | TINYINT | SMALLINT |
| 变长字符串 | VARCHAR2(n) | VARCHAR(n) | VARCHAR(n) |
| 日期时间 | TIMESTAMP WITH TIME ZONE | TIMESTAMP / DATETIME | TIMESTAMPTZ |
| 大文本 | CLOB | LONGTEXT | TEXT |
| 表空间 | TABLESPACE USER_DATA | 不适用 | 可选 TABLESPACE |
| 主键约束 | ADD CONSTRAINT PK_xxx PRIMARY KEY (id) USING INDEX TABLESPACE USER_INDEX | PRIMARY KEY (`id`) | CONSTRAINT PK_xxx PRIMARY KEY (id) |
| 注释 | COMMENT ON TABLE/COLUMN ... IS '...' | COMMENT='...' 或 列后 COMMENT '...' | COMMENT ON TABLE/COLUMN ... IS '...' |
| 标识符引号 | 无（或双引号） | 反引号 \` | 双引号 "（通常不用） |

生成文档时，根据 1.1 节「数据库环境」所填数据库类型，仅输出该类型的一段完整 DDL（置于可折叠区块内），便于点击展开后直接拷贝执行。
