import StoryIcon from '@/assets/image/story-icon.png'
import DrawIcon from '@/assets/image/draw-icon.jpg'
import FlySheep from '@/assets/image/flysheep.png'

export interface Bookmark {
  title: string
  href: string
  icon: string
  desc?: string
}

export const BookList: Bookmark[] = [
  {
    title: '百度',
    href: 'http://www.baidu.com',
    icon: 'https://www.baidu.com/favicon.ico',
  },
  {
    title: '有道翻译',
    href: 'https://fanyi.youdao.com/#/TextTranslate',
    icon: 'https://shared-https.ydstatic.com/images/favicon.ico',
  },
  {
    title: '我的小说',
    href: 'story',
    icon: StoryIcon,
  },
  {
    title: '你画我猜',
    href: 'draw',
    icon: DrawIcon,
  },
  {
    title: '拼图',
    href: 'puzzle',
    icon: DrawIcon,
  },
  {
    title: '股票',
    href: 'stock',
    icon: 'https://cdn-icons-png.flaticon.com/128/2722/2722712.png',
  },
  {
    title: '游戏避难所',
    href: 'https://www.flysheep6.com',
    icon: FlySheep,
    desc: 'https://sway.cloud.microsoft/ruijH7BYH9RwA9HG?ref=Link',
  },
]
