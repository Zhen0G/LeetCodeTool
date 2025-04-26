// db-direct.js

import { db, initDB, getDB } from './db-sqlite.js'
import Problem from '../models/Problem.js'
import Note from '../models/Note.js'
import ProblemSet from '../models/ProblemSet.js'
import Submission from '../models/Submission.js'


// ✅ 导出各类函数和模型供 API 路由使用
export {
  db, 
  initDB,
  getDB,
  Problem,
  Note,
  ProblemSet,
  Submission
}
