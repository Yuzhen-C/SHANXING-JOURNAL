export type PhotoCredit = {
  file: string;
  credit: string;
  source: string;
  license: string;
  licenseUrl: string;
  alt: string;
  position?: string;
};

export const photoCredits: Record<string, PhotoCredit> = {
  "cover": {
    "file": "photos/cover.webp",
    "credit": "rheins",
    "source": "https://commons.wikimedia.org/wiki/File:%E6%B3%B0%E5%B1%B1%E6%97%A5%E5%87%BA_-_Sunrise_at_Mount_Taishan_-_2012.07_-_panoramio.jpg",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "alt": "岱顶远望，日轮跃出远处山脊，松梢映在橙色晨光中",
    "position": "55% 55%"
  },
  "tianwaicun": {
    "file": "photos/tianwaicun.webp",
    "credit": "H2v5o68z",
    "source": "https://commons.wikimedia.org/wiki/File:Tianwaicun_3.jpg",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "alt": "天外村天地广场的石柱、台阶与背后的泰山山麓",
    "position": "50% 57%"
  },
  "zhongtianmen": {
    "file": "photos/zhongtianmen.webp",
    "credit": "xiquinhosilva",
    "source": "https://commons.wikimedia.org/wiki/File:50577-_Half_Way_Gate_to_Heaven,_Mount_Tai_%E6%B3%B0%E5%B1%B1%E4%B8%AD%E5%A4%A9%E9%97%A8%E7%B4%A2%E9%81%93%E7%AB%99.jpg",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "泰山中天门索道站旁的楼宇，背后是秋色中的山峰",
    "position": "56% 55%"
  },
  "nantianmen": {
    "file": "photos/nantianmen.webp",
    "credit": "xiquinhosilva",
    "source": "https://commons.wikimedia.org/wiki/File:50308-Taishan_(49055668371).jpg",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "南天门红色城楼，城门上方可见石刻匾额",
    "position": "48% 52%"
  },
  "tianjie": {
    "file": "photos/tianjie.webp",
    "credit": "xiquinhosilva",
    "source": "https://commons.wikimedia.org/wiki/File:50318-Taishan_(49055874982).jpg",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "天街石牌坊与拾级而上的游人",
    "position": "53% 50%"
  },
  "bixia": {
    "file": "photos/bixia.webp",
    "credit": "xiquinhosilva",
    "source": "https://commons.wikimedia.org/wiki/File:50411-%E7%A2%A7%E9%9C%9E%E7%A5%A0-%E6%B3%B0%E5%B1%B1.jpg",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "碧霞祠门前的彩绘斗拱、红灯笼和蓝底匾额",
    "position": "48% 54%"
  },
  "daguan": {
    "file": "photos/daguan.webp",
    "credit": "xiquinhosilva",
    "source": "https://commons.wikimedia.org/wiki/File:50446-%E5%94%90%E6%91%A9%E5%B4%96%E5%88%BB%E7%9F%B3-Mount_Tai.jpg",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "alt": "大观峰崖壁上的唐玄宗《纪泰山铭》金色题刻",
    "position": "48% 65%"
  },
  "yuhuang": {
    "file": "photos/yuhuang.webp",
    "credit": "H2v5o68z",
    "source": "https://commons.wikimedia.org/wiki/File:%E6%B3%B0%E5%B1%B1%E7%8E%89%E7%9A%87%E9%A1%B6.jpg",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "alt": "玉皇顶院内石栏围住极顶石，背后为灰瓦红墙的门楼",
    "position": "50% 60%"
  }
};
