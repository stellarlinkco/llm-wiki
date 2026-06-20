---
type: Source Document
parser: html
source_kind: url
content_type: text/html
url: "https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8"
title: Claude Code的上下文工程应用
description: Claude Code的上下文工程应用
resource: "https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8"
tags: []
timestamp: "2026-06-20T06:45:38.258Z"
source_path: "https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8"
source_id: f723777eeadc4a58c67d9928f89b670da318bc96e1f325882c41a510844a4214
content_hash: 1e391513d23d91ad2c9586ac7b2b71a885a35235d400d95c138196094a940a7a
---

* * *

## [Claude Code的上下文工程应用](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8-1)

除了自定义命令，Claude Code还有一个重要特性就是上下文机制，通过`CLAUDE.md`文件来存储上下文信息。这个机制分为三个层级：全局、项目和模块，形成了一个完整的知识管理体系。

### [全局上下文：~/.claude/CLAUDE.md](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#%E5%85%A8%E5%B1%80%E4%B8%8A%E4%B8%8B%E6%96%87claudeclaudemd)

全局上下文存放所有项目通用的开发规范和标准。这里放的是你个人或团队的编码哲学，不管做什么项目都要遵守的铁律。

**典型内容：**

```
## 通用编码规范
### 代码质量标准- 单个文件代码不超过1000行- 单个函数不超过50行- 必须有完整的注释，包括函数说明、参数说明、返回值说明- 变量命名必须有意义，禁止使用a、b、c这种无意义命名- 复杂逻辑必须有注释解释
### 错误处理原则- 所有可能的错误都必须处理- 错误信息要明确，便于调试- 不允许空catch块- 关键路径必须有日志记录
### 性能要求- 数据库查询必须有索引支持- 循环内不允许执行数据库操作- 大数据量处理必须分批进行- 缓存策略要明确
### 安全规范- 所有用户输入必须验证- 密码必须加密存储- API接口必须有权限控制- 敏感信息不能记录到日志
```

这些规则会被所有项目继承，Claude Code在生成代码时会自动遵守这些约束。

### [项目上下文：./CLAUDE.md](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#%E9%A1%B9%E7%9B%AE%E4%B8%8A%E4%B8%8B%E6%96%87claudemd)

项目上下文存放当前项目的特定信息，包括技术栈、开发流程、部署方式等。如果项目根目录没有这个文件，需要用`/init`命令生成。

**以Go后端项目为例：**

```
## 项目基本信息- 语言：Go 1.21- 框架：Gin + GORM- 数据库：PostgreSQL 15- 缓存：Redis 7- 消息队列：RabbitMQ
## 开发环境配置# 安装依赖go mod tidy
# 运行测试go test ./...
# 代码检查make lint
# 本地启动make run
## 项目结构规范
cmd/          # 应用入口internal/     # 内部代码  handler/    # HTTP处理器  service/    # 业务逻辑  repository/ # 数据访问  model/      # 数据模型config/       # 配置文件docs/         # 文档

## 代码规范- 使用官方Go代码规范- 错误处理使用pkg/errors包- HTTP状态码使用标准定义- 数据库操作必须在事务中- 不要重复造轮子，优先使用成熟的第三方库
## 测试要求- 单元测试覆盖率不低于80%- 集成测试覆盖主要业务流程- 使用testify作为测试框架- Mock使用gomock生成
## 部署流程- 提交代码前必须通过make lint- 必须有对应的单元测试- Pull Request需要至少一人Review- 部署前必须在测试环境验证
```

### [模块上下文：各模块的CLAUDE.md](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#%E6%A8%A1%E5%9D%97%E4%B8%8A%E4%B8%8B%E6%96%87%E5%90%84%E6%A8%A1%E5%9D%97%E7%9A%84claudemd)

每个功能模块都有自己的上下文文件，记录该模块的具体实现细节、业务规则、接口定义等。这是最细粒度的上下文信息。

**以用户认证模块为例：**

```
## 用户认证模块
### 功能描述负责用户注册、登录、JWT令牌管理、密码重置等功能
### 核心组件- UserHandler: HTTP接口层- UserService: 业务逻辑层- UserRepository: 数据访问层- JWTUtil: JWT令牌工具
### 数据表结构CREATE TABLE users (    id SERIAL PRIMARY KEY,    username VARCHAR(50) UNIQUE NOT NULL,    email VARCHAR(100) UNIQUE NOT NULL,    password_hash VARCHAR(255) NOT NULL,    created_at TIMESTAMP DEFAULT NOW(),    updated_at TIMESTAMP DEFAULT NOW());
### API接口- POST /api/auth/register - 用户注册- POST /api/auth/login - 用户登录- POST /api/auth/logout - 用户退出- POST /api/auth/refresh - 刷新令牌- POST /api/auth/reset-password - 密码重置
### 业务规则- 用户名3-50字符，只能包含字母数字下划线- 密码最少8位，必须包含大小写字母和数字- JWT令牌有效期2小时，refresh token有效期7天- 连续登录失败5次锁定账户30分钟- 密码重置链接有效期15分钟
### 依赖模块- Email服务：发送验证邮件- Redis缓存：存储令牌黑名单- 日志服务：记录认证事件
### 测试要点- 正常登录注册流程- 各种异常情况处理- 令牌过期和刷新- 并发登录处理- 安全攻击防护
```

### [上下文机制的实际价值](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#%E4%B8%8A%E4%B8%8B%E6%96%87%E6%9C%BA%E5%88%B6%E7%9A%84%E5%AE%9E%E9%99%85%E4%BB%B7%E5%80%BC)

**1\. 上下文连续性**Claude Code在执行任何命令时，都会读取这三级上下文文件，确保生成的代码符合各层级的要求。比如生成用户认证代码时，会同时遵守全局的编码规范、项目的Go语言规范，以及模块的业务规则。

**2\. 知识积累**每次开发完成后，经验和规则都会沉淀到对应的上下文文件中。项目做得越久，上下文越完善，后续开发效率越高。

**3\. 团队协作**新成员只需要读取这些上下文文件，就能快速了解项目的方方面面。不需要口口相传，也不用担心知识丢失。

**4\. 质量保证**上下文机制确保每一行代码都符合既定规范，从根本上避免了代码风格不统一、质量参差不齐的问题。

### [/init命令的作用](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#init%E5%91%BD%E4%BB%A4%E7%9A%84%E4%BD%9C%E7%94%A8)

当进入一个新项目时，如果没有项目级的CLAUDE.md文件，需要使用`/init`命令来生成：

/init 初始化Go后端项目的开发环境配置

这个命令会：

*   分析项目结构和技术栈
*   生成符合项目特点的CLAUDE.md模板
*   设置合适的开发规范和流程
*   配置测试和部署要求

### [实际使用建议](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#%E5%AE%9E%E9%99%85%E4%BD%BF%E7%94%A8%E5%BB%BA%E8%AE%AE)

**1\. 渐进式完善**不要一开始就想把上下文写得很完美，随着项目发展逐步补充和优化。

**2\. 定期维护**技术栈升级、规范调整时，要及时更新对应的上下文文件。

**3\. 分工协作**全局上下文由团队负责人维护，项目上下文由项目经理维护，模块上下文由对应开发者维护。

**4\. 版本控制**所有上下文文件都应该纳入版本控制，确保团队同步。

## [总结](https://stellarlink.co/articles/claude-code%E7%9A%84%E4%B8%8A%E4%B8%8B%E6%96%87%E5%B7%A5%E7%A8%8B%E5%BA%94%E7%94%A8#%E6%80%BB%E7%BB%93)

Claude Code通过自定义命令实现了从需求到部署的完整开发流程自动化，而上下文机制则确保了整个流程的一致性和质量。

三级上下文体系解决了不同层面的问题：全局上下文保证基础质量标准，项目上下文适配具体技术栈，模块上下文记录业务细节。这样无论项目规模多大、团队多复杂，都能保持代码的一致性和可维护性。

核心价值不是替代开发者思考，而是把最佳实践固化到工具中，让好的开发习惯变成自动化的执行。对于需要长期维护的企业级项目来说，这种标准化流程的价值是巨大的。

说到底，工具再先进，核心还是人的思考。Claude Code只是让好的开发习惯更容易坚持，并且能够持续积累和传承，仅此而已。

> Claude code 上下文文档 [https://docs.anthropic.com/en/docs/claude-code/memory](https://docs.anthropic.com/en/docs/claude-code/memory)
