# LeetCode Tracker 安装脚本

该目录包含以下安装脚本，用于自动化项目依赖的安装过程。

## 可用脚本

### 1. `install.sh` - Bash 脚本版本

这是一个基于 Bash 的安装脚本，适用于 Linux 和 macOS 用户。

**使用方法**:

```bash
# 从项目根目录运行
./scripts/install.sh

# 或者从scripts目录运行
cd scripts
./install.sh
```

### 2. `install-dependencies.js` - Node.js 脚本版本

这是一个基于 Node.js 的安装脚本，适用于所有操作系统，但需要已安装 Node.js。

**使用方法**:

```bash
# 从项目根目录运行
node scripts/install-dependencies.js

# 或者从scripts目录运行
cd scripts
node install-dependencies.js
```

## 脚本功能

这两个脚本提供以下功能：

1. 自动检测并使用适当的包管理器 (npm, yarn, 或 pnpm)
2. 如果需要，初始化 package.json
3. 安装项目所需的所有依赖，包括:
   - Next.js, React, React DOM
   - better-sqlite3
   - date-fns
   - marked
   - react-calendar-heatmap
   - react-tooltip
   - zustand
   - recharts
   - react-markdown
   - 开发依赖 (ESLint, Tailwind CSS 等)

## 注意事项

- 这些脚本会在项目根目录中安装依赖
- 如果 package.json 不存在，脚本会自动创建一个并添加基本的 npm 脚本
- 脚本需要执行权限，如果遇到"权限被拒绝"的错误，请运行 `chmod +x scripts/install.sh scripts/install-dependencies.js` 