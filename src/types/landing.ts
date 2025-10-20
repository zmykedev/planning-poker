import type { ReactNode } from 'react';

export interface MenuItem {
  key: string;
  label: string;
  icon: ReactNode;
}

export interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface ButtonConfig {
  text: string;
  action: 'login' | 'register' | 'scroll';
  target?: string;
}

export interface HeroContent {
  title: string;
  titleHighlight: string;
  description: string;
  primaryButton: ButtonConfig;
  secondaryButton: ButtonConfig;
}

export interface CTAContent {
  title: string;
  description: string;
  primaryButton: ButtonConfig;
  secondaryButton: ButtonConfig;
}

export interface FooterLink {
  text: string;
  action: 'privacy' | 'terms' | 'support' | 'scroll';
  target?: string;
}

export interface FooterContent {
  description: string;
  links: FooterLink[];
}

export interface LandingData {
  menuItems: MenuItem[];
  features: Feature[];
  heroContent: HeroContent;
  ctaContent: CTAContent;
  footerContent: FooterContent;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    dark: string;
    medium: string;
    light: string;
  };
  text: {
    white: string;
    light: string;
    medium: string;
  };
}
