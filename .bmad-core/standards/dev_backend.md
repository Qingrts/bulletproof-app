# Backend Framework Development Standards (dev_backend.md)

## 1. 核心架构概览 (Core Architecture)

本项目基于公司私有框架 `com.coscoshipping.framework` 开发，目标运行环境为 **JDK 21 + Spring Boot 3.5.x + MyBatis-Flex 1.11.x**，必须严格遵守以下分层架构和继承关系。

框架约束（强制）：
1. 禁止使用 `javax.validation` 而是使用 `jakarta.validation` 注解进行参数校验
2. 禁止生成Mapper,因为框架会自动生成它


### 1.1 业务包结构规范
业务代码根路径通常为 `com.coscoshipping.{project_name}.*`。建议按照业务模块（Module）进行分包管理。

- **Root**: `com.coscoshipping.*`
    - `model` (统一存放模型，或按模块下沉)
        - `.po`: 持久化对象 (Persistent Objects)
        - `.dto`: 数据传输对象 (DTOs)
        - `.vo`: 视图对象 (VOs)
    - `controller.{module}.*`: 控制层 (按业务模块划分，如 `controller.user`, `controller.order`)
    - `service.{module}.*`: 业务逻辑层 (按业务模块划分)
    - `exception`: 全局或模块异常定义

---

## 2. 实体层规范 (Entity Layer)

所有的 PO (Persistent Object) **必须** 继承框架提供的基类。严禁创建不继承基类的实体。

### 2.1 继承策略 (Inheritance Strategy)

根据业务场景选择唯一的基类：

| 业务场景         | 需继承的基类                   | 说明                              | 自动拥有的字段                                               |
| :--------------- | :----------------------------- | :-------------------------------- | :----------------------------------------------------------- |
| **普通实体**     | `BaseEntity<Long>`             | 适用于无租户、无组织架构的通用表  | `id`, `createdUser`, `createdTime`, `modifiedUser`, `modifiedTime`, `version`, `delete`(逻辑删除) |
| **SaaS租户实体** | `TenantBaseEntity<Long>`       | 适用于需隔离租户的数据表          | 上述所有字段 + `tenantId`                                    |
| **组织架构实体** | `OrganizationBaseEntity<Long>` | 适用于需挂载在部门/公司下的数据表 | 上述所有字段 + `tenantId`, `orgId`, `orgLevelNo`, `entLevelNo` |

### 2.2 实体类注解规范

必须包含以下注解：

- `@Data`, `@EqualsAndHashCode(callSuper = true)`: Lombok
- `@Schema(description = "...")`: Swagger 文档
- `@Table("table_name")`: MyBatis-Flex 表名
- `@AutoMapper(target = ClassName.class)`: MapStructPlus 自动映射

**Template:**

```java
package com.coscoshipping.project1.model.po;
import com.coscoshipping.framework.mybatisflex.entity.TenantBaseEntity;
import com.coscoshipping.framework.core.entity.BaseEntity;
import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Table;
import io.github.linpeilie.annotations.AutoMapper;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.OffsetDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "业务实体说明")
@Table("demo_t_example") // 数据库表名
@AutoMapper(target = ExampleVO.class) // 如果有VO的话
public class Example extends TenantBaseEntity<Long> { // 按需选择基类

  @Schema(description = "名称")
  @Column
  private String name;

  @Schema(description = "状态")
  @Column
  private Integer status;
}
```

---

## 3. 数据传输对象规范 (DTO Layer)

### 3.1 分页查询 DTO (Search/Page DTO)

*   **必须继承** `PageRequest` (无排序) 或 `SortPageRequest` (支持排序)。
*   字段用于 `WHERE` 条件过滤。

**Template:**

```java
package com.coscoshipping.project1.model.dto;
import com.coscoshipping.framework.core.entity.PageRequest;
import com.coscoshipping.framework.core.entity.SortPageRequest;
import com.coscoshipping.framework.web.util.OptionalField;
import com.mybatisflex.annotation.Column;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class ExampleSearchDTO extends SortPageRequest {
  @Schema(description = "名称模糊查询")
  private String name;
}
```

### 3.2 创建 DTO (Create DTO)

*   这是一个普通的 POJO。
*   **必须**使用 Jakarta Validation 注解 (`@NotNull`, `@NotBlank` 等)。

**Template:**

```java
package com.coscoshipping.project1.model.dto;

import com.coscoshipping.framework.upms.model.po.Tenant;
import io.github.linpeilie.annotations.AutoMapper;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import com.coscoshipping.framework.web.jackson.annotation.IdMask;
import lombok.Data;

@AutoMapper(target = Example.class, reverseConvertGenerate = false)
@Data
public class ExampleCreateDTO {

    @IdMask
    @NotNull(message = "ID不能为空")
    @Schema(description = "测试ID")
    private Long id;
    
    @NotBlank(message = "名称不能为空")
    @Schema(description = "名称")
    private String name;

    @Schema(description = "过期时间")
    private OffsetDateTime expireTime;

}
```

### 3.3 更新 DTO (Update DTO)

*   **必须继承** `BaseUpdateDTO<Long>` (包含 `id` 和 `version` 字段)。
*   **重要特性**：为了支持 Patch 更新（部分更新），所有业务字段建议使用 `OptionalField<T>` 包装，或者配合 MapStruct 的 `NullValuePropertyMappingStrategy`。
*   框架配置中使用了 `OptionalFieldMapper`，请参照以下模版：

**Template:**

```java
package com.coscoshipping.project1.model.dto;

import com.coscoshipping.framework.web.model.dto.BaseUpdateDTO;
import com.coscoshipping.framework.web.util.OptionalField;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Data
@EqualsAndHashCode(callSuper = true)
public class ExampleUpdateDTO extends BaseUpdateDTO<Long> {

  @Schema(description = "名称")
  @NotBlank(message = "不能为空")
  private OptionalField<String> name; // 使用 OptionalField 包装

  @Schema(description = "状态")
  @NotNull(message = "状态不能为空")
  private OptionalField<Integer> status;
}
```

---

## 4. 服务层规范 (Service Layer)

### 4.1 继承规范

*   Service **必须继承** `BaseService<Entity>`。
*   通常**不需要**创建 Service 接口（IService），直接创建类即可（参考 `Test1Service`）。

### 4.2 提供的公共方法 (Inherited Capabilities)

继承 `BaseService` 后，自动拥有以下能力（无需手写）：

- `save(entity)`, `saveBatch(entities)`
- `removeById(id)`, `removeByIds(ids)`
- `updateById(entity)`
- `getById(id)`
- `list()`, `page(page, queryWrapper)`
- `queryChain()`: **推荐**使用的链式查询入口。

### 4.3 查询写法 (Query Implementation)

**严禁**使用 XML 写简单查询。**必须**使用 `QueryChain` 或 `QueryWrapper`。

**Template:**

```java
package com.coscoshipping.project1.service;

import com.coscoshipping.framework.mybatisflex.service.BaseService;
import com.coscoshipping.framework.mybatisflex.util.PageUtils;
import com.coscoshipping.project1.exception.DemoExceptions;
import com.coscoshipping.project1.model.dto.ExampleCreateDTO;
import com.coscoshipping.project1.model.dto.ExampleSearchDTO;
import com.coscoshipping.project1.model.po.Example;
import com.coscoshipping.project1.model.vo.ExampleVO;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryChain;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class ExampleService extends BaseService<Example> {

  // 示例：复杂分页查询
  @Transactional(readOnly = true)
  public Page<Example> search(ExampleSearchDTO dto) {
    return queryChain()
            .like(Example::getName, dto.getName()) // 自动处理 null
            .eq(Example::getStatus, dto.getStatus())
            .page(PageUtils.toPage(dto)); // 使用框架工具转换分页参数
  }
  
  // 实例：其它逻辑
  @Transactional(rollbackFor = Exception.class)
  public ExampleVO test5(Example po) {
      QueryChain<Example> chain = QueryChain.of(Example.class);
      logger.info("tests biz5 {} {} ", po,chain);
      if (dto == null)
          throw DemoExceptions.TEST1_NOT_EXIST.toException();
      save(po);
      return new ExampleVO();
  }
}
```

---

## 5. 控制层规范 (Controller Layer)

Controller 有两种模式，根据需求选择。

### 5.1 模式一：全功能 CRUD (推荐)

继承 `CustomCrudController<Entity, Service, CreateDto, UpdateDto, SearchDto>`。
**一旦继承，自动暴露以下 9 个 API，无需手写：**

1.  `DELETE /{id}`: 单个删除
2.  `DELETE /batch`: 批量删除
3.  `GET /{id}`: 详情查询
4.  `GET /{id}/relations`: 级联详情查询
5.  `POST /list`: 列表查询 (无分页)
6.  `POST /list/page`: 分页查询 (带排序)
7.  `POST /`: 创建
8.  `PUT /`: 全量更新
9.  `PATCH /`: 部分更新

**重写钩子 (Hooks):**
如果默认逻辑不满足（例如需要在查询前校验权限，或在保存后发消息），请重写以下方法：

- `handleSaveRecord(dto)`
- `handleUpdateRecord(dto)`
- `handlePageRecordListCondition(dto)` (自定义查询条件的构建)

**Template:**

```java
package com.coscoshipping.project1.controller;

import com.coscoshipping.framework.core.controller.HttpResultController;
import com.coscoshipping.framework.core.result.HttpResult;
import com.coscoshipping.framework.web.jackson.annotation.IdMask;
import com.coscoshipping.project1.model.dto.ExampleSearchDTO;
import com.coscoshipping.project1.service.ExampleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import com.coscoshipping.framework.core.result.PageResult;
import com.coscoshipping.framework.mybatisflex.controller.CustomCrudController;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/examples")
@Tag(name = "示例管理")
public class ExampleController extends CustomCrudController<Example, ExampleService, ExampleCreateDTO, ExampleUpdateDTO, ExampleSearchDTO> {

  public ExampleController(ExampleService service) {
    super(service);
  }

  // 可选：重写查询条件构建逻辑
  @Override
  public QueryWrapper handlePageRecordListCondition(PageQueryParam<ExampleSearchDTO> param) {
    ExampleSearchDTO dto = param.getData();
    return QueryWrapper.create()
            .select(Example.class)
            .like(Example::getName, dto.getName());
  }

  @Operation(summary = "自定义custom接口1")
  @PostMapping("/{test1Id}/custom1")
  public HttpResult<String> custom1(
          @Parameter(description = "Test1的ID", required = true) @PathVariable("test1Id") @IdMask Long test1Id,
          @RequestBody Test1SearchDto dto) {
      test1Service.test1(test1Id, dto);
      return ok();
  }

  /**
   * 测试业务2
   * @param list 参数列表
  */
  @Operation(summary = "自定义custom接口2")
  @PostMapping("/custom2")
  public HttpResult<?> custom2(@RequestBody @Valid List<Test1CreateDto> list) {
      test1Service.test2(list);
      return ok();
  }

  /**
   * 测试业务3
   * @param dto 参数
   */
  @Operation(summary = "自定义custom接口3")
  @PostMapping("/custom3")
  public HttpResult<PageResult<Test1>> custom3(@Valid @RequestBody Test1SearchDto dto) {
      return page(test1Service.test3(dto));
  }

  /**
   * 测试业务4
   * @param dto 参数
   */
  @Operation(summary = "自定义custom接口4")
  @PostMapping("/custom4")
  public HttpResult<?> custom4(@Valid @RequestBody Test1SearchDto dto) {
      if ( dto.getName() == null)
          return fail("名称不能为空");
      return ok(test1Service.test4(dto));
  }
}
```

### 5.2 模式二：自定义 Controller

实现 `HttpResultController` 接口。
适用于不符合标准 CRUD 模型的业务接口。

**Response 规范:**
所有接口必须返回 `HttpResult<T>`。

- 成功: `return ok(data);`
- 失败: `return fail("message");`
- 分页: `return page(pageResult);`

**参数注解:**

- ID参数必须加 `@IdMask` 进行脱敏处理（如果框架启用了脱敏）：
  `public HttpResult<String> doSomething(@PathVariable @IdMask Long id)`

---

## 6. 异常处理 (Exception Handling)

### 6.1 异常定义 (Definition)

业务异常必须定义为 `enum` 枚举类型，并实现 `ExceptionDescription` 接口。

**Template:**

```java
package com.coscoshipping.project1.exception;

import com.coscoshipping.framework.core.exception.ExceptionDescription;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 自定义业务异常枚举
 */
@Getter
@AllArgsConstructor
public enum BusinessExceptions implements ExceptionDescription {

  RECORD_NOT_FOUND(100101, "记录不存在"),
  INVALID_STATUS(100102, "状态不正确"),
  ;

  private final int code;
  private final String message;
}
```

### 6.2 异常抛出 (Throwing)

不要直接 `new RuntimeException`，也不要直接 `throw Enum`。
必须调用枚举的 `.toException()` 方法来获取异常实例。

**Usage:**

```java
if (record == null) {
    // 正确写法
    throw BusinessExceptions.RECORD_NOT_FOUND.toException();
}
```

---

## 7. 数据展示对象规范 (VO Layer)

### 7.1 创建 VO (Create VO)

*   这是一个普通的 POJO。

**Template:**

```java
package com.coscoshipping.project1.model.dto.vo;

import com.coscoshipping.framework.web.jackson.annotation.IdMask;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serializable;
import lombok.Data;

@Data
public class ExampleVO implements Serializable {
    @IdMask
    @Schema(description = "id")
    private Long id;

    @Schema(description = "自定义项编码", example = "DEPT001")
    private String code;

    @Schema(description = "自定义项名称", example = "技术部")
    private String name;
}
```

## 8. 开发关键检查清单 (Checklist)

1.  [ ] 实体类是否继承了正确的 BaseEntity (Tenant/Organization)?
2.  [ ] Controller 是否优先考虑继承 `CustomCrudController`?
3.  [ ] UpdateDTO 中的字段是否使用了 `OptionalField`?
4.  [ ] Service 查询是否使用了 `QueryChain` 链式调用?
5.  [ ] 所有返回结果是否被 `HttpResult` 包装?
6.  [ ] ID 入参是否添加了 `@IdMask`?
7.  [ ] 抛出异常时是否使用了 `Enum.toException()`?