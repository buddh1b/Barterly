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
  karmaBalance: number;
  tradesRemaining: number;
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
  creatorKarma: number;
  title: string;
  description: string;
  type: 'REQUEST' | 'OFFER';
  category: string;
  classification: 'ITEM' | 'SERVICE';
  status: 'OPEN' | 'PENDING' | 'COMPLETED';
  imageUrl?: string;
  timestamp: any;
  zipCode: string;
}

export interface SkillTag {
  id: string;
  name: string;
  category: string;
}