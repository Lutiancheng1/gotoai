import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './CaseDetail.css'
import { FloatButton } from 'antd'
import { useMount } from 'ahooks'
import BannerPng from '@/assets/images/Banner-1920.jpg'
import { CaseData } from '@/api/customerstory'
const CaseDetail = () => {
  const { state } = useLocation() as { state: CaseData }
  const naviagte = useNavigate()
  useMount(() => {
    console.log(state, 'state')
  })
  return (
    <div className="w-full h-full case-detail overflow-y-auto nw-scrollbar">
      {state && (
        <>
          <section className="c-hero relative">
            <img alt="" className="pointer-events-none" src={BannerPng} />
            <div
              className="absolute top-1/2 left-[5%]"
              style={{
                transform: 'translateY(-50%)'
              }}
            >
              <h1 className="c-heading">{state.title}</h1>
            </div>
          </section>
          <div className="bg-white flex px-[5%] py-20">
            <div className="w-1/4">
              {/* logo */}
              <div className="story-logo">
                <img
                  alt="logo"
                  className="customer-logo pointer-events-none"
                  src={state.logo ?? 'https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1784294520000231012-joyson-microsoft-sentine-automotive-zh-china/resources/87a043cf-20cd-4a59-be0f-84acc331ffcc/asset1787552675764620053_1787552675764620053'}
                />
              </div>
              {/* 客户信息 */}
              <div className="story-meta mt-8">
                <h3>客户名称</h3>
                <p className="c-hyperlink">{state.customerName}</p>
                <div className="mt-[10px]">
                  <h3>产品与服务</h3>
                  <div>
                    <p className="c-hyperlink">{state.product}</p>
                  </div>
                </div>
                <div className="mt-[10px]">
                  <h3>行业</h3>
                  <div>
                    <p className="c-hyperlink">{state.industry}</p>
                  </div>
                </div>
                <div className="mt-[10px]">
                  <h3>组织规模</h3>
                  <div>
                    <p className="c-hyperlink">{state.organizationSize}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-3/4 pl-4">
              {/* 企业背景 */}
              <div className="executive-summary">
                <p>{state.companyProfile} </p>
              </div>
              {/* 业务痛点 */}
              <div className="body-text-2 c-paragraph-3">
                <div>
                  <h3 className="pt-2 pb-6 !font-100 text-[34px]">业务痛点</h3>
                  <p>{state.case} </p>
                </div>
              </div>
              {/* 解决方案 */}
              <div className="body-text-2 c-paragraph-3">
                <div>
                  <h3 className="pt-2 pb-6 !font-100 text-[34px]">解决方案</h3>
                  <p>{state.solution}</p>
                </div>
              </div>
              {/* <img alt="Story" className="mb-[64px] pointer-events-none" src="https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1666219359761438754-taikoohui-other-unsegmented-azure-zh-china/resources/e884dedf-f8af-4755-bed0-c294c19edc4f/1666225639115711870_1666225639115711870" /> */}
              {/* 优势及收益 */}
              <div className="body-text-2 c-paragraph-3">
                <div>
                  <h3 className="pt-2 pb-6 !font-100 text-[34px]">优势及收益</h3>
                  <p>{state.earnings}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <FloatButton
        tooltip="返回案例中心"
        style={{
          right: 30,
          bottom: 105
        }}
        icon={<i className="iconfont icon-fanhui1" />}
        className="hover:opacity-80"
        onClick={() => naviagte(-1)}
      />
      <FloatButton.BackTop
        style={{
          right: 30
        }}
        tooltip="回到顶部"
        className="hover:opacity-80"
        visibilityHeight={200}
        target={() => document.querySelector('.case-detail') as HTMLDivElement}
      />
    </div>
  )
}
export default CaseDetail
