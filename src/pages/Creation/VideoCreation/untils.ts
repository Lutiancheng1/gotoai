// 新增一个保存视频的task_id 保存到localStorage

/**
 * 保存task_id到localStorage
 * @param {string[]} taskIds - 需要保存的task_id数组
 */
export function saveTaskIds(taskIds: string[]): void {
  // 从localStorage中获取现有的taskIds
  const existingTaskIds = JSON.parse(localStorage.getItem('task_id') || '[]')

  // 将新的taskIds添加到现有的数组中
  const updatedTaskIds = [...existingTaskIds, ...taskIds]

  // 将更新后的数组保存回localStorage
  localStorage.setItem('task_id', JSON.stringify(updatedTaskIds))
}

/**
 * 从localStorage获取task_id
 * @returns {string[] | null} - 返回存储的task_id数组，如果没有找到则返回null
 */
export function getTaskIds(): string[] | null {
  const storedTaskIds = localStorage.getItem('task_id')
  return storedTaskIds ? JSON.parse(storedTaskIds) : null
}

/**
 * 从localStorage中删除task_id
 */
export function removeTaskIds(): void {
  localStorage.removeItem('task_id')
}

/**
 * 检查localStorage中是否存在task_id
 * @returns {boolean} - 如果存在task_id则返回true，否则返回false
 */
export function hasTaskIds(): boolean {
  return localStorage.getItem('task_id') !== null
}
