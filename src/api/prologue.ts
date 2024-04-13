import { http } from "@/utils/axios"


/**
 * 取得开场白信息
 * **/
export const getPrologue = async (id: number) => {
  let uri = '/Prologue?id=' + id
  return http.get(uri)
}

/**
 * 取得页面的开场白列表
 * **/
export const getMenuPrologue = async (menu: number) => {
  let uri = '/Prologue/GetMenuPrologues?menu=' + menu
  return http.get(uri)
}
