import { useNavigate, useParams } from 'react-router-dom'
import './CaseDetail.css'
import { FloatButton } from 'antd'
import { useMount } from 'ahooks'
const CaseDetail = () => {
  const { id } = useParams<{ id: string }>()
  const naviagte = useNavigate()
  useMount(() => {
    console.log(id, 'id')
  })
  return (
    <div className="w-full h-full case-detail overflow-y-auto nw-scrollbar">
      <section className="c-hero relative">
        <img alt="" className="pointer-events-none" src="https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1784294520000231012-joyson-microsoft-sentine-automotive-zh-china/resources/b0e76798-abf3-42f3-b925-72b1e6b78136/asset1784315263196057512_1784315263196057512" />
        <div
          className="absolute top-1/2 left-[5%]"
          style={{
            transform: 'translateY(-50%)'
          }}
        >
          <h1 className="c-heading">均胜电子携手微软 SOC 解决方案构筑现代化信息安全运维体系，守护客户信任与品牌价值</h1>
        </div>
      </section>
      <div className="bg-white flex px-[5%] pt-20">
        <div className="w-1/4">
          {/* logo */}
          <div className="story-logo">
            <img
              alt="宁波均胜电子股份有限公司 logo"
              className="customer-logo pointer-events-none"
              src="https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1784294520000231012-joyson-microsoft-sentine-automotive-zh-china/resources/87a043cf-20cd-4a59-be0f-84acc331ffcc/asset1787552675764620053_1787552675764620053"
            />
          </div>
          {/* 客户信息 */}
          <div className="story-meta">
            <h3>客户名称</h3>
            <a className="c-hyperlink" href="https://www.joyson.cn/" target="_blank" rel="noreferrer">
              宁波均胜电子股份有限公司
            </a>
            <div className="mt-[10px]">
              <h3>产品与服务</h3>
              <div>
                <a className="c-hyperlink" href="https://customers.microsoft.com/en-us/search?sq=%2522%25E2%2580%258BMicrosoft%2520Defender%2522&ff=&p=0&so=null" target="_blank" rel="noreferrer">
                  ​Microsoft Defender
                </a>
              </div>
              <div>
                <a className="c-hyperlink" href="https://customers.microsoft.com/en-us/search?sq=%22Microsoft%20Sentinel%22&ff=&p=0&so=story_publish_date%20desc" target="_blank" rel="noreferrer">
                  Microsoft Sentinel
                </a>
              </div>
            </div>
            <div className="mt-[10px]">
              <h3>行业</h3>
              <div>
                <a className="c-hyperlink" href="https://customers.microsoft.com/en-us/search?sq=&ff=story_industry%2526%253EAutomotive&p=0&so=null" target="_blank" rel="noreferrer">
                  Automotive
                </a>
              </div>
            </div>
            <div className="mt-[10px]">
              <h3>组织规模</h3>
              <div>
                <a className="c-hyperlink" href="https://customers.microsoft.com/en-us/search?sq=&ff=story_organization_size%2526%253ECorporate%2520%252810%252C000%252B%2520employees%2529&p=0&so=null" target="_blank" rel="noreferrer">
                  Corporate (10,000+ employees)
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="w-3/4">
          {/* 企业背景 */}
          <div className="executive-summary">
            <p>
              广州太古汇是太古地产位于广州的大型综合发展项目，由太古地产开发建设并运营管理。项目位于广州市天河中央商务区核心地段，总楼面面积约35.8万平方米（不含文化中心），由一个大型购物商场、两座甲级办公楼、一个文化中心、广州首家文华东方酒店及酒店式服务住宅构成。该项目由世界知名的建筑公司Arquitectonica设计，并由太古地产管理。传承集团多年国际化专业经验，太古地产悉心打造下的广州太古汇将成为集休闲娱乐、商贸活动、文化艺术于一体的综合商业体。{' '}
            </p>
          </div>
          {/* 业务痛点 */}
          <div className="body-text-2 c-paragraph-3">
            <div>
              <h3 className="pt-2 pb-6 !font-100 text-[34px]">业务痛点</h3>
              <p>
                “可持续发展”理念已经成为全球的共识，太古地产也一直位于趋势的前言，作为“碳中和”建筑的首批积极实践者。在经营管理中，太古地产一直将可持续发展作为核心理念，积极探索新技术在地产运营中的作用，通过将新型节能技术与可再生能源的整合，实现“碳中和”的目标。为此太古地产专门设立了技术统筹及可持续发展部，希望通过引入各种数字智慧管理方案，努力在2050年之前实现全面碳中和。
              </p>
            </div>
          </div>
          <img alt="Story" className="mb-[64px] pointer-events-none" src="https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1666219359761438754-taikoohui-other-unsegmented-azure-zh-china/resources/9b6d5e6b-334f-4d42-9646-f20a311e1d2a/1666225694096876558_1666225694096876558" />
          <div className="body-text-2 c-paragraph-3">
            <p>
              广州太古汇作为太古地产位于广州的大型综合发展项目，也是太古地产实践“碳中和”与“可持续发展”理念的重要项目之一。广州太古汇从设计初期就遵循国际标准与绿色建筑的标准，并取得LEED标准铂金级认证以及国家绿建认证。在持续的运营过程中，广州太古汇也希望进一步的优化建筑能耗与运营效率，更快速的收集、汇总、呈现报告建筑数据，将安防、照明灯系统无缝集成，加快故障排除、缩短任务时间。实现建筑数字管理的改造提升是一项持续的任务，通过数字化方式整合繁杂的能源计量设备、空调、照明，报警系统并提供预测性的维护建议，对广州太古汇的数据管理和IT基础设施提出了新的需求。{' '}
            </p>
          </div>
          <img alt="Story" className="mb-[64px] pointer-events-none" src="https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1666219359761438754-taikoohui-other-unsegmented-azure-zh-china/resources/1c7c42a1-f2dc-4a9c-a509-2c6977204538/1666225651403508552_1666225651403508552" />
          {/* 解决方案 */}
          <div className="body-text-2 c-paragraph-3">
            <div>
              <p>不仅如此，在建筑数字智慧管理改造提升的过程中，广州太古汇也希望进一步关注租户的需求，更好的帮助租户提升办公和地产空间使用的舒适性与便利性，提升空间利用率。</p>
              <h3 className="pt-2 pb-6 !font-100 text-[34px]">解决方案</h3>
              <p>
                为了协助广州太古汇实现智慧建筑数字化转型与“碳中和”的目标，江森自控利用微软的多项Azure服务，包括Azure Active Directory、Azure Data Lake、Access Control和Time Series Insights等为广州太古汇提供了OpenBlue整体解决方案，以构建能源设备管理体系与云边结合的智慧型互联平台。将微软Azure
                IoT、数字孪生与人工智能和Power BI的优势结合在一起，提供深远绿色可持续性影响、坚实的安全防范保障以及全新的用户空间体验。太古汇通过微软Azure的数字孪生技术，对广州太古汇中央空调机房进行了建模和实时监控，通过Azure技术构建了企业级能效诊断的云平台，将整个建筑运营过程中的方方面面尽收眼底。
              </p>
            </div>
          </div>
          <img alt="Story" className="mb-[64px] pointer-events-none" src="https://ms-f7-sites-prod-cdn.akamaized.net/docs/stories/1666219359761438754-taikoohui-other-unsegmented-azure-zh-china/resources/e884dedf-f8af-4755-bed0-c294c19edc4f/1666225639115711870_1666225639115711870" />
          {/* 优势及收益 */}
          <div className="body-text-2 c-paragraph-3">
            <div>
              <h3 className="pt-2 pb-6 !font-100 text-[34px]">优势及收益</h3>
              <p>在应用江森自控部署在Microsoft Azure智能云上的OpenBlue数字化解决方案之后，广州太古汇在近期一项室内公共设施改造项目中获得了广州碳排放权交易中心颁发的碳中和认证，在可持续发展的道路上也取得了丰富的成效：</p>
            </div>
          </div>
        </div>
      </div>
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
