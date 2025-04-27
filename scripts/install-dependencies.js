#!/usr/bin/env node

/**
 * LeetCode Tracker依赖安装脚本
 * 
 * 此脚本用于安装项目所需的所有依赖，包括开发和生产环境
 * 支持npm、yarn和pnpm包管理工具
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 项目根目录
const rootDir = path.resolve(__dirname, '..');

// 配置颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 依赖列表
const dependencies = [
  'next@latest',
  'react@latest',
  'react-dom@latest',
  'better-sqlite3@latest',
  'date-fns@latest',
  'marked@latest',
  'react-calendar-heatmap@latest',
  'react-tooltip@latest',
  'zustand@latest',
  'recharts@latest',
  'react-markdown@latest'
];

const devDependencies = [
  'eslint@latest',
  'eslint-config-next@latest',
  'tailwindcss@latest',
  '@tailwindcss/postcss@latest'
];

// 读取用户输入的工具
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 打印带颜色的消息
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 检测包管理器
 */
function detectPackageManager() {
  try {
    // 检查项目中的锁文件
    if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) {
      return 'yarn';
    } else if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    } else if (fs.existsSync(path.join(rootDir, 'package-lock.json'))) {
      return 'npm';
    }
    
    // 如果没有锁文件，尝试检测全局安装的包管理器
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch (e) {
      try {
        execSync('pnpm --version', { stdio: 'ignore' });
        return 'pnpm';
      } catch (e) {
        return 'npm'; // 默认使用npm
      }
    }
  } catch (error) {
    return 'npm'; // 出错时默认使用npm
  }
}

/**
 * 安装依赖的命令
 */
function getInstallCommand(packageManager, isDev = false) {
  switch (packageManager) {
    case 'yarn':
      return isDev ? 'yarn add -D' : 'yarn add';
    case 'pnpm':
      return isDev ? 'pnpm add -D' : 'pnpm add';
    default:
      return isDev ? 'npm install --save-dev' : 'npm install --save';
  }
}

/**
 * 检查package.json是否存在，如果不存在则初始化
 */
function checkAndInitPackageJson(packageManager) {
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('未找到package.json，正在初始化...', 'yellow');
    
    let initCommand;
    switch (packageManager) {
      case 'yarn':
        initCommand = 'yarn init -y';
        break;
      case 'pnpm':
        initCommand = 'pnpm init';
        break;
      default:
        initCommand = 'npm init -y';
        break;
    }
    
    try {
      execSync(initCommand, { cwd: rootDir, stdio: 'inherit' });
      log('初始化package.json成功！', 'green');
      
      // 添加基本的scripts
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.dev = 'next dev';
      packageJson.scripts.build = 'next build';
      packageJson.scripts.start = 'next start';
      packageJson.scripts.lint = 'next lint';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      log(`初始化package.json失败: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    log('🚀 LeetCode Tracker 依赖安装脚本', 'cyan');
    log('------------------------------', 'bright');
    
    // 检测包管理器
    const detectedPackageManager = detectPackageManager();
    
    rl.question(`选择包管理器 [npm/yarn/pnpm] (默认: ${detectedPackageManager}): `, (answer) => {
      const packageManager = answer.trim() || detectedPackageManager;
      
      if (!['npm', 'yarn', 'pnpm'].includes(packageManager)) {
        log('不支持的包管理器。使用默认的npm。', 'yellow');
        packageManager = 'npm';
      }
      
      log(`使用 ${packageManager} 作为包管理器`, 'green');
      
      // 检查并初始化package.json
      checkAndInitPackageJson(packageManager);
      
      // 构建安装命令
      const prodCommand = `${getInstallCommand(packageManager)} ${dependencies.join(' ')}`;
      const devCommand = `${getInstallCommand(packageManager, true)} ${devDependencies.join(' ')}`;
      
      log('\n正在安装生产依赖...', 'cyan');
      log(`执行: ${prodCommand}`, 'yellow');
      
      exec(prodCommand, { cwd: rootDir }, (error, stdout, stderr) => {
        if (error) {
          log(`安装生产依赖失败: ${error.message}`, 'red');
          rl.close();
          return;
        }
        
        log('生产依赖安装成功！', 'green');
        log('\n正在安装开发依赖...', 'cyan');
        log(`执行: ${devCommand}`, 'yellow');
        
        exec(devCommand, { cwd: rootDir }, (error, stdout, stderr) => {
          if (error) {
            log(`安装开发依赖失败: ${error.message}`, 'red');
            rl.close();
            return;
          }
          
          log('\n✅ 所有依赖安装完成！', 'green');
          log('\n您可以使用以下命令启动开发服务器:', 'cyan');
          log(`  ${packageManager === 'npm' ? 'npm run' : packageManager} dev`, 'bright');
          
          rl.close();
        });
      });
    });
  } catch (error) {
    log(`出错了: ${error.message}`, 'red');
    rl.close();
  }
}

// 运行主函数
main(); 