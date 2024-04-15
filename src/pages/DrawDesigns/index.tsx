import { useRef, useState } from 'react'
import './index.css'
import { Button, ConfigProvider, Input, InputNumber, InputNumberProps, List, Select, Switch, Tabs, Tooltip, Upload, UploadProps, Popconfirm } from 'antd'
import { InfoCircleOutlined, UploadOutlined, DownloadOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import Toast, { useToastContext } from '@/components/Toast'
import TextArea from 'antd/es/input/TextArea'
import { useBoolean } from 'ahooks'
import MJIcon from '@/assets/images/mj.jpg'
import NIJIIcon from '@/assets/images/niji.jpg'
import { ITab, pictureRatioWarp, modelVersions, qualityLevels, tabs, tabsWarp, modalWarp, stylizationWarp, stylesWarp } from './constant'
import { MJdraw } from '@/api/midijourney'
import axios from 'axios'
import MJrequest from '@/api/midijourney'
import { MD5 } from '@/utils/md5'
import { randString } from '@/utils/libs'
const DrawDesigns = () => {
  // 大模型
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentRootModel, setCurrentRootModel] = useState('Midjourney')
  // 次分类
  const [currentTab, setCurrentTab] = useState<ITab>('imageCreation')
  // 当前模型 MJ NIJI
  const [currentModel, setCurrentModel] = useState<'MJ' | 'NIJI'>('MJ')
  // 图片比例
  const [pictureRatio, setPictureRatio] = useState(pictureRatioWarp[2].label)
  // 图像质量 风格化
  const [stylization, setStylization] = useState(250)
  // 当前风格
  const [currentStyle, setCurrentStyle] = useState(stylesWarp[0].label)
  // 当前版本
  const [currentVersion, setCurrentVersion] = useState(modelVersions[currentModel][0].label)
  // RAW
  const [raw, { toggle: toggleRaw, setTrue: setTrueRaw }] = useBoolean(true)
  // 重复
  const [repeate, { toggle: toggleRepeate, setFalse: setFalseRepeate }] = useBoolean(false)
  // 画质
  const [quality, setQuality] = useState(qualityLevels[0].label)
  // 混乱
  const [confusion, setConfusion] = useState(1)
  // 是否携带参数
  const [withParams, { toggle: toggleWithParams, setTrue: setTrueWithParams }] = useBoolean(true)
  // 提示词
  const [prompt, setPrompt] = useState('')
  // 忽略元素
  const [ignoreElements, setIgnoreElements] = useState('')
  // 记录左侧控制烂收起折叠
  const [isFold, setIsFold] = useState(false)
  const controllerRef = useRef<HTMLDivElement>(null)
  const { notify } = useToastContext()
  //翻译loading状态
  const [translateLoadingPrompt, setTranslateLoadingPrompt] = useState(false)
  const [translateLoadingIgnore, setTranslateLoadingIgnore] = useState(false)
  const menuClick = (key: ITab) => {
    console.log(key, 'key')
    setCurrentTab(key)
    setIsFold(false)
  }
  // 重置默认参数
  const resetParams = () => {
    // 重置图片比例
    setPictureRatio(pictureRatioWarp[2].label)
    // 重置模型
    setCurrentModel('MJ')
    // 重置风格
    setCurrentStyle(stylesWarp[0].label)
    // 重置当前绘画版本
    setCurrentVersion(modelVersions[currentModel][0].label)
    // 重置RAW
    setTrueRaw()
    // 重置重复
    setFalseRepeate()
    // 重置画质
    setQuality(qualityLevels[0].label)
    // 重置混乱
    setConfusion(1)
    // 重置风格化
    setStylization(250)
    // 重置是否携带参数
    setTrueWithParams()
  }
  const inputNumberonChange: InputNumberProps['onChange'] = (value) => {
    setStylization(value as number)
  }
  const toggleIsFold = () => {
    if (!controllerRef.current) return
    controllerRef.current.style.display = isFold ? 'block' : 'none'
    // 动画
    setIsFold(!isFold)
  }
  const props: UploadProps = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
      authorization: 'authorization-text'
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        Toast.notify({ type: 'success', message: `${info.file.name} file uploaded successfully.` })
      } else if (info.file.status === 'error') {
        Toast.notify({ type: 'error', message: `${info.file.name} file upload failed.` })
      }
    }
  }
  // 创建任务
  const createTask = async () => {
    // console.log('创建任务')
    // const res = fetch('/mj/submit/imagine', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Authorization: `Bearer ${'MTE5Mzc2NTA1NzY2MjgzMjY3NA.Gmxibo.Gy6bhWRoeJoRkCCjwyHtzkgu8F9iPKxShhDcRE'}`,
    //     Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVkIjoxNzEyOTA3OTA0LCJ1c2VyX2lkIjo0fQ.jo9IoFhBVYwruganlGkclBF9tbchFnWa2gA - kxqU2O8'}`
    //   },
    //   body: JSON.stringify({
    //     base64Array: [],
    //     notifyHook: '',
    //     prompt: 'city --version 5.2 --aspect 3:4 --stylize 250 --quality 0.25 --chaos 1 --style raw',
    //     state: '',
    //     botType: 'MID_JOURNEY'
    //   })
    // })
    let prompt = ''
    if (currentModel === 'MJ') {
    }
    if (withParams) {
      console.log('携带参数')
    } else {
      console.log('不携带参数')
    }
  }
  const translate = async (q: string, target: string) => {
    if (!q) return
    if (target === 'prompt') {
      setTranslateLoadingPrompt(true)
    } else {
      setTranslateLoadingIgnore(true)
    }
    console.log('翻译')
    const appid = '20210327000745207'
    const key = 'SfTyVcPBdOGs7yezosr9'
    const randomStr = randString(8)
    const sign = MD5(appid + q + randomStr + key)
    // 区分开发环境
    // let url = process.env.NODE_ENV === 'development' ? `/https://fanyi-api.baidu.com/api/trans/vip/translate?q=${q}&from=zh&to=en&appid=${appid}&salt=${randomStr}&sign=${sign}` : `/baidu?q=${q}&from=zh&to=en&appid=${appid}&salt=${randomStr}&sign=${sign}`
    // let url = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${q}&from=zh&to=en&appid=${appid}&salt=${randomStr}&sign=${sign}`
    let url = `/baidu?q=${q}&from=zh&to=en&appid=${appid}&salt=${randomStr}&sign=${sign}`
    const res = await axios.get(url)
    try {
      if (res.status === 200 && res.data && res.data.trans_result) {
        // console.log(res.data.trans_result[0].dst)
        const resultTetx = res.data.trans_result[0].dst
        if (target === 'prompt') {
          setPrompt(resultTetx)
          setTranslateLoadingPrompt(false)
        } else {
          setIgnoreElements(resultTetx)
          setTranslateLoadingIgnore(false)
        }
      }
    } catch (error) {
      notify({ type: 'error', message: '翻译失败' })
      setTranslateLoadingPrompt(false)
      setTranslateLoadingPrompt(false)
    }
  }
  return (
    <div className="drawDesigns">
      {/* 上方tab切换*/}
      <section className="draw-tabs bg-white flex justify-start">
        {/* 两个模型 Midjourney  |  Stable Diffusion */}
        <ConfigProvider
          theme={{
            components: {
              Tabs: {
                /* 这里是你的组件 token */
                inkBarColor: '#dcddde',
                itemActiveColor: '',
                itemSelectedColor: '',
                itemHoverColor: ''
              }
            }
          }}
        >
          <Tabs
            defaultActiveKey={currentRootModel}
            items={[
              {
                label: 'Midjourney',
                key: 'Midjourney',
                children: (
                  <div className="Midjourney">
                    <div className="draw-controller-item-title">
                      <ul className="action menu menu-vertical lg:menu-horizontal rounded-box">
                        {tabs.map((item) => {
                          return (
                            <li className="mr-2" key={item} onClick={() => menuClick(item as ITab)}>
                              <button className={`${item === currentTab ? 'active' : ''}`}>{tabsWarp[item]} </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                )
              },
              {
                label: 'Stable Diffusion',
                key: 'Stable Diffusion',
                children: <StableDiffusion />,
                disabled: true
              }
            ]}
          />
        </ConfigProvider>
      </section>
      {/* container */}
      <section className="draw-container w-full h-full flex overflow-hidden">
        {currentTab === 'imageCreation' && (
          <>
            <div className="relative bg-white" style={{ borderRight: '1px solid rgb(229, 231, 235)' }}>
              <div className="draw-controller w-[210px] p-3" ref={controllerRef}>
                {/* 图片比例 */}
                <div className="picture_ratio mb-4">
                  <div className="mb-2 flex items-center text-sm">
                    <div className="mr-1">图片比例</div>
                    <Tooltip
                      title={
                        <>
                          <p> --aspect,或--ar更改生成的纵横比.</p>
                          <p>参数释义：生成图片尺寸比例</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                  <div className="aspect flex items-center justify-between space-x-1">
                    {pictureRatioWarp.map((item, index) => {
                      return (
                        <button className={`aspect-item flex-1 rounded border-2 dark:border-neutral-700 ${pictureRatio === item.label ? 'active' : ''}`} key={index} onClick={() => setPictureRatio(item.label)}>
                          <div className="aspect-box-wrapper mx-auto my-2 flex h-5 w-5 items-center justify-center">
                            <div className="aspect-box rounded border-2 dark:border-neutral-700" style={{ width: item.w + '%', height: item.h + '%' }} />
                          </div>
                          <p className="mb-1 text-center text-xs">{item.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
                {/* 模型选择 */}
                <div className="model mb-4">
                  <div className="mb-2 flex items-center text-sm">
                    <div className="mr-1">模型选择</div>
                    <Tooltip
                      title={
                        <>
                          <p>MJ：通用模型 </p>
                          <p>NIJI：动漫风格模型</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                  <ul className="model space-x-2 flex justify-center items-center">
                    {modalWarp.map((item) => {
                      return (
                        <li
                          className={`model-item ${currentModel === item ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentModel(item)
                            setCurrentVersion(modelVersions[currentModel][0].label)
                          }}
                          key={item}
                        >
                          <button className="relative overflow-hidden rounded-md border-4 dark:border-neutral-700">
                            <span className="absolute flex h-full w-full items-center justify-center bg-black/20">
                              <span className="text-lg font-bold text-white">{item}</span>
                            </span>
                            <img className="h-full w-full object-cover" src={item === 'MJ' ? MJIcon : NIJIIcon} alt={item} />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                {/* 版本 */}
                <div className="version flex items-center mb-4 justify-between">
                  <div>版本</div>
                  <Select value={currentVersion} style={{ width: 120 }} onChange={(value) => setCurrentVersion(value)} options={modelVersions[currentModel]} allowClear={false} />
                </div>
                {/* RAW NIJI不许有该参数 */}
                {currentModel === 'MJ' && (
                  <div className="RAW flex items-center mb-4 justify-between">
                    <div>RAW</div>
                    <Switch className="bg-gray-500" value={raw} onChange={toggleRaw} />
                    <Tooltip title="呈现的人物写实感更加逼真人物细节、光源、流畅度也更加接近原始作品">
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                )}
                {/* 重复 NIJI不许有该参数 */}
                {currentModel === 'MJ' && (
                  <div className="repeat flex items-center mb-4 justify-between">
                    <div>重复</div>
                    <Switch className="bg-gray-500" value={repeate} onChange={toggleRepeate} />
                    <Tooltip
                      title={
                        <>
                          <p>重复：--tile</p>
                          <p>参数释义：生成可用作重复平铺的图像，以创建无缝图案。</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                )}
                {/* 风格  NIJI独有*/}
                {currentModel === 'NIJI' && (
                  <div className="style flex items-center mb-4 justify-between">
                    <div>风格</div>
                    <Select value={currentStyle} style={{ width: 120 }} onChange={(value) => setCurrentStyle(value)} options={stylesWarp} allowClear={false} />
                  </div>
                )}
                {/* 参数 */}
                <div className="parameter flex items-center justify-between">
                  <div className="mb-4 flex items-center text-sm">
                    <div className="mr-1">参数</div>
                    <Tooltip title="设定绘画模型参数">
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                </div>
                {/* 画质 */}
                <div className="picture_quality flex items-center mb-4 justify-between">
                  <div>画质</div>
                  <Select value={quality} style={{ width: 100 }} onChange={setQuality} options={qualityLevels} />
                  <Tooltip
                    title={
                      <>
                        <p>画质：--quality 或 --q</p>
                        <p>参数释义：更高质量需要更长的时间处理更多细节</p>
                      </>
                    }
                  >
                    <InfoCircleOutlined rotate={180} />
                  </Tooltip>
                </div>
                {/* 混乱 */}
                <div className="confusion flex items-center mb-4 justify-between">
                  <div>混乱</div>
                  <InputNumber min={1} style={{ width: 100 }} max={100} value={confusion} onChange={(value) => setConfusion(value!)} />
                  <Tooltip title="混乱：--chaos 或 --c，范围 0-100参数释义：较高值将产生意想不到的结果和成分较低值具有更可靠、可重复的结果">
                    <InfoCircleOutlined rotate={180} />
                  </Tooltip>
                </div>
                {/* 风格化 */}
                <div className="parameter flex items-center justify-between">
                  <div className="mb-4 flex items-center text-sm">
                    <div className="mr-1">风格化</div>
                    <Tooltip
                      title={
                        <>
                          <p>风格化: --stylize 或 --s,范围 1-1000</p>
                          <p>参数释义：数值越高，画面表现也会更具丰富性和艺术性</p>
                        </>
                      }
                    >
                      <InfoCircleOutlined rotate={180} />
                    </Tooltip>
                  </div>
                </div>
                <div className="flex justify-around mb-2">
                  {stylizationWarp.map((item) => {
                    return (
                      <Button type="default" className={stylization === item.value ? 'bg-[#1890ff]' : ''} size="small" onClick={() => setStylization(item.value)} key={item.label}>
                        {item.label}
                      </Button>
                    )
                  })}
                </div>
                <div className="w-full mb-4">
                  <InputNumber style={{ width: '100%' }} min={1} max={1000} value={stylization} defaultValue={250} onChange={inputNumberonChange} />
                </div>
                {/* 设定 */}
                <div className="setup flex items-center mb-4 justify-between">
                  <div>设定</div>
                </div>
                <div className="carry_parameters flex items-center mb-4 justify-between">
                  <div>携带参数</div>
                  <Switch className="bg-gray-500" value={withParams} onChange={toggleWithParams} />
                  <Tooltip
                    title={
                      <>
                        <p>是否自动携带参数 </p>
                        <p>开启：使用设定参数 </p>
                        <p>关闭：可在提示词框自行设定参数</p>
                      </>
                    }
                  >
                    <InfoCircleOutlined rotate={180} />
                  </Tooltip>
                </div>
                {/* reset */}
                <div className="default flex items-center mb-4 ">
                  <div>默认参数</div>
                  <Popconfirm title="重置参数" description="是否重置参数为默认？" onConfirm={resetParams} okText="确认" okButtonProps={{ className: 'bg-[#1890ff] ' }} cancelText="取消">
                    <button className="btn btn-ghost btn-sm ml-4">重置</button>
                  </Popconfirm>
                </div>
              </div>
              {/* 折叠按钮 */}
              <div className="fold flex justify-center items-center w-[30px] h-[30px] cursor-pointer absolute " title="收起" style={{ right: 0, top: '50%', transform: 'translate(60%,-150%)', zIndex: 10 }} onClick={toggleIsFold}>
                <i className={`iconfont cursor-pointer ${!isFold ? 'icon-zhedie' : 'icon-zhankai'}`}></i>
              </div>
            </div>
            <div className="draw-content w-full p-4 overflow-y-auto">
              {/* 头部 */}
              <header className="mb-3">
                <div className="title text-lg">AI绘画</div>
                <div className="subtitle mb-2">基于Midjourney的AI绘画工具</div>
                <p className="mb-2">图生图：生成类似风格或类型图像；图生文：上传一张图片生成对应的提示词；融图：融合图片风格</p>
                <div className="btns">
                  <Upload {...props} style={{ marginRight: '10px' }}>
                    <Button icon={<UploadOutlined />} type="primary" className="bg-blue-500">
                      以图生图（可选）
                    </Button>
                  </Upload>
                  {/* <Upload {...props}>
                    <Button type="primary" className="bg-blue-500" icon={<UploadOutlined />}>
                      以图生文（可选）
                    </Button>
                  </Upload>
                  <Upload {...props}>
                    <Button type="primary" className="bg-blue-500" icon={<UploadOutlined />}>
                      融图（可选）
                    </Button>
                  </Upload> */}
                </div>
              </header>
              {/* 内容 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div>生成提示词</div>
                <div>
                  <Button loading={translateLoadingPrompt} onClick={() => translate(prompt, 'prompt')} disabled={prompt.trim() === ''} type="primary" className="bg-[#1890ff]" icon={<i className="iconfont icon-chajiantubiao_zhongyingfanyi"></i>}>
                    翻译
                  </Button>
                </div>
              </div>
              <div className="textarea_con mb-2">
                <TextArea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="例如：a cute cat（中文描述词处理可能不准确，建议使用英文进行描述）" autoSize={{ minRows: 3, maxRows: 5 }} />
              </div>
              {/* 忽略元素 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div>忽略元素（可选）</div>
                <div>
                  <Button loading={translateLoadingIgnore} onClick={() => translate(ignoreElements, 'ignore')} disabled={ignoreElements.trim() === ''} type="primary" className="bg-[#1890ff]" icon={<i className="iconfont icon-chajiantubiao_zhongyingfanyi"></i>}>
                    翻译
                  </Button>
                </div>
              </div>
              <div className="ignore_element mb-4">
                <Input value={ignoreElements} onChange={(e) => setIgnoreElements(e.target.value)} placeholder="例如：生成一幅街景，但不要有汽车，你可以填写 car" />
              </div>
              {/* 预设 */}
              <div className="mb-4">
                <Button type="default" size="small" className="mr-2" onClick={() => setPrompt('a cute cat')}>
                  可爱的小猫
                </Button>
                <Button type="default" size="small" className="mr-2" onClick={() => setPrompt('a blue, girl with colorful hair, in the style of yanjun cheng, clowncore, 32k uhd, painted illustrations, close up, lively tableaus, kawaii art HD 8K')}>
                  蓝色动漫女孩
                </Button>
                <Button type="default" size="small" onClick={() => setPrompt('a little girl eating watermelon on a farm, by Maria Hernandez, unsplash, joyful expression, green fields, sunny day, bright colors, rustic atmosphere, wooden fence, straw hat, freckles, pure happiness, blissful moment')}>
                  吃西瓜小女孩
                </Button>
              </div>
              {/* 开始按钮 */}
              <div className="start mb-3" onClick={createTask}>
                <Button type="primary" disabled={!prompt.trim()} className=" bg-blue-500" icon={<i className="iconfont icon-a-Group3802"></i>}>
                  创建任务
                </Button>
              </div>
              {/* 当前任务 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">当前任务</div>
                <Button type="default" icon={<i className="iconfont icon-shuaxin"></i>}>
                  刷新
                </Button>
              </div>
              <div>
                <List size="small" bordered dataSource={[]} renderItem={(item) => <List.Item>{item}</List.Item>} />
              </div>
              {/* 任务列表 */}
              {/* 开始按钮 */}
              <div className="start mb-3"></div>
              {/* 任务列表 */}
              <div className="w-full flex justify-between items-center mb-2">
                <div className="text-lg font-semibold">任务列表</div>
              </div>
              <div className="w-full flex justify-between items-center mb-2">
                <div>总记 : 0</div>
                <div>
                  <Button className=" mr-2" type="default" icon={<i className="iconfont icon-shuaxin"></i>}>
                    刷新
                  </Button>
                  <Button type="default" icon={<DownloadOutlined />}></Button>
                </div>
              </div>
              <div>
                <List pagination={{ position: 'bottom', align: 'center' }} size="small" bordered dataSource={[]} renderItem={(item) => <List.Item>{item}</List.Item>} />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

const StableDiffusion = () => {
  return <div className="StableDiffusion"></div>
}
export default DrawDesigns
