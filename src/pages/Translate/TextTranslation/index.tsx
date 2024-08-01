import { Input, Select } from 'antd'
import './index.css'
import { MD5 } from '@/utils/md5'
import { REACT_APP_BASE_URL_CONFIG } from '@/config'
import { SetStateAction, useRef, useState } from 'react'
import axios from 'axios'
import { debounce } from 'radash'
import { handleCopyClick } from '@/components/Dialogue_agent'
const languageOptions = [
  { value: 'auto', label: '自动检测' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英语' },
  { value: 'yue', label: '粤语' },
  { value: 'wyw', label: '文言文' },
  { value: 'cht', label: '繁体中文' },
  { value: 'jp', label: '日语' },
  { value: 'kor', label: '韩语' },
  { value: 'fra', label: '法语' },
  { value: 'spa', label: '西班牙语' },
  { value: 'th', label: '泰语' },
  { value: 'ara', label: '阿拉伯语' },
  { value: 'ru', label: '俄语' },
  { value: 'pt', label: '葡萄牙语' },
  { value: 'de', label: '德语' },
  { value: 'it', label: '意大利语' },
  { value: 'el', label: '希腊语' },
  { value: 'nl', label: '荷兰语' },
  { value: 'pl', label: '波兰语' },
  { value: 'bul', label: '保加利亚语' },
  { value: 'est', label: '爱沙尼亚语' },
  { value: 'dan', label: '丹麦语' },
  { value: 'fin', label: '芬兰语' },
  { value: 'cs', label: '捷克语' },
  { value: 'rom', label: '罗马尼亚语' },
  { value: 'slo', label: '斯洛文尼亚语' },
  { value: 'swe', label: '瑞典语' },
  { value: 'hu', label: '匈牙利语' },
  { value: 'vie', label: '越南语' }
]
export default function TextTranslation() {
  // 原文
  const [text, setText] = useState('')
  // 翻译结果
  const [result, setResult] = useState('')
  // from
  const [from, setFrom] = useState(languageOptions[0].value)
  // to
  const [to, setTo] = useState(languageOptions[1].value)
  const compositionLockRef = useRef<boolean>(false)
  // 翻译中
  const [translating, setTranslating] = useState(false)
  // 翻译
  const translate = async (word?: string, f?: string, t?: string) => {
    const keyword = (word ?? text).trim()
    const F = f ?? from
    const T = t ?? to
    if (!keyword) return
    const AppId = '20240506002043542'
    const Key = 'Y38PvAPfOOyaBKOLnQsG'
    const salt = Date.now()
    const sign = MD5(`${AppId}${keyword}${salt}${Key}`)
    const url = `${REACT_APP_BASE_URL_CONFIG.REACT_APP_FANYI_BASE_URL}/api/trans/vip/translate?q=${encodeURIComponent(keyword)}&from=${F}&to=${T}&appid=${AppId}&salt=${salt}&sign=${sign}`
    try {
      setTranslating(true)
      if (keyword) {
        const { data } = await axios.get(url)
        setTranslating(false)
        if (data) {
          setResult(data.trans_result[0].dst)
        }
      }
    } catch (error) {
      setTranslating(false)
    }
  }
  const debounceTranslate = useRef(debounce({ delay: 800 }, translate)).current

  const onComposition = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
    // 使用中文输入法时的触发翻译
    if (event.type === 'compositionend') {
      compositionLockRef.current = false
      debounceTranslate(text, from, to)
    } else {
      compositionLockRef.current = true
    }
  }
  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(() => e.target.value)
    if (!compositionLockRef.current) {
      debounceTranslate(e.target.value, from, to)
    }
  }
  // 过滤掉已选择语言的选项
  const getFilteredOptions = (selectedValue: string) => {
    return languageOptions.slice(1).filter((option) => option.value !== selectedValue)
  }

  const handleFromChange = (value: string) => {
    setFrom(value)
    // 更新目标语言选项，确保不包含已选择的源语言
    const filteredOptions = getFilteredOptions(value)
    if (filteredOptions.every((option) => option.value !== to)) {
      setTo(filteredOptions[0].value)
    }
  }

  return (
    <div className="text-translation size-full bg-[#F3F5F8] px-8 pt-8 ">
      <div className="relative flex w-full min-h-[548px] bg-white rounded-[6px]">
        <i className="iconfont icon-zuoyouqiehuan !text-[24px] absolute left-1/2 -translate-x-1/2 top-[10px] cursor-pointer transform transition duration-500 " onClick={() => translate(text, from, to)} />
        <div className="flex flex-col w-1/2 flex-grow">
          <div className="flex items-center flex-shrink-0 pl-[13px] h-[56px] border-b-[1px] border-[#EFEFEF]">
            <Select className="no_outline" value={from} onChange={handleFromChange} style={{ width: 120 }} options={languageOptions} />
          </div>
          <div
            className="relative flex-1 flex flex-col"
            style={{
              borderRadius: '0 0 0 6px'
            }}
          >
            <Input.TextArea
              onCompositionStart={onComposition}
              onCompositionEnd={onComposition}
              allowClear={{
                clearIcon: (
                  <i
                    className="iconfont icon-x !text-24"
                    onClick={() => {
                      setResult('')
                    }}
                  />
                )
              }}
              className="!shadow-none form_textarea !leading-[33px] !text-[24px] !pl-6 !pr-[72px] !py-[19px] !size-full"
              value={text}
              autoSize={true}
              variant="borderless"
              maxLength={2000}
              showCount
              onChange={handleTextChange}
              placeholder="键入翻译"
            />
          </div>
        </div>
        <div className="flex flex-col w-1/2 flex-grow">
          <div className="flex items-center flex-shrink-0 pl-[13px] h-[56px] border-b-[1px] border-[#EFEFEF]">
            <Select className="no_outline" value={to} onChange={setTo} style={{ width: 120 }} options={getFilteredOptions(from)} />
          </div>
          {/*  译文结果 */}
          <div
            className="relative size-full border-l-[1px] border-[#EFEFEF] px-6 pt-[19px] pb-[70px] overflow-hidden"
            style={{
              borderRadius: '0px 0px 6px'
            }}
          >
            <div className="h-full text-[24px] leading-[33px] break-all whitespace-pre-line overflow-y-auto relative">
              {translating && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  loading loading-spinner loading-md"></span>}
              {result}
            </div>
            {result && (
              <div className="flex items-center mt-[15px] pt-[15px] text-14 border-dashed border-t-[1px] border-[rgba(105,117,126,0.3)] justify-end">
                <div onClick={() => handleCopyClick(result)} className="flex justify-center items-center w-[76px] h-[32px] text-[#0E6CF2] rounded-[4px] cursor-pointer border-[1px] border-[#0E6CF2] group hover:bg-[#0E6CF2] hover:text-[#fff] bg-[#fff]">
                  <i className="iconfont icon-icon_fuzhi !mr-[5px]"></i>
                  复制
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
