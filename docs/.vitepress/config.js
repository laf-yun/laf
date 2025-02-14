module.exports = {
  lang: 'zh-CN',
  title: 'laf.js 云开发文档',
  description: 'laf.js 云开发开发者使用文档',

  themeConfig: {
    repo: 'lafjs/laf',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    lastUpdated: '更新于',

    nav: [
      { text: '主页', link: '/' },
      { text: '开发指南', link: '/guide/', activeMatch: '^/guide/' },
      { text: '预览图', link: '/screenshots', },
      { text: '在线 Demo', link: '/todo-list', },
      { text: 'lafyun.com', link: 'https://www.lafyun.com/'},
      {
        text: '更新记录',
        link: 'https://github.com/lafjs/laf/blob/main/CHANGELOG.md'
      }
    ],

    sidebar: {
      '/guide/': getGuideSidebar()
    }
  }
}

function getGuideSidebar() {
  return [
    {
      text: 'laf.js 介绍',
      link: '/guide/',
      children: [
        // { text: '简介', link: '/guide/' },
        // { text: '技术架构', link: '/guide/technology' },
        // { text: '部署服务', link: '/guide/deploy' }
      ]
    },
    {
      text: '云数据库',
      children: [
        { text: '云数据库简介', link: '/guide/db/' },
        { text: '数据操作 API', link: '/guide/db/api' },
        { text: '访问策略', link: '/guide/db/policy' },
      ]
    },
    {
      text: '云函数',
      children: [
        { text: '云函数简介', link: '/guide/function/' },
        { text: '云函数 Cloud SDK', link: '/guide/function/cloud-sdk' },
        { text: '使用 Node.js 包', link: '/guide/function/import-npm' },
        {
          text: '触发器',
          link: '/guide/function/trigger',
        },
        {
          text: 'WebSocket 连接',
          link: '/guide/function/websocket',
        },
      ]
    },
    {
      text: '云存储',
      children: [
        { text: '使用说明', link: '/guide/storage/' },
        { text: '文件令牌', link: '/guide/storage/token' },
      ]
    },
  ]
}