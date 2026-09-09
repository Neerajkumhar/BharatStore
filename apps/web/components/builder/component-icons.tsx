'use client';

import React from 'react';
import {
  Search, Layers, Megaphone, Image, Star, Grid3x3, Info, ShieldCheck,
  MessageSquare, HelpCircle, Phone, LayoutTemplate, Sliders, Sparkles,
  PackageCheck, Zap, Ticket, Truck, Repeat, Camera, Heart, Award, Clock,
  Mail, PanelTop, Menu, Smartphone, Columns, Maximize, Type, Ruler,
  HeartHandshake, Sofa, Leaf,
} from 'lucide-react';

export const STORE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Layers,
  Megaphone,
  Image,
  Star,
  Grid3x3,
  Info,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Phone,
  LayoutTemplate,
  Sliders,
  Sparkles,
  PackageCheck,
  Zap,
  Ticket,
  Truck,
  Repeat,
  Camera,
  Heart,
  Award,
  Clock,
  Mail,
  PanelTop,
  Menu,
  Smartphone,
  Columns,
  Maximize,
  Type,
  Ruler,
  HeartHandshake,
  Sofa,
  Leaf,
};

export function getStoreSectionIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  return (iconName ? STORE_ICON_MAP[iconName] : undefined) || Layers;
}