'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SECTION_TYPES } from '@bharatstore/shared/constants';

/**
 * Build per-type dynamic loaders. Each dynamic() call uses a literal import
 * expression so webpack can statically analyze and split every section chunk.
 */
export const SECTION_PREVIEW_LOADERS: Record<string, React.ComponentType<any>> = {
  [SECTION_TYPES.ANNOUNCEMENT]: dynamic(() => import('./sections/announcement-section').then((m) => ({ default: m.AnnouncementSection })), { ssr: false }),
  [SECTION_TYPES.STICKY_HEADER]: dynamic(() => import('./sections/sticky-header-section').then((m) => ({ default: m.StickyHeaderSection })), { ssr: false }),
  [SECTION_TYPES.MEGA_MENU]: dynamic(() => import('./sections/mega-menu-section').then((m) => ({ default: m.MegaMenuSection })), { ssr: false }),
  [SECTION_TYPES.SEARCH_OVERLAY]: dynamic(() => import('./sections/search-overlay-section').then((m) => ({ default: m.SearchOverlaySection })), { ssr: false }),

  [SECTION_TYPES.HERO]: dynamic(() => import('./sections/hero-section').then((m) => ({ default: m.HeroSection })), { ssr: false }),
  [SECTION_TYPES.HERO_FULLSCREEN]: dynamic(() => import('./sections/hero-fullscreen-section').then((m) => ({ default: m.HeroFullscreenSection })), { ssr: false }),
  [SECTION_TYPES.HERO_SPLIT]: dynamic(() => import('./sections/hero-split-section').then((m) => ({ default: m.HeroSplitSection })), { ssr: false }),
  [SECTION_TYPES.HERO_EDITORIAL]: dynamic(() => import('./sections/hero-editorial-section').then((m) => ({ default: m.HeroEditorialSection })), { ssr: false }),
  [SECTION_TYPES.HERO_PRODUCT]: dynamic(() => import('./sections/hero-product-section').then((m) => ({ default: m.HeroProductSection })), { ssr: false }),
  [SECTION_TYPES.HERO_MINIMAL]: dynamic(() => import('./sections/hero-minimal-section').then((m) => ({ default: m.HeroMinimalSection })), { ssr: false }),

  [SECTION_TYPES.CATEGORIES]: dynamic(() => import('./sections/categories-section').then((m) => ({ default: m.CategoriesSection })), { ssr: false }),
  [SECTION_TYPES.CATEGORY_CIRCULAR]: dynamic(() => import('./sections/category-circular-section').then((m) => ({ default: m.CategoryCircularSection })), { ssr: false }),
  [SECTION_TYPES.CATEGORY_MEGA]: dynamic(() => import('./sections/category-mega-section').then((m) => ({ default: m.CategoryMegaSection })), { ssr: false }),

  [SECTION_TYPES.FEATURED_PRODUCTS]: dynamic(() => import('./sections/featured-products-section').then((m) => ({ default: m.FeaturedProductsSection })), { ssr: false }),
  [SECTION_TYPES.PRODUCT_GRID]: dynamic(() => import('./sections/product-grid-section').then((m) => ({ default: m.ProductGridSection })), { ssr: false }),
  [SECTION_TYPES.PRODUCT_CAROUSEL]: dynamic(() => import('./sections/product-carousel-section').then((m) => ({ default: m.ProductCarouselSection })), { ssr: false }),
  [SECTION_TYPES.PRODUCT_RAIL]: dynamic(() => import('./sections/product-rail-section').then((m) => ({ default: m.ProductRailSection })), { ssr: false }),
  [SECTION_TYPES.PRODUCT_SPOTLIGHT]: dynamic(() => import('./sections/product-spotlight-section').then((m) => ({ default: m.ProductSpotlightSection })), { ssr: false }),
  [SECTION_TYPES.PRODUCT_TRENDING]: dynamic(() => import('./sections/product-trending-section').then((m) => ({ default: m.ProductTrendingSection })), { ssr: false }),
  [SECTION_TYPES.PRODUCT_TABS]: dynamic(() => import('./sections/product-tabs-section').then((m) => ({ default: m.ProductTabsSection })), { ssr: false }),
  [SECTION_TYPES.PRODUCT_COMPARISON]: dynamic(() => import('./sections/product-comparison-section').then((m) => ({ default: m.ProductComparisonSection })), { ssr: false }),

  [SECTION_TYPES.BANNER]: dynamic(() => import('./sections/banner-section').then((m) => ({ default: m.BannerSection })), { ssr: false }),
  [SECTION_TYPES.PROMO_SPLIT]: dynamic(() => import('./sections/promo-split-section').then((m) => ({ default: m.PromoSplitSection })), { ssr: false }),
  [SECTION_TYPES.COUNTDOWN_SALE]: dynamic(() => import('./sections/countdown-sale-section').then((m) => ({ default: m.CountdownSaleSection })), { ssr: false }),
  [SECTION_TYPES.FLASH_SALE]: dynamic(() => import('./sections/flash-sale-section').then((m) => ({ default: m.FlashSaleSection })), { ssr: false }),
  [SECTION_TYPES.COUPON_STRIP]: dynamic(() => import('./sections/coupon-strip-section').then((m) => ({ default: m.CouponStripSection })), { ssr: false }),
  [SECTION_TYPES.FREE_SHIPPING_BAR]: dynamic(() => import('./sections/free-shipping-bar-section').then((m) => ({ default: m.FreeShippingBarSection })), { ssr: false }),
  [SECTION_TYPES.OFFER_MARQUEE]: dynamic(() => import('./sections/offer-marquee-section').then((m) => ({ default: m.OfferMarqueeSection })), { ssr: false }),

  [SECTION_TYPES.ABOUT]: dynamic(() => import('./sections/about-section').then((m) => ({ default: m.AboutSection })), { ssr: false }),
  [SECTION_TYPES.EDITORIAL_SPLIT]: dynamic(() => import('./sections/editorial-split-section').then((m) => ({ default: m.EditorialSplitSection })), { ssr: false }),
  [SECTION_TYPES.EDITORIAL_FULLWIDTH]: dynamic(() => import('./sections/editorial-fullwidth-section').then((m) => ({ default: m.EditorialFullwidthSection })), { ssr: false }),
  [SECTION_TYPES.LOOKBOOK]: dynamic(() => import('./sections/lookbook-section').then((m) => ({ default: m.LookbookSection })), { ssr: false }),
  [SECTION_TYPES.ASYMMETRIC_GALLERY]: dynamic(() => import('./sections/asymmetric-gallery-section').then((m) => ({ default: m.AsymmetricGallerySection })), { ssr: false }),
  [SECTION_TYPES.BRAND_STORY]: dynamic(() => import('./sections/brand-story-section').then((m) => ({ default: m.BrandStorySection })), { ssr: false }),
  [SECTION_TYPES.ROUTINE_BUILDER]: dynamic(() => import('./sections/routine-builder-section').then((m) => ({ default: m.RoutineBuilderSection })), { ssr: false }),

  [SECTION_TYPES.TRUST]: dynamic(() => import('./sections/trust-section').then((m) => ({ default: m.TrustSection })), { ssr: false }),
  [SECTION_TYPES.TESTIMONIALS]: dynamic(() => import('./sections/testimonials-section').then((m) => ({ default: m.TestimonialsSection })), { ssr: false }),
  [SECTION_TYPES.REVIEWS_SUMMARY]: dynamic(() => import('./sections/reviews-summary-section').then((m) => ({ default: m.ReviewsSummarySection })), { ssr: false }),
  [SECTION_TYPES.BRAND_LOGOS]: dynamic(() => import('./sections/brand-logos-section').then((m) => ({ default: m.BrandLogosSection })), { ssr: false }),
  [SECTION_TYPES.FAQ]: dynamic(() => import('./sections/faq-section').then((m) => ({ default: m.FaqSection })), { ssr: false }),

  [SECTION_TYPES.CONTACT]: dynamic(() => import('./sections/contact-section').then((m) => ({ default: m.ContactSection })), { ssr: false }),
  [SECTION_TYPES.DELIVERY_INFO]: dynamic(() => import('./sections/delivery-info-section').then((m) => ({ default: m.DeliveryInfoSection })), { ssr: false }),
  [SECTION_TYPES.NEWSLETTER]: dynamic(() => import('./sections/newsletter-section').then((m) => ({ default: m.NewsletterSection })), { ssr: false }),
  [SECTION_TYPES.FOOTER]: dynamic(() => import('./sections/footer-section').then((m) => ({ default: m.FooterSection })), { ssr: false }),

  [SECTION_TYPES.SIZE_GUIDE]: dynamic(() => import('./sections/size-guide-section').then((m) => ({ default: m.SizeGuideSection })), { ssr: false }),
  [SECTION_TYPES.SHOP_BY_CONCERN]: dynamic(() => import('./sections/shop-by-concern-section').then((m) => ({ default: m.ShopByConcernSection })), { ssr: false }),
  [SECTION_TYPES.SHOP_BY_ROOM]: dynamic(() => import('./sections/shop-by-room-section').then((m) => ({ default: m.ShopByRoomSection })), { ssr: false }),
  [SECTION_TYPES.INGREDIENT_HIGHLIGHTS]: dynamic(() => import('./sections/ingredient-highlights-section').then((m) => ({ default: m.IngredientHighlightsSection })), { ssr: false }),
};

export function getPreviewLoader(type: string): React.ComponentType<any> | null {
  return SECTION_PREVIEW_LOADERS[type] ?? null;
}