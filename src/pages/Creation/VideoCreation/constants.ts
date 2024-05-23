export function getFontName(fontName: string) {
  // 这里需要你自己实现字体名称到中文名称的映射
  switch (fontName) {
    case 'MicrosoftYaHeiBold.ttc':
      return '微软雅黑粗体'
    case 'MicrosoftYaHeiNormal.ttc':
      return '微软雅黑'
    case 'STHeitiLight.ttc':
      return '黑体-简-细体'
    case 'STHeitiMedium.ttc':
      return '黑体-简-中等'
    case 'UTM Kabel KT.ttf':
      return 'UTM Kabel KT'
    default:
      return fontName
  }
}
//  randomTheme
export const randomTheme = ['环保生活小贴士：回收、节能灯泡、无塑料、节水', '个人理财：预算、储蓄、投资、信用卡管理 ', '智能家居：语音助手、自动化、安全监控、节能', '居家健身指南：瑜伽、HIIT、拉伸、力量训练', '心理健康：冥想、日记、阅读、深呼吸']
// randomCopywriting
export const randomCopywriting = [
  `生命，这个宇宙中最神奇的奇迹，它的意义究竟是什么？
或许，生命的意义，在于那些温暖人心的瞬间，连接彼此的纽带，传递爱与希望。
它也许在于，为这个世界留下我们的痕迹，无论是一棵树，一篇文章，还是一个微笑。
生命的意义，在于探索、连接、贡献。最终，它在于我们如何定义它。在这短暂而宝贵的旅程中，让我们用爱和勇气，书写自己的故事。`,
  `在这个快节奏的生活里，我们常常忘了停下脚步，寻找那些让心灵微笑的瞬间。
从今天开始，给自己的生活增添一抹色彩。尝试一项新的爱好，无论是画画、烹饪，还是学习一门新乐器。
找回与家人朋友共度的欢乐时光。在自然中放松身心，让爱和笑声充满你的每一天。
偶尔，给自己一点独处的时间。在星空下散步，或是静静地阅读一本书，找到属于自己的平静。
生活的乐趣无处不在，只要你愿意去发现。今天，就从一个小小的改变开始，让我们的生活更加丰富多彩。`,
  `在这个充满挑战的时代，保持心理健康变得比以往任何时候都重要。
冥想，是连接内心深处的桥梁，它帮助我们减少焦虑，增强自我意识，让心灵得到真正的安宁。
通过写日记，我们能够更好地理解自己的情绪与想法，这是一种释放内心压力、提升自我认知的有效方法。
阅读，不仅可以开阔我们的视野，还能带我们进入另一个世界，暂时忘却现实的烦恼，享受心灵的宁静。
深呼吸，一个简单而强大的工具。它能迅速缓解紧张情绪，让我们的心灵回归平和。
冥想、日记、阅读、深呼吸，这些简单的实践能极大地提升我们的心理健康。让我们从今天开始，为心灵种下幸福与平和的种子。`,
  `在这个快速变化的世界中，理解个人理财的重要性，对我们每个人来说都至关重要。
预算，是个人理财的基石。它帮助我们控制开支，确保我们的收入能满足我们的需求和目标。
储蓄，是为未来的不确定性建立安全网。无论是应急基金还是长期目标，储蓄都是实现财务自由的关键步骤。
投资，让我们的钱为我们工作。通过明智的投资选择，我们可以让我们的资产随着时间增长。
信用卡管理，是维护良好信用记录和避免高利债务的关键。合理使用信用卡可以帮我们建立信用，享受更多财务自由。
通过有效的预算、储蓄、投资和信用卡管理，我们不仅能应对今天的挑战，还能为未来打下坚实的基础。让我们从现在开始，走向财务自由之路。`
]

let d = {
  total_count: 2,
  items: [
    {
      cover_url: 'https://cdn.aoscdn.com/local/reccloud.cn/img/video/audio-file-bg.svg',
      state: 4,
      progress: 75,
      title: '在这个快节奏的生活里，我们常常',
      uniqid: '',
      duration: 0,
      size: 0,
      created_at: 1715865395,
      task_id: 'af96072c-0f31-40ff-9ef9-e3d9d193cd93',
      open_url: '',
      vod_url: ''
    },
    {
      cover_url: 'https://reccloudsz.aoscdn.com/e04/e04abfe0-b537-41fc-b330-e377abc7e369.jpg?auth_key=1715869194-885014-516978-9e858ea78df199ce97a5b7d8b3efbf8d',
      state: 1,
      progress: 100,
      title: '在这个快速变化的世界中，理解个.mp4',
      uniqid: '5utruut',
      duration: 60000,
      size: 21464032,
      created_at: 1715863151,
      task_id: '6e0d57f2-83c0-4191-bfd5-fb7a5f372d22',
      open_url: 'https://reccloud.cn/u/5utruut',
      vod_url: 'https://reccloudsz.aoscdn.com/a57/a575e2e7-4ab6-46d6-a1b1-04c90d2faf01.mp4?auth_key=1715869194-027601-331605-7a43e10e0ae40216d5262cfe3ac7ddbc&xfilename=在这个快速变化的世界中，理解个.mp4.mp4'
    }
  ]
}
