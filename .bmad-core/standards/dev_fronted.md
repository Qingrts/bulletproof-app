# 前端框架开发规范 (dev_frontend.md)

**版本说明**：本版已移除 Store 层相关要求（原 CwfStore 继承、store 目录与路径别名、Store 层规范章节及检查项），章节编号已顺延。

## 1. 核心架构概览 (Core Architecture)

本项目基于 **Angular 19 + ng-zorro-antd 19 + @delon/theme 19 + cwf-ng-library 19** 开发，必须严格遵守以下分层架构与公司私有库约束。

框架约束（强制）：
1. 业务 CRUD 页面**必须**继承 `CwfBaseCrud`（主从表）或 `CwfModalCrud`（弹窗），禁止自行实现一套 CRUD 逻辑
2. 与后端交互**必须**使用项目封装的 `CwfRestfulService`（get/post/put/delete），统一处理微服务路径与错误提示
3. **UI 风格一致性**：编写或修改前端界面时**必须**先查看当前项目中已有的查询区、编辑区、列表、弹窗等页面的 UI 风格（布局、按钮位置、表格样式、表单排版、间距与尺寸等），再按同一风格生成代码，禁止引入与现有页面不一致的 UI 效果
4. **国际化（强制）**：前端代码中，**提示信息**（如 toast、message、确认框文案）、**功能按钮**（如「新增」「修改」「删除」「查询」「保存」）、**占位符**（placeholder）、**表头与列名**、**弹窗标题与按钮**、**表单标签**、**错误提示**、**列表空状态**等所有面向用户的文案**必须**采用国际化（i18n），禁止在模板或 TypeScript 中写死中文、英文或其他语种。须在语言文件（如 `zh-CN.json`）中维护 key，并通过 `translate` 管道或 `geti18nString`/`getMsgi18nString`/`fanyi` 等接口使用
5. **必须** 生成的*.module.ts 中只导入 SharedModule, LayoutModule 和 对应的 RoutingModule
   ````typescript
   import {SharedModule} from '@core/share.module'
   ````
6. **必须** 使用angular19语法以及 ng-zorro-antd19样式库中属性

### 1.1 业务目录结构规范

业务代码根路径为 `src/app`，按功能模块与职责划分目录。

- **Root**: `src/app`
  - `core`：核心基类、共享模块、工具、国际化
  - `interface`：全局 TypeScript 接口与枚举（请求/响应、分页、守卫等）
  - `layout`：布局组件、默认侧栏/头部、登录页、公共 UI 组件、指令
  - `service`：全局可注入服务（HTTP、登录、通知、缓存、路由守卫等）
  - `pipe`：全局及按业务分类的管道（如 bpmn、cusrtomconfig、devops）
  - `business`：业务功能模块（passport、startpage、system、exception 等）
  - `business-modal`：业务弹窗模块（与主业务解耦的弹窗组件）

路径别名（tsconfig.json）：
- `@core/*` → `app/core/*`
- `@layout/*` → `app/layout/*`
- `@service/*` → `app/service/*`
- `@business/*` → `app/business/*`
- `@cwfmodal/*` → `app/business-modal/*`
- `@env/*` → `environments/*`
- `@interface/*` → `app/interface/*`
---

`## 2. 接口层规范 (Interface Layer)
`
所有与后端约定、前端复用的数据结构**必须**在 `src/app/interface` 下统一定义，便于类型安全与联调。

### 2.1 统一响应结构 (Response)

后端返回格式与前端解析**必须**与 `responseInterface` 一致。

| 字段   | 类型    | 说明     |
|--------|---------|----------|
| code   | number  | 业务码   |
| msg    | string  | 提示信息 |
| data   | any     | 业务数据 |
| ok     | boolean | 是否成功 |
| reqId  | string  | 请求标识 |

**Template:**

```typescript
// src/app/interface/request.interface.ts
export interface responseInterface {
  code: number;
  msg: string;
  data: any;
  ok: boolean;
  reqId: string;
}
```

### 2.2 分页查询参数 (PagesModel)

列表/分页请求**必须**使用 `PagesModel` 及配套的 `Operator`、`SortEnum`、`RangeValueObject`，与后端分页接口约定一致。

- `data`：查询条件键值
- `operators`：字段对应的操作符（EQUALS、LIKE、BETWEEN 等）
- `page`、`size`：当前页、每页条数
- `sortBy`：排序字段及 ASC/DESC
- `rangeBy`：范围查询（start、end、includeStart、includeEnd）

**使用约定：** 调用 `CwfRestfulService.post(api, pagesModel)` 时，请求体即为此结构。

### 2.3 上传参数 (UploadParams)

文件上传相关接口使用 `UploadParams`（fileName、filePath、uploadId、chunkSize、module、businessTypeCode、businessTypeName、pkId、echo、expireTime、serviceName 等）。

### 2.4 路由守卫与编辑守卫

- 路由守卫：在 `service` 中实现（如 `AppRouterActivate`、`LoginRouterActivate`），在路由配置中通过 `canActivate` 使用
- 编辑页未保存离开：实现 `EditGuard` 接口的 `canDeactivate(): Observable<boolean> | Promise<boolean> | boolean`


### 2.5 路由配置

- 模块路由配置：业务模块必须生成路由文件，生成在业务模块文件夹中，如果没有指定路由配置到某个文件，默认模块路由配置business-routing.module文件中配置
- 业务路由配置：业务路由生成在模块路由中


**Template:**
```typescript 业务模块路由配置
children: [
  { path: 'system', loadChildren: () => import('./system/system.module').then(m => m.systemModule) },//系统模块
]
```

```typescript 业务路由配置
const routes: Routes = [
  {path: 'company', loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)},
];
```
---



## 3. 服务层规范 (Service Layer)

### 3.1 HTTP 请求 (CwfRestfulService)

**禁止**在业务组件中直接注入 `HttpClient` 发起接口请求。**必须**使用 `CwfRestfulService`，由该服务统一处理：

- 微服务路径前缀（依赖 `GlobalDataService.isMicroService`、`serviceName`）
- 错误码与用户提示（500/503/404/403/401/400 等，通过 `CwfNotifytService` 展示）
- 403 时跳转登录（`router.navigateByUrl('/passport')`）

**方法约定：**

- `get(api: string, serviceName?: string, requestObj?: object): Promise<any>`
- `post(api: string, requestObj: object, serviceName?: string): Promise<any>`
- `put(api: string, requestObj: object, serviceName?: string): Promise<any>`
- `delete(api: string, serviceName?: string, param?: any): Promise<any>`

**Template:**

```typescript
constructor(
  private cwfRestful: CwfRestfulService,
  private cwfNotify: CwfNotifytService,
) {}

async loadList() {
  const res = await this.cwfRestful.post('/xxx/list/page', this.pagesModel);
  if (res?.ok && res?.data) {
    this.list = res.data.content;
  }
}
```

### 3.2 其他全局服务

- **CwfPlatformService**：平台级工具（如树结构 `renameKeysInTree`、`insertPropertyBasedOnCondition`）
- **CacheDataService**：缓存数据（如功能权限 func 等），与 `CACHE_DATA` 注入一致
- **CwfNotifytService**：消息/通知，实现框架 `Notify` 接口
- **GlobalDataService**：全局配置（微服务名、环境等），对应 `GLOBAL_DATA`

业务模块内可再建 `*.service.ts`，仅限本模块或子路由使用，命名与职责清晰。

---

## 4. 业务 CRUD 与基类规范 (CRUD & Base Class)

### 4.1 主从表/主列表页 (CwfBaseCrud)

主界面 CRUD（列表 + 查询条件 + 主从表编辑）**必须**继承 `CwfBaseCrud`（来自 `@core/CwfBaseCrud`），该类继承自 cwf-ng-library 的 `CwfBaseCrud`。
- **初始化流程**：`initLoad()` → 初始化查询条件与编辑表单、构造主界面路径、订阅路由参数（`openParam`、`currentPageMode`）→ `onLoad()`、`beforeLoad()`、`initAfterView()` 中根据 `PageModeEnum.Main | Add | Modify` 分支（列表展示、新增、修改/查子表）
- **禁止**在业务组件中重写一整套列表/编辑生命周期，仅允许重写规定的钩子（如 `initCondtion()`、`initEdit()`、`beforeLoad()`、`onLoad()` 等）
- 主子表时，修改态通过 `queryByid(request)` 拉取子表，请求结构使用 `CwfRequest`（ACTIONID、OPERATION、CONDITION、ISVALIDFORM、STORES、ORDERBY 等）

### 4.2 弹窗 CRUD (CwfModalCrud)

弹窗内 CRUD **必须**继承 `CwfModalCrud`（来自 `@core/cwfmodalcrud`）。

- 通过 `@Input() config: object` 接收外部传入的配置（含 `state`、`mainpath`、`parentcontroller` 等）
- 在 `initLoad()` 中从 `NzModalRef.getConfig().nzData.config` 读取配置并初始化查询条件与编辑表单
- 关闭与结果通过 `NzModalRef` 与框架约定的方式返回（如 `DialogResultEnum`）
- **必须**使用`CwfModalCrud`时,html中不生成nz-modal标签

### 4.3 非 CRUD 业务页

非标准 CRUD 的页面（如仪表盘、配置页、自定义列表）不强制继承上述基类，但：

- 仍**必须**使用 `CwfRestfulService` 请求接口
- 列表/分页参数建议使用 `PagesModel` 与 `responseInterface` 解析
- 需要权限控制时使用现有守卫与 `auth` 管道

---

## 5. 组件与模板规范 (Component & Template)

### 5.1 组件元数据

- **selector**：使用 `app` 前缀 + **kebab-case**（如 `app-extra-table`），与 tslint `component-selector` 一致
- **standalone**：当前项目统一为 **false**，组件归属 NgModule
- **styleUrls**：使用 **Less**（`styleUrls: ['./xxx.component.less']`），与 angular.json 中 `style: "less"` 一致
- **encapsulation**：无特殊需求使用默认 `ViewEncapsulation.Emulated`；需穿透子组件样式时使用 `::ng-deep`（见下文）

### 5.2 模板 (HTML)

- 使用 **ng-zorro-antd** 组件：`nz-table`、`nz-button`、`nz-input`、`nz-select`、`nz-modal`、`nz-popconfirm` 等
- 列表操作列建议使用 `nzRight`、`nzWidth` 控制宽度与右对齐
- 表格：`[nzData]`、`[nzLoading]`、`[nzScroll]`、`nzShowPagination` 等与框架绑定
- 表单：优先使用 `ReactiveFormsModule`（FormGroup/FormControl），与基类 `conditionForm`、`editForm`、`editForms` 一致；简单场景可用 `ngModel`

### 5.3 样式 (Less)

- 组件样式限定在 `.less` 文件中，避免全局污染
- 需要覆盖子组件或第三方样式时使用 `:host ::ng-deep .selector { ... }`，尽量收窄选择器范围
- 与布局相关的宽度等可使用 `!important` 仅在被覆盖的第三方样式上，并加注释说明

**Template:**

```less
// extraTable.component.less
:host ::ng-deep .ant-table.ant-table-small .ant-table-expanded-row-fixed {
  width: 100% !important;
}
```

### 5.4 公共组件与指令

- 封装在 `layout/components` 或 `core` 下的通用组件（如 `cwf-select-new`）需实现 `ControlValueAccessor` 时使用 `NG_VALUE_ACCESSOR`、`forwardRef`
- 指令放在 `layout/directives`（如 `DebounceClickDirective`、`FuncDirective`），命名清晰

### 5.5 UI 风格一致性（强制）

不同项目的前端 UI 风格可能不同（查询区、编辑区、列表、弹窗等），新增或修改页面时**必须**与当前项目已有页面保持一致。

- **编写前**：先查看本项目内同类页面的实现（如 `business/` 下已有列表页、编辑页、弹窗组件），关注：
  - 查询区：表单项是单行多列还是多行、按钮区在左/右、是否使用 `nz-row`/`nz-col`、栅格 span、间距
  - 编辑区：表单项布局、标签宽度、是否使用 `nz-form-item`、弹窗宽度与 footer 按钮顺序
  - 列表：表格 `nzSize`（small/default）、操作列宽度与右对齐、按钮是链接还是 `nz-button`、分页位置
  - 弹窗：`nzModal` 宽度、标题与关闭方式、确定/取消顺序与样式
- **编写时**：复用相同的布局结构、class 命名习惯、组件用法（如 `nz-button` 的 `nzType`、`nz-table` 的 `nzScroll`），避免自行发明一套排版或样式
- **自检**：新页面与同模块/同类型的已有页面并排对比，视觉与交互风格应一致；若项目有统一 Less 变量或主题文件，优先使用

### 5.6 按钮功能权限 (Button Function Permission)

与后端功能点对应的按钮、链接**必须**按功能权限控制显隐，禁止所有用户看到无权限操作。

#### 5.6.1 权限管道 `auth`（推荐）

- **管道**：`AuthPipe`（`name: 'auth'`），在 `SharedModule` 中声明，模板中通过 `'功能码' | auth` 使用。
- **逻辑**：若当前用户 `getUserInfo().superAdmin === true`，直接返回 `true`（展示所有按钮）；否则在 `CacheDataService.func` 中查找 `'b:' + 功能码`，存在则返回 `true`，否则不展示。
- **功能点来源**：登录或路由守卫通过 `CwfLoaderService.loadSysFunc()` 请求 `GET /user/buttons`，接口返回的数组写入 `CacheDataService.func`（元素形如 `'b:role:modify'`、`'b:users:add'`）。微服务架构下 `global.isMicroService === true` 时才会拉取。

#### 5.6.2 功能码约定

- **格式**：`模块:操作` 或 `模块:子模块:操作`，如 `role:modify`、`users:add`、`tenant:delete`、`system:resource:link`。与后端功能点编码一致。
- **模板传入**：直接写 `'模块:操作'`，管道内部拼接 `b:` 后与 `func` 对比，即后端存的是 `b:模块:操作`。

#### 5.6.3 模板使用方式

- **按钮 / 链接**：在操作元素上加 `*ngIf="'功能码' | auth"`，无权限时不渲染。
- **分割线**：若操作列有 `nz-divider`，分割线也加相同的 `*ngIf="'功能码' | auth"`，避免无权限时留下多余竖线。
- **整块操作列**：若多个操作共享同一权限，可在外层容器使用 `*ngIf="'功能码' | auth"`；否则按按钮分别控制。

**Template:**

```html
<button nz-button nzType="primary" (click)="onAdd()" *ngIf="'users:add' | auth">新增</button>
<a (click)="modifyUser(info)" *ngIf="'users:modify' | auth">修改</a>
<nz-divider nzType="vertical" *ngIf="'users:modify' | auth"></nz-divider>
<a nz-popconfirm nzPopconfirmTitle="是否删除？" (nzOnConfirm)="deleteUser(info)" *ngIf="'users:delete' | auth">删除</a>
```

#### 5.6.4 可选：埋点指令 `cwfSourceClick`

- 需要记录按钮级操作日志（如审计）时，可在按钮上增加 `cwfSourceClick`，并设置 `code="b:功能码"`（与 `func` 中格式一致），点击时上报。显隐仍由 `*ngIf="'功能码' | auth"` 控制。

**Template:**

```html
<a cwfSourceClick code="b:users:resetPassword" (cwfClick)="resetPassword(info)" *ngIf="'users:resetPassword' | auth">重置密码</a>
```

#### 5.6.5 开发约定

- 新增或修改**受权限控制的**按钮、链接时，**必须**加上 `*ngIf="'功能码' | auth"`，且功能码与后端 `/user/buttons` 及权限配置一致。
- **superAdmin** 用户看到全部按钮，无需在业务逻辑中再判断；非 superAdmin 用户仅能看到 `func` 中包含的 `b:功能码` 对应按钮。
- 若项目使用 `FuncDirective`（`[func]`）且依赖 `funcRows`（如 `FUNCID_MARK`），与 `auth` 管道并存时，以项目现有用法为准；**推荐统一采用 `auth` 管道**，便于与 `/user/buttons` 对接。

---

## 6. 管道规范 (Pipe)

### 6.1 定义与注册

- **必须**在对应 NgModule 的 `declarations` 中声明；**禁止**未声明即使用
- `standalone: false`，与项目一致
- 命名：业务含义 + `Pipe` 后缀，如 `YnPipe`、`AuthPipe`；`name` 使用小写短名（如 `cwfyn`、`auth`）

### 6.2 按业务分包

- 通用管道放在 `pipe` 根目录（如 `yn.pipe.ts`、`authPipe.pipe.ts`、`isenable.pipe.ts`）
- 业务相关管道按域分子目录：`pipe/bpmn`、`pipe/cusrtomconfig`、`pipe/devops` 等
- 管道内依赖注入（如 `CwfBusContextService`、`CacheDataService`）仅用于权限、缓存等，避免在管道中发起 HTTP

**Template:**

```typescript
@Pipe({ name: 'cwfyn', standalone: false })
export class YnPipe implements PipeTransform {
  transform(data: string) {
    if (data === '' || data == null) return '否';
    if (data === 'Y') return '是';
    if (data === 'N') return '否';
  }
}
```

---

## 7. 路由与守卫规范 (Routing & Guard)

### 7.1 路由结构

- 入口与布局：`''` 重定向到 `passport`；`passport` 使用 `LayoutPassportComponent`；`main` 使用 `LayoutDefaultComponent` 并挂载业务子路由
- 登录相关：`passport` 下 `login`、`register`、`register-result`，使用 `LoginRouterActivate`
- 需登录后的页：放在 `main` 下，使用 `AppRouterActivate`
- 异常页：403、404、500 等放在 `business/exception`，路由 path 与组件对应

### 7.2 守卫使用

- **canActivate**：控制是否可进入路由（如未登录跳转登录、无权限跳转 403）
- 守卫实现放在 `@service/*`，如 `approuterActivate.service.ts`、`loginrouterActivate.service.ts`
- 需要“未保存离开”提示时，在对应路由上使用 `canDeactivate`，组件实现 `EditGuard`

### 7.3 路由复用

- 使用框架提供的 `CwfReuseStrategy`（在 `AppModule` 的 `RouteReuseStrategy` 中注入），避免重复创建相同路由组件

---

## 8. 模块与依赖规范 (Module & Imports)

### 8.1 根模块 (AppModule)

- 统一注册：`CoreModule`、`LayoutModule`、`BusinessModule`、`SharedModule`、`FormsModule`、`ReactiveFormsModule`、`RouterModule`、`TranslateModule`、`BrowserAnimationsModule`
- 全局服务/策略：`GLOBAL_DATA` → `GlobalDataService`，`Notify` → `CwfNotifytService`，`CACHE_DATA` → `CacheDataService`，`HTTP_INTERCEPTORS` → `HttpRequestInterceptor`，`RouteReuseStrategy` → `CwfReuseStrategy`，`DEFAULT_TIMEOUT` 等
- 使用 `provideHttpClient(withInterceptorsFromDi())` 与现有 HTTP 拦截器配合

### 8.2 业务模块 (BusinessModule)

- 业务路由在 `business-routing.module.ts` 中定义，通过 `RouterModule.forChild(routes)` 导入
- 业务组件、管道、指令仅在 `BusinessModule` 或对应子模块中 `declarations`，避免在根模块重复声明
- 使用 `@business/*` 路径引用业务内组件与服务

### 8.3 共享与第三方

- 通用 UI 与 Delon/Zorro 封装在 `CoreModule`、`SharedModule` 中导出，业务模块按需导入
- 禁止在业务组件中直接引用 `node_modules` 下除已封装外的第三方库路径，统一通过 `@core`、`@layout` 或公共模块

---

## 9. 国际化与环境 (I18n & Environment)

### 9.1 国际化 (I18n)

#### 9.1.0 强制要求（必须采用国际化）

**前端代码中，以下内容必须采用国际化，禁止在模板或 TypeScript 中写死中文、英文或其他语种文案：**

| 类型 | 说明 | 示例 |
|------|------|------|
| **提示信息** | 各类提示、消息、确认框文案 | toast、message、`nzPopconfirmTitle`、`showAlert`/`showConfirm` 的文案 |
| **功能按钮** | 按钮、链接上的操作文字 | 「新增」「修改」「删除」「查询」「保存」「重置」「确定」「取消」等 |
| **占位符** | 输入框、下拉框的 placeholder | `nzPlaceHolder`、`placeholder` |
| **表头与列名** | 表格表头、列标题 | `nz-table` 的 `<th>` 文案 |
| **弹窗** | 弹窗标题、确定/取消等按钮文字 | `nzTitle`、footer 按钮 |
| **表单标签** | 表单项标签 | `nz-form-label`、表单控件前的文字 |
| **错误提示** | 校验错误、接口错误展示给用户的文案 | 表单校验 message、接口错误提示 |
| **列表空状态** | 无数据时的提示文字 | 空表格、空列表提示 |

- 上述文案**必须**在语言文件（如 `src/assets/i18n/zh-CN.json`）中维护 key，在模板中使用 `{{ 'KEY' | translate }}`，在 TS 中使用 `geti18nString('KEY')`、`getMsgi18nString('KEY')` 或 `I18NService.fanyi('KEY')` 等，**不得**直接写 `"请输入姓名"`、`'新增'` 等硬编码字符串
- 新增或修改面向用户的文案时，**必须**同步维护对应语言文件（如 zh-CN.json，以及 zh-TW.json、en-US.json 若已支持该业务）

#### 9.1.1 技术栈与语言文件

- **库**：`@ngx-translate/core`，根模块通过 `TranslateModule.forRoot(...)` 配置，加载器为 `TranslateHttpLoader(http, 'assets/i18n/', '.json')`
- **语言文件目录**：`src/assets/i18n/`，文件名与语言代码一致：
  - `zh-CN.json`：简体中文（默认）
  - `zh-TW.json`：繁体中文
  - `en-US.json`：英文
- **Key 命名约定**：使用多级 key，便于按模块划分，例如：
  - `FP.ADD`、`FP.SAVE`、`FP.QUERY`：通用操作
  - `MSG.WEB0001`：占位/提示类
  - `CWF.nav.home`：布局/导航
  - 新增业务文案放在对应业务前缀下（如 `BPMN.xxx`），避免全部堆在根级

#### 9.1.2 I18NService（core/i18n/i18n.service.ts）

项目封装了 `I18NService`，统一管理**当前语言**、**切换语言**及 **Angular / ng-zorro / date-fns 的 locale**。

- **注入**：`constructor(private i18n: I18NService)`
- **常用方法**：
  - `use(lang: string)`：切换语言（会同步 Angular locale、ng-zorro、date-fns，并写入 `localStorage.currentLang`）
  - `fanyi(key: string, interpolateParams?: Object)`：即时翻译，等价于 `TranslateService.instant`
  - `getLangs()`：可选语言列表（如 `[{ code: 'zh-CN', text: '简体中文', abbr: '🇨🇳' }, ...]`）
  - `currentLang`、`defaultLang`：当前语言与默认语言
- **语言切换入口**：布局头部的 `header-i18n` 组件调用 `this.i18n.use(language)`；应用启动时从 `localStorage.currentLang` 恢复（见 `app.component.ts`）

- 生成在第一个节点下
````json
{
  "FP": {
    "ADD": "新建",
    "ADDJ": "新建",
    "COUNT": "测算",
    "ENTRY": "预估录入",
    "ENTRYRATIFY": "预估确认",
    "SAVE_CONFIRM": "保存提交"
  }
}
````

#### 9.1.3 组件内获取文案

- **继承 CwfBaseCrud / 使用 CwfBusContext 的组件**：通过 `CwfBusContextService.getTranslateService()` 获取框架封装后的翻译服务：
  - `geti18nString(key: string)`：普通文案（如占位符、标题）
  - `getMsgi18nString(key: string)`：消息/ loading 等（如 `'WEB0010'`）
- **不依赖 CwfBusContext 的组件**：可注入 `TranslateService` 或 `I18NService`：
  - `TranslateService.instant(key, params)` 或 `I18NService.fanyi(key, params)`
- **模板内**：使用 `TranslateModule` 提供的 `translate` 管道，例如：`{{ 'FP.ADD' | translate }}`；带参数：`{{ 'KEY' | translate:{ name: value } }}`

#### 9.1.4 与 UI 库、日期的联动

- **ng-zorro-antd**：语言由 `I18NService.use()` 内部通过 `NzI18nService.setLocale(...)` 切换（zh_CN、zh_TW、en_US）
- **Angular 日期/管道**：通过 `registerLocaleData(locale)` 在切换语言时更新
- **date-fns**：当前 locale 挂在 `(window as any).__locale__`，供日期格式化等使用
- 新增语言时，需在 `I18NService` 的 `LANGS` 中增加对应 `ng`、`zorro`、`dateFns` 的 locale 配置，并增加 `src/assets/i18n/新语言码.json`

#### 9.1.5 开发约定

- **强制**：所有面向用户的文案（含提示信息、功能按钮、占位符、表头、弹窗标题与按钮、表单标签、错误提示、空状态等）**必须**使用 i18n key，**禁止**在模板或 TS 中写死中文、英文或任何语种
- 新增或修改上述任一文案时，**必须**同步在 `zh-CN.json` 中维护（及 `zh-TW.json`、`en-US.json` 若已支持该业务），并在代码中通过 translate 管道或 geti18nString/getMsgi18nString/fanyi 使用
- 公共组件（如 `cwf-select-new`）的默认 placeholder 等，使用 `getTranslateService().geti18nString('MSG.WEB0001')` 等形式，保证与当前语言一致

### 9.2 环境配置

- 环境文件：`src/environments/environment.ts`、`environment.prod.ts`
- 字段：`production`、`serverUrl`、`loginUrl`、`serverXmlUrl`、`analysisUrl`、`exportUrl` 等，通过 `@env/*` 引用
- 构建时通过 `fileReplacements` 替换为生产环境

---

## 10. 开发关键检查清单 (Checklist)

1. [ ] 业务 CRUD 页是否继承 `CwfBaseCrud` 或 `CwfModalCrud`？
2. [ ] 是否使用 `CwfRestfulService` 发起 HTTP，且未直接使用 `HttpClient`？
3. [ ] 列表/分页请求体是否使用 `PagesModel`，响应解析是否按 `responseInterface`？
4. [ ] 组件 selector 是否为 `app` + kebab-case，样式是否为 Less、standalone 为 false？
5. [ ] 管道是否在对应 NgModule 中声明，且按业务域放在正确目录？
6. [ ] 路由是否按需使用 `AppRouterActivate`、`LoginRouterActivate` 及 `canDeactivate`？
7. [ ] 新增接口/模型是否在 `interface` 中补充类型定义？
8. [ ] **国际化**：提示信息、功能按钮、占位符、表头、弹窗标题等是否均使用 i18n key（禁止写死中文/英文），并已同步到 zh-CN（及 zh-TW/en-US）？
9. [ ] 新页面/组件的 UI（查询、编辑、列表、弹窗）是否已对照本项目已有页面，风格一致？
10. [ ] 受权限控制的按钮、链接是否已加 `*ngIf="'功能码' | auth"`，功能码与后端 `/user/buttons` 一致？
