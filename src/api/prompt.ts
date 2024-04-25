import { http } from '@/utils/axios'

/**
 * Fetches a list of page prompts based on the specified menu.
 *
 * @param {number} menu - The menu ID.
 * @return {Promise} A Promise that resolves to the HTTP response.
 */
export const getMenuPrompts = async (menu: number) => {
  let uri = '/Prompt/GetMenuPrompts?menu=' + menu
  return http.get(uri)
}

/**
 * Fetches a single prompt based on the specified ID.
 *
 * @param {number} id - The ID of the prompt.
 * @return {Promise} A Promise that resolves to the HTTP response.
 */
export const getPrompt = (id: number) => {
  let uri = '/Prompt?id=' + id
  return http.get(uri)
}

/**
 * Fetches a list of prompts for the current user.
 *
 * @return {Promise} A Promise that resolves to the HTTP response.
 */
export const getUserPrompts = async () => {
  let uri = '/Prompt/UserPrompts'
  return http.get(uri)
}

/**
 * Fetches a list of prompt categories.
 *
 * @return {Promise} A Promise that resolves to the HTTP response.
 */
export const getPromptTypes = async () => {
  let uri = '/PromptCategory/CategoryList'
  return http.get(uri)
}

/**
 * Fetches a list of prompts based on the specified category ID.
 *
 * @param {number} categoryId - The ID of the category.
 * @return {Promise} A Promise that resolves to the HTTP response.
 */
export const getPromptList = (categoryId: number) => {
  let uri = '/Prompt/GetPrompts?categoryId=' + categoryId
  return http.get(uri)
}
