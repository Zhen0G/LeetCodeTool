"use client";

import { useEffect } from 'react';
import { closeDB } from '@/lib/sqlite';

export default function DbCleanup() {
  useEffect(() => {
    // 注册卸载事件监听器，关闭数据库连接
    const handleBeforeUnload = () => {
      closeDB();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 清理监听器
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      closeDB();
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
} 