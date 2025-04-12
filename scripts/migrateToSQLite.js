// scripts/migrateToSQLite.js
// 从MongoDB迁移数据到SQLite的脚本

const mongoose = require('mongoose');
const { Problem, Note, ProblemSet, closeDB } = require('../src/models/sqlite');

// 1. 连接到MongoDB
async function connectMongo() {
  try {
    // 从环境变量获取MongoDB连接字符串，若未设置则提示用户
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('错误：未设置MONGODB_URI环境变量');
      console.error('请设置环境变量：export MONGODB_URI="mongodb://your-connection-string"');
      process.exit(1);
    }

    console.log('正在连接到MongoDB...');
    await mongoose.connect(uri, {
      dbName: 'leetcode-tracker',
    });
    console.log('✅ 成功连接到MongoDB');
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    process.exit(1);
  }
}

// 2. 从MongoDB导入问题到SQLite
async function migrateProblems() {
  console.log('🔄 正在迁移题目数据...');
  
  try {
    // 从MongoDB获取所有问题
    const ProblemModel = mongoose.model('Problem', new mongoose.Schema({
      id: Number,
      title: String,
      tags: [String],
      difficulty: String,
      status: {
        last: String,
        stats: {
          tried: Number,
          passed: Number,
          partial: Number
        }
      },
      favorite: Boolean,
      link: String,
      note: String,
      history: [
        {
          date: Date,
          status: String,
          duration: Number
        }
      ]
    }));
    
    const problems = await ProblemModel.find({});
    console.log(`找到 ${problems.length} 个题目需要迁移`);
    
    // 迁移每个问题到SQLite
    for (const problem of problems) {
      console.log(`正在迁移题目: ${problem.id} - ${problem.title}`);
      
      try {
        // 转换为SQLite模型兼容的格式
        const data = {
          id: problem.id,
          title: problem.title,
          tags: problem.tags || [],
          difficulty: problem.difficulty,
          status: {
            last: problem.status?.last || 'Not Started',
            stats: {
              tried: problem.status?.stats?.tried || 0,
              passed: problem.status?.stats?.passed || 0,
              partial: problem.status?.stats?.partial || 0
            }
          },
          favorite: problem.favorite || false,
          link: problem.link,
          note: problem.note || '',
          history: (problem.history || []).map(h => ({
            date: h.date,
            status: h.status,
            duration: h.duration || 0
          }))
        };
        
        Problem.create(data);
      } catch (err) {
        console.error(`❌ 迁移题目 ${problem.id} 失败:`, err);
      }
    }
    
    console.log('✅ 题目数据迁移完成');
  } catch (error) {
    console.error('❌ 迁移题目数据时出错:', error);
  }
}

// 3. 从MongoDB导入笔记到SQLite
async function migrateNotes() {
  console.log('🔄 正在迁移笔记数据...');
  
  try {
    // 从MongoDB获取所有笔记
    const NoteModel = mongoose.model('Note', new mongoose.Schema({
      title: String,
      content: String,
      createdAt: Date
    }));
    
    const notes = await NoteModel.find({}).sort({ createdAt: -1 });
    console.log(`找到 ${notes.length} 个笔记需要迁移`);
    
    // 迁移每个笔记到SQLite
    for (const note of notes) {
      console.log(`正在迁移笔记: ${note.title}`);
      
      try {
        Note.create({
          title: note.title,
          content: note.content
        });
      } catch (err) {
        console.error(`❌ 迁移笔记 "${note.title}" 失败:`, err);
      }
    }
    
    console.log('✅ 笔记数据迁移完成');
  } catch (error) {
    console.error('❌ 迁移笔记数据时出错:', error);
  }
}

// 4. 从MongoDB导入题集到SQLite
async function migrateProblemSets() {
  console.log('🔄 正在迁移题目集合数据...');
  
  try {
    // 从MongoDB获取所有题集
    const ProblemSetModel = mongoose.model('ProblemSet', new mongoose.Schema({
      name: String,
      description: String,
      problems: [Number],
      createdAt: Date
    }));
    
    const sets = await ProblemSetModel.find({}).sort({ createdAt: -1 });
    console.log(`找到 ${sets.length} 个题目集合需要迁移`);
    
    // 迁移每个题集到SQLite
    for (const set of sets) {
      console.log(`正在迁移题目集合: ${set.name}`);
      
      try {
        ProblemSet.create({
          name: set.name,
          description: set.description || '',
          problems: set.problems || []
        });
      } catch (err) {
        console.error(`❌ 迁移题目集合 "${set.name}" 失败:`, err);
      }
    }
    
    console.log('✅ 题目集合数据迁移完成');
  } catch (error) {
    console.error('❌ 迁移题目集合数据时出错:', error);
  }
}

// 主函数：执行所有迁移任务
async function migrate() {
  try {
    console.log('🚀 开始数据迁移流程：MongoDB -> SQLite');
    
    // 连接MongoDB
    await connectMongo();
    
    // 执行迁移
    await migrateProblems();
    await migrateNotes();
    await migrateProblemSets();
    
    console.log('✅ 所有数据迁移完成!');
    console.log('数据已保存到 data/data.sqlite3 文件');
    
    // 关闭连接
    await mongoose.disconnect();
    closeDB();
    
    console.log('👋 迁移脚本执行完毕');
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
  }
}

// 运行迁移
migrate(); 