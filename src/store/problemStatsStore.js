import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProblemStatsStore = create(
  persist(
    (set) => ({
      stats: {
        todaySolved: 0,
        totalPassed: 0,
        total: 0,
        lastUpdatedDate: null,
        solvedTodayIds: []  // 👈 防止重复统计
      },
      setStats: (newStats) => set({ stats: newStats }),
      updateStats: (partialStats) =>
        set((state) => ({
          stats: { ...state.stats, ...partialStats }
        })),
      resetTodayIfNeeded: () =>
        set((state) => {
          const todayStr = new Date().toISOString().slice(0, 10)
          if (state.stats.lastUpdatedDate !== todayStr) {
            return {
              stats: {
                ...state.stats,
                todaySolved: 0,
                solvedTodayIds: [],
                lastUpdatedDate: todayStr,
                totalPassed: state.stats.totalPassed,
                total: state.stats.total
              }
            }
          }
          return {}
        }),

      // ✅ 添加这个函数
      markProblemSolvedToday: (id) =>
        set((state) => {
          const solvedTodayIds = state.stats.solvedTodayIds || []
          if (solvedTodayIds.includes(id)) return {}
          return {
            stats: {
              ...state.stats,
              todaySolved: state.stats.todaySolved + 1,
              totalPassed: state.stats.totalPassed + 1,
              solvedTodayIds: [...solvedTodayIds, id]
            }
          }
        })
    }),
    {
      name: 'problem-stats-storage'
    }
  )
)
