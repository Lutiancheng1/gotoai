// 登陆
import { http } from '@/utils/axios'
type LoginRes = {
  data: {
    token: string
    type: number
    validTo: string
  }
  code: number
  key: string
  msg: string
}
/**
 * Sends a POST request to the '/User/Login' endpoint to authenticate a user.
 *
 * @param {Object} credentials - The user's credentials containing the username and password.
 * @param {string} credentials.username - The user's username.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<LoginRes>} The response containing the user's authentication token.
 */
export const login = async ({ username, password }: { username: string; password: string }) => {
  /**
   * The data to be sent in the request body.
   * @type {Object}
   * @property {string} name - The user's username.
   * @property {string} password - The user's password.
   * @property {number} type - The type of the user, set to 1.
   */
  const data = {
    name: username,
    password,
    type: 1
  }
  return (await http.post('/User/Login', data)) as LoginRes
}

/**
 * Retrieves the app information of the current user.
 *
 * @returns {Promise<any>} The app information of the current user.
 */
export const getAppInfo = async () => {
  return await http.get('/Dify/UserAppInfo')
}
