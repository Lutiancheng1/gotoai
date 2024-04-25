import { http } from '@/utils/axios'

/**
 * Fetches the information of a Prologue (also known as an opening statement) given its ID.
 *
 * @param {number} id - The ID of the Prologue.
 * @return {Promise} A Promise that resolves to the Prologue's information.
 */
export const getPrologue = async (id: number) => {
  let uri = `/Prologue?id=${id}`
  return http.get(uri)
}

/**
 * Retrieves a list of Prologues (opening statements) for a given menu.
 *
 * @param {number} menu - The ID of the menu.
 * @return {Promise} A Promise that resolves to the list of Prologues.
 */
export const getMenuPrologue = async (menu: number) => {
  let uri = '/Prologue/GetMenuPrologues?menu=' + menu
  return http.get(uri)
}
