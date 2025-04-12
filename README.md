# LeetCode 题目跟踪工具 (LeetCode Tracker)

一个帮助管理和跟踪 LeetCode 刷题进度的 Next.js 应用程序。

## 功能特点

- 题目管理：添加、编辑和删除 LeetCode 题目
- 进度跟踪：记录题目完成状态、尝试次数和完成时间
- 笔记功能：为每道题目添加解题笔记和思路
- 随机选题：随机选择一道题目进行练习
- 标签分类：根据题目标签分类查看

## 部署指南

### 环境要求

- Node.js 18+ 
- MongoDB 数据库

### 本地开发

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/leetcode-tracker.git
   cd leetcode-tracker
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   创建 `.env.local` 文件并添加 MongoDB URI：
   ```
   MONGODB_URI=mongodb://localhost:27017/leetcode-tracker
   ```

4. 启动开发服务器
   ```bash
   npm run dev
   ```
   应用程序将在 http://localhost:3000 上运行

### 生产部署

1. 构建应用程序
   ```bash
   npm run build
   ```

2. 启动生产服务器
   ```bash
   npm run start
   ```

## API 文档

### 题目（Problems）API

#### 获取所有题目
- 请求：`GET /api/problems`
- 响应：所有题目的列表，按题号排序
- 示例：
  ```javascript
  fetch('/api/problems')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### 添加新题目
- 请求：`POST /api/problems`
- 请求体：
  ```json
  {
    "id": 1,
    "title": "两数之和",
    "difficulty": "简单",
    "tags": ["数组", "哈希表"],
    "link": "https://leetcode.cn/problems/two-sum/"
  }
  ```
- 响应：新创建的题目信息
- 示例：
  ```javascript
  fetch('/api/problems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      title: "两数之和",
      difficulty: "简单", 
      tags: ["数组", "哈希表"],
      link: "https://leetcode.cn/problems/two-sum/"
    })
  }).then(res => res.json())
  ```

#### 获取单个题目
- 请求：`GET /api/problems/{id}`
- 响应：指定 ID 的题目信息
- 示例：
  ```javascript
  fetch('/api/problems/1')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### 更新题目
- 请求：`PATCH /api/problems/{id}`
- 请求体：
  ```json
  {
    "status": "已通过",
    "duration": 600,
    "favorite": true,
    "note": "解题思路：使用哈希表存储已遍历元素..."
  }
  ```
- 响应：更新后的题目信息
- 示例：
  ```javascript
  fetch('/api/problems/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: "已通过",
      duration: 600,
      favorite: true
    })
  }).then(res => res.json())
  ```

#### 删除题目
- 请求：`DELETE /api/problems/{id}`
- 响应：删除成功消息
- 示例：
  ```javascript
  fetch('/api/problems/1', { method: 'DELETE' })
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### 随机获取题目
- 请求：`GET /api/problems/random`
- 响应：随机选择的一道题目
- 示例：
  ```javascript
  fetch('/api/problems/random')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

### LeetCode API

#### 通过题号获取题目信息
- 请求：`GET /api/leetcode?id={id}`
- 响应：
  ```json
  {
    "id": 1,
    "title": "两数之和",
    "slug": "two-sum",
    "difficulty": "简单",
    "link": "https://leetcode.cn/problems/two-sum",
    "tags": ["数组", "哈希表"]
  }
  ```
- 示例：
  ```javascript
  fetch('/api/leetcode?id=1')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

### 笔记（Notes）API

#### 获取所有笔记
- 请求：`GET /api/notes`
- 响应：所有笔记的列表，按创建时间降序排序
- 示例：
  ```javascript
  fetch('/api/notes')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### 创建新笔记
- 请求：`POST /api/notes`
- 请求体：
  ```json
  {
    "title": "哈希表技巧总结",
    "content": "在解决查找问题时，哈希表是一个强大的工具..."
  }
  ```
- 响应：新创建的笔记信息
- 示例：
  ```javascript
  fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "哈希表技巧总结",
      content: "在解决查找问题时，哈希表是一个强大的工具..."
    })
  }).then(res => res.json())
  ```

#### 获取单个笔记
- 请求：`GET /api/notes/{id}`
- 响应：指定 ID 的笔记信息
- 示例：
  ```javascript
  fetch('/api/notes/645fa3c1e2b6a89b12345678')
    .then(res => res.json())
    .then(data => console.log(data))
  ```

#### 更新笔记
- 请求：`PATCH /api/notes/{id}`
- 请求体：
  ```json
  {
    "title": "哈希表和双指针技巧总结",
    "content": "更新后的笔记内容..."
  }
  ```
- 响应：更新后的笔记信息
- 示例：
  ```javascript
  fetch('/api/notes/645fa3c1e2b6a89b12345678', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: "哈希表和双指针技巧总结",
      content: "更新后的笔记内容..."
    })
  }).then(res => res.json())
  ```

#### 删除笔记
- 请求：`DELETE /api/notes/{id}`
- 响应：删除成功消息
- 示例：
  ```javascript
  fetch('/api/notes/645fa3c1e2b6a89b12345678', { 
    method: 'DELETE' 
  }).then(res => res.json())
  ```

## 数据模型

### Problem 模型
```javascript
{
  id: Number,         // LeetCode 题目 ID
  title: String,      // 题目标题
  tags: [String],     // 题目标签数组
  difficulty: String, // 难度：'简单'、'中等'、'困难'
  status: {
    last: String,     // 最近状态：'未做'、'部分通过'、'已通过'
    stats: {
      tried: Number,  // 尝试次数
      passed: Number, // 通过次数
      partial: Number // 部分通过次数
    }
  },
  favorite: Boolean,  // 是否收藏
  link: String,       // 题目链接
  note: String,       // 题目笔记
  history: [{
    date: Date,       // 做题日期
    status: String,   // 状态
    duration: Number  // 用时（秒）
  }]
}
```

### Note 模型
```javascript
{
  title: String,      // 笔记标题
  content: String,    // 笔记内容
  createdAt: Date     // 创建时间
}
```

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT
