#!/bin/bash

# LeetCode Tracker 依赖安装脚本
# 这个shell脚本用于安装项目所需的所有依赖

# 颜色配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目依赖
DEPENDENCIES=(
  "next@latest"
  "react@latest"
  "react-dom@latest"
  "better-sqlite3@latest"
  "date-fns@latest"
  "marked@latest"
  "react-calendar-heatmap@latest"
  "react-tooltip@latest"
  "zustand@latest"
  "recharts@latest"
  "react-markdown@latest"
)

DEV_DEPENDENCIES=(
  "eslint@latest"
  "eslint-config-next@latest"
  "tailwindcss@latest"
  "@tailwindcss/postcss@latest"
)

# 打印带颜色的消息
print_message() {
  case $2 in
    "info") printf "${BLUE}%s${NC}\n" "$1" ;;
    "success") printf "${GREEN}%s${NC}\n" "$1" ;;
    "warning") printf "${YELLOW}%s${NC}\n" "$1" ;;
    "error") printf "${RED}%s${NC}\n" "$1" ;;
    *) printf "${CYAN}%s${NC}\n" "$1" ;;
  esac
}

# 检测包管理器
detect_package_manager() {
  if [ -f "yarn.lock" ]; then
    echo "yarn"
  elif [ -f "pnpm-lock.yaml" ]; then
    echo "pnpm"
  elif [ -f "package-lock.json" ]; then
    echo "npm"
  elif command -v yarn &> /dev/null; then
    echo "yarn"
  elif command -v pnpm &> /dev/null; then
    echo "pnpm"
  else
    echo "npm"
  fi
}

# 主函数
main() {
  print_message "🚀 LeetCode Tracker 依赖安装脚本" "info"
  print_message "------------------------------" "info"
  
  # 检测包管理器
  DEFAULT_PM=$(detect_package_manager)
  print_message "检测到的包管理器: $DEFAULT_PM" "info"
  
  # 提示用户选择包管理器
  read -p "选择包管理器 [npm/yarn/pnpm] (默认: $DEFAULT_PM): " PM
  PM=${PM:-$DEFAULT_PM}
  
  # 验证包管理器
  case $PM in
    npm|yarn|pnpm) ;;
    *)
      print_message "不支持的包管理器。使用默认的 $DEFAULT_PM。" "warning"
      PM=$DEFAULT_PM
      ;;
  esac
  
  print_message "使用 $PM 作为包管理器" "success"
  
  # 检查package.json是否存在
  if [ ! -f "package.json" ]; then
    print_message "未找到package.json，正在初始化..." "warning"
    
    case $PM in
      yarn) yarn init -y ;;
      pnpm) pnpm init ;;
      npm|*) npm init -y ;;
    esac
    
    # 添加基本scripts
    if [ -f "package.json" ]; then
      # 使用临时文件添加scripts
      TMP_FILE=$(mktemp)
      jq '.scripts = {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      }' package.json > "$TMP_FILE" && mv "$TMP_FILE" package.json
    fi
  fi
  
  # 安装依赖
  print_message "正在安装生产依赖..." "info"
  
  # 构建依赖字符串
  DEPS_STR=$(printf " %s" "${DEPENDENCIES[@]}")
  DEV_DEPS_STR=$(printf " %s" "${DEV_DEPENDENCIES[@]}")
  
  # 安装命令
  case $PM in
    yarn)
      print_message "执行: yarn add$DEPS_STR" "info"
      yarn add $DEPS_STR
      print_message "执行: yarn add -D$DEV_DEPS_STR" "info"
      yarn add -D $DEV_DEPS_STR
      ;;
    pnpm)
      print_message "执行: pnpm add$DEPS_STR" "info"
      pnpm add $DEPS_STR
      print_message "执行: pnpm add -D$DEV_DEPS_STR" "info"
      pnpm add -D $DEV_DEPS_STR
      ;;
    npm|*)
      print_message "执行: npm install --save$DEPS_STR" "info"
      npm install --save $DEPS_STR
      print_message "执行: npm install --save-dev$DEV_DEPS_STR" "info"
      npm install --save-dev $DEV_DEPS_STR
      ;;
  esac
  
  # 检查安装结果
  if [ $? -eq 0 ]; then
    print_message "✅ 所有依赖安装完成！" "success"
    print_message "您可以使用以下命令启动开发服务器:" "info"
    
    case $PM in
      yarn|pnpm) print_message "  $PM dev" "success" ;;
      npm|*) print_message "  npm run dev" "success" ;;
    esac
  else
    print_message "❌ 依赖安装过程中出现错误！" "error"
    exit 1
  fi
}

# 执行主函数
main 