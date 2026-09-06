import type { TemplateCategory } from './storefront-templates';

export interface DemoImagePool {
  hero: string[];
  categories: string[];
  products: string[];
  banner: string[];
  about: string[];
}

function img(id: string, width: number): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const STOREFRONT_DEMO_IMAGE_POOLS: Record<TemplateCategory, DemoImagePool> = {
  general: {
    hero: [
      img('photo-1555529669-e69e7aa0ba9a', 1600),   // minimal
      img('photo-1604719312566-8912e9227c6a', 1600),   // general
      img('photo-1488459716781-31db52582fe9', 1600),   // bharat-business
    ],
    categories: [
      img('photo-1580915411954-282cb1b0d780', 480),
      img('photo-1493809842364-78817add7ffb', 480),
      img('photo-1512496015851-a90fb38ba796', 480),
      img('photo-1511707171634-5f897ff02aa9', 480),
      img('photo-1506744038136-46273834b3fb', 480),
      img('photo-1553406830-ef2513450d76', 480),
    ],
    products: [
      img('photo-1544816155-12df9643f363', 400),
      img('photo-1526170375885-4d8ecf77b99f', 400),
      img('photo-1441986300917-64674bd600d8', 400),
      img('photo-1495474472287-4d71bcdd2085', 400),
      img('photo-1583394838336-acd977736f90', 400),
      img('photo-1503602642458-232111445657', 400),
      img('photo-1523206489230-c012c64b2b48', 400),
      img('photo-1560343090-f0409e92791a', 400),
    ],
    banner: [
      img('photo-1607082348824-0a96f2a4b9da', 1200),
      img('photo-1472851294608-062f824d29cc', 1200),
    ],
    about: [img('photo-1555529669-e69e7aa0ba9a', 800)],
  },
  fashion: {
    hero: [
      img('photo-1490481651871-ab68de25d43d', 1600),   // fashion
      img('photo-1549298916-b41d501d3772', 1600),   // streetwear
      img('photo-1515372039744-b8f02a3ae446', 1600),   // boutique (gold elegance)
      img('photo-1521572163474-6864f9cf17ab', 1600),   // luxury (muted basics)
    ],
    categories: [
      img('photo-1483985988355-763728e1935b', 480),
      img('photo-1445205170230-053b83016050', 480),
      img('photo-1469334031218-e382a71b716b', 480),
      img('photo-1509631179647-0177331693ae', 480),
      img('photo-1515886657613-9f3515b0c78f', 480),
      img('photo-1539109136881-3be0616acf4b', 480),
    ],
    products: [
      img('photo-1496747611176-843222e1e57c', 400),
      img('photo-1524504388940-b1c1722653e1', 400),
      img('photo-1529139574466-a303027c1d8b', 400),
      img('photo-1566174053879-31528523f8ae', 400),
      img('photo-1506152983158-b4a74a01c721', 400),
      img('photo-1521510895919-46920266ddb3', 400),
      img('photo-1495385794356-15371f348c31', 400),
      img('photo-1560243563-062bfc001d68', 400),
    ],
    banner: [
      img('photo-1445205170230-053b83016050', 1200),
      img('photo-1529139574466-a303027c1d8b', 1200),
    ],
    about: [img('photo-1521510895919-46920266ddb3', 800)],
  },
  electronics: {
    hero: [
      img('photo-1511707171634-5f897ff02aa9', 1600),   // electronics
      img('photo-1498049794561-7780e7231661', 1600),   // electronics-marketplace
      img('photo-1484704849700-f032a568e944', 1600),   // gadgets
    ],
    categories: [
      img('photo-1598327105666-5b89351aff97', 480),
      img('photo-1611186871348-b1ce696e52c9', 480),
      img('photo-1546435770-a3e426bf472b', 480),
      img('photo-1550745165-9bc0b252726f', 480),
      img('photo-1527814050087-3793815479db', 480),
      img('photo-1502920917128-1aa500764cbd', 480),
    ],
    products: [
      img('photo-1592750475338-74b7b21085ab', 400),
      img('photo-1526738549149-8e07eca6c147', 400),
      img('photo-1505740420928-5e560c06d30e', 400),
      img('photo-1517336714731-489689fd1ca8', 400),
      img('photo-1588872657578-7efd1f1555ed', 400),
      img('photo-1593642632823-8f785ba67e45', 400),
      img('photo-1523275335684-37898b6baf30', 400),
      img('photo-1585790050230-5dd28404ccb9', 400),
    ],
    banner: [
      img('photo-1550745165-9bc0b252726f', 1200),
      img('photo-1498049794561-7780e7231661', 1200),
    ],
    about: [img('photo-1496181133206-80ce9b88a853', 800)],
  },
  grocery: {
    hero: [
      img('photo-1542838132-92c53300491e', 1600),   // grocery
      img('photo-1550989460-0adf9ea622e2', 1600),   // supermarket
      img('photo-1586083702768-190ae093d34d', 1600),   // organic
    ],
    categories: [
      img('photo-1518843875459-f738682238a6', 480),
      img('photo-1586201375761-83865001e31c', 480),
      img('photo-1568702846914-96b305d2aaeb', 480),
      img('photo-1488459716781-31db52582fe9', 480),
      img('photo-1573246123716-6b1782bfc499', 480),
      img('photo-1590779033100-9f60a05a013d', 480),
    ],
    products: [
      img('photo-1586201375761-83865001e31c', 400),
      img('photo-1615485290382-441e4d049cb5', 400),
      img('photo-1532336414038-cf19250c5757', 400),
      img('photo-1519996529931-28324d5a630e', 400),
      img('photo-1556228578-8c89e6adf883', 400),
      img('photo-1495474472287-4d71bcdd2085', 400),
      img('photo-1540420773420-3366772f4999', 400),
      img('photo-1530062845289-9109b2c9c868', 400),
    ],
    banner: [
      img('photo-1573246123716-6b1782bfc499', 1200),
      img('photo-1542838132-92c53300491e', 1200),
    ],
    about: [img('photo-1506744038136-46273834b3fb', 800)],
  },
  beauty: {
    hero: [
      img('photo-1612817288484-6f916006741a', 1600),   // beauty
      img('photo-1543087903-1ac2ec7aa8c5', 1600),   // skincare
      img('photo-1583337130417-3346a1be7dee', 1600),   // salon
    ],
    categories: [
      img('photo-1598440947619-2c35fc9aa908', 480),
      img('photo-1556228578-8c89e6adf883', 480),
      img('photo-1512496015851-a90fb38ba796', 480),
      img('photo-1541643600914-78b084683601', 480),
      img('photo-1588405748880-12d1d2a59f75', 480),
      img('photo-1571875257727-256c39da42af', 480),
    ],
    products: [
      img('photo-1596462502278-27bfdc403348', 400),
      img('photo-1571781926291-c477ebfd024b', 400),
      img('photo-1512496015851-a90fb38ba796', 400),
      img('photo-1556228578-8c89e6adf883', 400),
      img('photo-1598440947619-2c35fc9aa908', 400),
      img('photo-1541643600914-78b084683601', 400),
      img('photo-1570172619644-dfd03ed5d881', 400),
      img('photo-1585232004423-244e0e6904e3', 400),
    ],
    banner: [
      img('photo-1596462502278-27bfdc403348', 1200),
      img('photo-1522335789203-aabd1fc54bc9', 1200),
    ],
    about: [img('photo-1522335789203-aabd1fc54bc9', 800)],
  },
  food: {
    hero: [
      img('photo-1504674900247-0877df9cc836', 1600),   // restaurant
      img('photo-1509440159596-0249088772ff', 1600),   // bakery
      img('photo-1517433670267-08bbd4be890f', 1600),   // cafe
    ],
    categories: [
      img('photo-1555507036-ab1f4038808a', 480),
      img('photo-1504674900247-0877df9cc836', 480),
      img('photo-1565299624946-b28f40a0ae38', 480),
      img('photo-1540189549336-e6e99c3679fe', 480),
      img('photo-1498837167922-ddd27525d352', 480),
      img('photo-1482049016688-2d3e1b311543', 480),
    ],
    products: [
      img('photo-1546039907-7fa05f864c02', 400),
      img('photo-1563379926898-05f4575a45d8', 400),
      img('photo-1565557623262-b51c2513a641', 400),
      img('photo-1578985545062-69928b1d9587', 400),
      img('photo-1509042239860-f550ce710b93', 400),
      img('photo-1551024506-0bccd828d307', 400),
      img('photo-1509440159596-0249088772ff', 400),
      img('photo-1414235077428-338989a2e8c0', 400),
    ],
    banner: [
      img('photo-1552566626-52f8b828add9', 1200),
      img('photo-1559339352-11d035aa65de', 1200),
    ],
    about: [img('photo-1414235077428-338989a2e8c0', 800)],
  },
  home: {
    hero: [
      img('photo-1600210492486-724fe5c67fb0', 1600),   // home-living
      img('photo-1513694203232-719a280e022f', 1600),   // furniture
      img('photo-1616486029423-aaa4789e8c9a', 1600),   // lifestyle
    ],
    categories: [
      img('photo-1505693416388-ac5ce068fe85', 480),
      img('photo-1522708323590-d24dbb6b0267', 480),
      img('photo-1555041469-a586c61ea9bc', 480),
      img('photo-1493809842364-78817add7ffb', 480),
      img('photo-1567538096630-e0c55bd6374c', 480),
      img('photo-1519710164239-da123dc03ef4', 480),
    ],
    products: [
      img('photo-1586023492125-27b2c045efd7', 400),
      img('photo-1554995207-c18c203602cb', 400),
      img('photo-1616486338812-3dadae4b4ace', 400),
      img('photo-1583847268964-b28dc8f51f92', 400),
      img('photo-1507473885765-e6ed057f782c', 400),
      img('photo-1524758631624-e2822e304c36', 400),
      img('photo-1567016432779-094069958ea5', 400),
      img('photo-1594026112284-02bb6f3352fe', 400),
    ],
    banner: [
      img('photo-1616486338812-3dadae4b4ace', 1200),
      img('photo-1524758631624-e2822e304c36', 1200),
    ],
    about: [img('photo-1493663284031-b7e3aefcae8e', 800)],
  },
};

// 22 dedicated hero images, one per template. Each is disjoint from its category's
// categories/products/banner/about pools so no duplicate appears inside one card.
export const STOREFRONT_TEMPLATE_HEROES: Record<string, string> = {
  minimal:                STOREFRONT_DEMO_IMAGE_POOLS.general.hero[0],
  fashion:                STOREFRONT_DEMO_IMAGE_POOLS.fashion.hero[0],
  electronics:            STOREFRONT_DEMO_IMAGE_POOLS.electronics.hero[0],
  grocery:                STOREFRONT_DEMO_IMAGE_POOLS.grocery.hero[0],
  beauty:                 STOREFRONT_DEMO_IMAGE_POOLS.beauty.hero[0],
  general:                STOREFRONT_DEMO_IMAGE_POOLS.general.hero[1],
  streetwear:             STOREFRONT_DEMO_IMAGE_POOLS.fashion.hero[1],
  boutique:               STOREFRONT_DEMO_IMAGE_POOLS.fashion.hero[2],
  luxury:                 STOREFRONT_DEMO_IMAGE_POOLS.fashion.hero[3],
  'electronics-marketplace': STOREFRONT_DEMO_IMAGE_POOLS.electronics.hero[1],
  gadgets:                STOREFRONT_DEMO_IMAGE_POOLS.electronics.hero[2],
  supermarket:            STOREFRONT_DEMO_IMAGE_POOLS.grocery.hero[1],
  organic:                STOREFRONT_DEMO_IMAGE_POOLS.grocery.hero[2],
  skincare:               STOREFRONT_DEMO_IMAGE_POOLS.beauty.hero[1],
  salon:                  STOREFRONT_DEMO_IMAGE_POOLS.beauty.hero[2],
  restaurant:             STOREFRONT_DEMO_IMAGE_POOLS.food.hero[0],
  bakery:                 STOREFRONT_DEMO_IMAGE_POOLS.food.hero[1],
  cafe:                   STOREFRONT_DEMO_IMAGE_POOLS.food.hero[2],
  'home-living':          STOREFRONT_DEMO_IMAGE_POOLS.home.hero[0],
  furniture:              STOREFRONT_DEMO_IMAGE_POOLS.home.hero[1],
  lifestyle:              STOREFRONT_DEMO_IMAGE_POOLS.home.hero[2],
  'bharat-business':      STOREFRONT_DEMO_IMAGE_POOLS.general.hero[2],
};
