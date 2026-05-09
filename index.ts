// ============================================================
// BARTERLY TYPES
// Core data structures used across the entire app
// ============================================================

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  streetAddress: string;
  unitNumber?: string;
  city: string;
  state: string;
  zipCode: string;
  formattedAddress: string;
  offeredSkillTagIds: string[];
  desiredSkillTagIds: string[];
  skillDescription: string;
  // Trust score starts at 0, built from reviews
  trustScore: number;
  totalTrades: number;
  // No trade limits — trading is free and unlimited
  agreedToCodeTimestamp: string;
  codeVersion: string;
  lastLogin?: any;
  createdAt: any;
  updatedAt: any;
}

export interface Bounty {
  id: string;
  creatorId: string;
  creatorDisplayName: string;
  // Trust score of creator at time of posting
  creatorTrustScore: number;
  title: string;
  description: string;
  type: 'REQUEST' | 'OFFER';
  category: string;
  classification: 'ITEM' | 'SERVICE';
  exchangeType: 'TRADE' | 'CASH' | 'HYBRID' | 'SERVICE';
  status: 'OPEN' | 'PENDING' | 'COMPLETED';
  imageUrl?: string;
  timestamp: any;
  zipCode: string;
  wantedItem?: string;
  cashAmount?: number;
}

export interface SkillTag {
  id: string;
  name: string;
  category: string;
}

// Trade review left after completing a trade
export interface TradeReview {
  id: string;
  tradeId: string;
  reviewerId: string;
  reviewerDisplayName: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: any;
}

// Helper to get trust label based on total trades
export const getTrustLabel = (totalTrades: number): string => {
  if (totalTrades === 0) return 'No trades yet';
  if (totalTrades <= 5) return 'New Trader';
  if (totalTrades <= 20) return 'Rising Trader';
  if (totalTrades <= 50) return 'Trusted Trader';
  return 'Top Trader';
};

// Helper to get trust color
export const getTrustColor = (totalTrades: number): string => {
  if (totalTrades === 0) return '#666';
  if (totalTrades <= 5) return '#00D4FF';
  if (totalTrades <= 20) return '#7C3AED';
  if (totalTrades <= 50) return '#00FFB2';
  return '#FFD166';
};