import React from 'react';
import { SECTION_TYPES, type SectionType } from '@bharatstore/shared/constants';

import { AnnouncementSection } from './sections/announcement-section';
import { StickyHeaderSection } from './sections/sticky-header-section';
import { MegaMenuSection } from './sections/mega-menu-section';
import { SearchOverlaySection } from './sections/search-overlay-section';

import { HeroSection } from './sections/hero-section';
import { HeroFullscreenSection } from './sections/hero-fullscreen-section';
import { HeroSplitSection } from './sections/hero-split-section';
import { HeroEditorialSection } from './sections/hero-editorial-section';
import { HeroProductSection } from './sections/hero-product-section';
import { HeroMinimalSection } from './sections/hero-minimal-section';

import { CategoriesSection } from './sections/categories-section';
import { CategoryCircularSection } from './sections/category-circular-section';
import { CategoryMegaSection } from './sections/category-mega-section';

import { FeaturedProductsSection } from './sections/featured-products-section';
import { ProductGridSection } from './sections/product-grid-section';
import { ProductCarouselSection } from './sections/product-carousel-section';
import { ProductRailSection } from './sections/product-rail-section';
import { ProductSpotlightSection } from './sections/product-spotlight-section';
import { ProductTrendingSection } from './sections/product-trending-section';
import { ProductTabsSection } from './sections/product-tabs-section';
import { ProductComparisonSection } from './sections/product-comparison-section';

import { BannerSection } from './sections/banner-section';
import { PromoSplitSection } from './sections/promo-split-section';
import { CountdownSaleSection } from './sections/countdown-sale-section';
import { FlashSaleSection } from './sections/flash-sale-section';
import { CouponStripSection } from './sections/coupon-strip-section';
import { FreeShippingBarSection } from './sections/free-shipping-bar-section';
import { OfferMarqueeSection } from './sections/offer-marquee-section';

import { AboutSection } from './sections/about-section';
import { EditorialSplitSection } from './sections/editorial-split-section';
import { EditorialFullwidthSection } from './sections/editorial-fullwidth-section';
import { LookbookSection } from './sections/lookbook-section';
import { AsymmetricGallerySection } from './sections/asymmetric-gallery-section';
import { BrandStorySection } from './sections/brand-story-section';
import { RoutineBuilderSection } from './sections/routine-builder-section';

import { TrustSection } from './sections/trust-section';
import { TestimonialsSection } from './sections/testimonials-section';
import { ReviewsSummarySection } from './sections/reviews-summary-section';
import { BrandLogosSection } from './sections/brand-logos-section';
import { FaqSection } from './sections/faq-section';

import { ContactSection } from './sections/contact-section';
import { DeliveryInfoSection } from './sections/delivery-info-section';
import { NewsletterSection } from './sections/newsletter-section';
import { FooterSection } from './sections/footer-section';

import { SizeGuideSection } from './sections/size-guide-section';
import { ShopByConcernSection } from './sections/shop-by-concern-section';
import { ShopByRoomSection } from './sections/shop-by-room-section';
import { IngredientHighlightsSection } from './sections/ingredient-highlights-section';

export const SECTION_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  [SECTION_TYPES.ANNOUNCEMENT]: AnnouncementSection,
  [SECTION_TYPES.STICKY_HEADER]: StickyHeaderSection,
  [SECTION_TYPES.MEGA_MENU]: MegaMenuSection,
  [SECTION_TYPES.SEARCH_OVERLAY]: SearchOverlaySection,

  [SECTION_TYPES.HERO]: HeroSection,
  [SECTION_TYPES.HERO_FULLSCREEN]: HeroFullscreenSection,
  [SECTION_TYPES.HERO_SPLIT]: HeroSplitSection,
  [SECTION_TYPES.HERO_EDITORIAL]: HeroEditorialSection,
  [SECTION_TYPES.HERO_PRODUCT]: HeroProductSection,
  [SECTION_TYPES.HERO_MINIMAL]: HeroMinimalSection,

  [SECTION_TYPES.CATEGORIES]: CategoriesSection,
  [SECTION_TYPES.CATEGORY_CIRCULAR]: CategoryCircularSection,
  [SECTION_TYPES.CATEGORY_MEGA]: CategoryMegaSection,

  [SECTION_TYPES.FEATURED_PRODUCTS]: FeaturedProductsSection,
  [SECTION_TYPES.PRODUCT_GRID]: ProductGridSection,
  [SECTION_TYPES.PRODUCT_CAROUSEL]: ProductCarouselSection,
  [SECTION_TYPES.PRODUCT_RAIL]: ProductRailSection,
  [SECTION_TYPES.PRODUCT_SPOTLIGHT]: ProductSpotlightSection,
  [SECTION_TYPES.PRODUCT_TRENDING]: ProductTrendingSection,
  [SECTION_TYPES.PRODUCT_TABS]: ProductTabsSection,
  [SECTION_TYPES.PRODUCT_COMPARISON]: ProductComparisonSection,

  [SECTION_TYPES.BANNER]: BannerSection,
  [SECTION_TYPES.PROMO_SPLIT]: PromoSplitSection,
  [SECTION_TYPES.COUNTDOWN_SALE]: CountdownSaleSection,
  [SECTION_TYPES.FLASH_SALE]: FlashSaleSection,
  [SECTION_TYPES.COUPON_STRIP]: CouponStripSection,
  [SECTION_TYPES.FREE_SHIPPING_BAR]: FreeShippingBarSection,
  [SECTION_TYPES.OFFER_MARQUEE]: OfferMarqueeSection,

  [SECTION_TYPES.ABOUT]: AboutSection,
  [SECTION_TYPES.EDITORIAL_SPLIT]: EditorialSplitSection,
  [SECTION_TYPES.EDITORIAL_FULLWIDTH]: EditorialFullwidthSection,
  [SECTION_TYPES.LOOKBOOK]: LookbookSection,
  [SECTION_TYPES.ASYMMETRIC_GALLERY]: AsymmetricGallerySection,
  [SECTION_TYPES.BRAND_STORY]: BrandStorySection,
  [SECTION_TYPES.ROUTINE_BUILDER]: RoutineBuilderSection,

  [SECTION_TYPES.TRUST]: TrustSection,
  [SECTION_TYPES.TESTIMONIALS]: TestimonialsSection,
  [SECTION_TYPES.REVIEWS_SUMMARY]: ReviewsSummarySection,
  [SECTION_TYPES.BRAND_LOGOS]: BrandLogosSection,
  [SECTION_TYPES.FAQ]: FaqSection,

  [SECTION_TYPES.CONTACT]: ContactSection,
  [SECTION_TYPES.DELIVERY_INFO]: DeliveryInfoSection,
  [SECTION_TYPES.NEWSLETTER]: NewsletterSection,
  [SECTION_TYPES.FOOTER]: FooterSection,

  [SECTION_TYPES.SIZE_GUIDE]: SizeGuideSection,
  [SECTION_TYPES.SHOP_BY_CONCERN]: ShopByConcernSection,
  [SECTION_TYPES.SHOP_BY_ROOM]: ShopByRoomSection,
  [SECTION_TYPES.INGREDIENT_HIGHLIGHTS]: IngredientHighlightsSection,
};

export function getSectionComponent(type: string): React.ComponentType<any> | null {
  return SECTION_COMPONENT_MAP[type] ?? null;
}

export interface SectionRenderExtraProps {
  products?: unknown;
  categories?: unknown;
  theme?: { primaryColor?: string; accentColor?: string };
  storeData?: unknown;
}

export interface SectionRenderDigest {
  type: string;
  data?: Record<string, unknown>;
  theme?: { primaryColor?: string; accentColor?: string };
  storeData?: unknown;
}

const SECTIONS_NEEDING_THEME = new Set<string>([
  SECTION_TYPES.HERO,
  SECTION_TYPES.CATEGORIES,
  SECTION_TYPES.FEATURED_PRODUCTS,
  SECTION_TYPES.PRODUCT_GRID,
  SECTION_TYPES.ABOUT,
  SECTION_TYPES.TRUST,
  SECTION_TYPES.TESTIMONIALS,
  SECTION_TYPES.FAQ,
  SECTION_TYPES.CONTACT,
  SECTION_TYPES.FOOTER,
]);

const SECTIONS_NEEDING_STORE_DATA = new Set<string>([
  SECTION_TYPES.STICKY_HEADER,
  SECTION_TYPES.CONTACT,
  SECTION_TYPES.FOOTER,
]);

const SECTIONS_NEEDING_PRODUCTS = new Set<string>([
  SECTION_TYPES.FEATURED_PRODUCTS,
  SECTION_TYPES.PRODUCT_GRID,
  SECTION_TYPES.PRODUCT_CAROUSEL,
  SECTION_TYPES.PRODUCT_RAIL,
  SECTION_TYPES.PRODUCT_TRENDING,
  SECTION_TYPES.PRODUCT_TABS,
  SECTION_TYPES.FLASH_SALE,
]);

const SECTIONS_NEEDING_CATEGORIES = new Set<string>([
  SECTION_TYPES.CATEGORIES,
  SECTION_TYPES.CATEGORY_CIRCULAR,
  SECTION_TYPES.CATEGORY_MEGA,
]);

export function getSectionExtraProps(digest: SectionRenderDigest): SectionRenderExtraProps {
  const extra: SectionRenderExtraProps = {};
  if (SECTIONS_NEEDING_THEME.has(digest.type)) extra.theme = digest.theme;
  if (SECTIONS_NEEDING_STORE_DATA.has(digest.type)) extra.storeData = digest.storeData;
  if (SECTIONS_NEEDING_PRODUCTS.has(digest.type)) extra.products = digest.data?.products;
  if (SECTIONS_NEEDING_CATEGORIES.has(digest.type)) extra.categories = digest.data?.categories;
  return extra;
}