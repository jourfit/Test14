export type UserRole = 'visitor' | 'fan' | 'athlete' | 'coach' | 'gym_owner' | 'organizer' | 'staff' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  displayName: string
  username: string
  avatarUrl?: string
  bio?: string
  location?: string
  sports: Sport[]
  weightClass?: string
  gym?: string
  verified: boolean
  followersCount: number
  followingCount: number
  createdAt: string
  onboardingComplete: boolean
  subscriptionTier: 'free' | 'pro' | 'premium'
}

export type Sport = 'boxing' | 'muay_thai' | 'kickboxing' | 'bjj' | 'wrestling' | 'mma' | 'judo' | 'karate'

export interface Session {
  id: string
  userId: string
  title: string
  type: SessionType
  sport: Sport
  startedAt: string
  endedAt?: string
  durationMinutes: number
  intensity: 1 | 2 | 3 | 4 | 5
  calories?: number
  rounds?: number
  notes?: string
  mood?: 'great' | 'good' | 'ok' | 'tired' | 'rough'
  isPublic: boolean
  isRealCheckin: boolean
  realCheckinPhotoUrl?: string
  route?: RoutePoint[]
  distanceKm?: number
}

export type SessionType = 'sparring' | 'pads' | 'bag' | 'drilling' | 'conditioning' | 'strength' | 'run' | 'recovery' | 'competition'

export interface RoutePoint {
  lat: number
  lng: number
  timestamp: string
  altitude?: number
}

export interface Event {
  id: string
  organizerId: string
  gymId?: string
  title: string
  sport: Sport[]
  type: 'tournament' | 'open_mat' | 'seminar' | 'fight_night' | 'training_camp' | 'sparring_session'
  status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  location: string
  city: string
  country: string
  description: string
  bannerUrl?: string
  maxParticipants?: number
  registeredCount: number
  weightClasses: string[]
  entryFee?: number
  currency?: string
  rules?: string
  brackets?: Bracket[]
  registrations?: Registration[]
}

export interface Registration {
  id: string
  eventId: string
  userId: string
  athleteName: string
  weightClass: string
  status: 'pending' | 'confirmed' | 'waitlist' | 'withdrawn'
  registeredAt: string
  checkedIn: boolean
}

export interface Bracket {
  id: string
  eventId: string
  weightClass: string
  ageCategory?: string
  sex?: 'M' | 'F' | 'mixed'
  participants: BracketParticipant[]
  matches: Match[]
}

export interface BracketParticipant {
  id: string
  userId: string
  name: string
  gym?: string
  seed?: number
}

export interface Match {
  id: string
  bracketId: string
  round: number
  position: number
  redCorner?: string
  blueCorner?: string
  result?: 'red' | 'blue' | 'draw' | 'nc'
  method?: string
  duration?: string
  scheduledTime?: string
}

export interface FeedPost {
  id: string
  userId: string
  authorName: string
  authorUsername: string
  authorAvatarUrl?: string
  authorVerified: boolean
  content: string
  mediaUrls?: string[]
  type: 'post' | 'session_share' | 'real_checkin' | 'achievement' | 'event_result'
  sessionId?: string
  eventId?: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  tags?: string[]
  createdAt: string
}

export interface Comment {
  id: string
  postId: string
  userId: string
  authorName: string
  authorAvatarUrl?: string
  content: string
  likesCount: number
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  actionUrl?: string
  actorId?: string
  actorName?: string
  actorAvatarUrl?: string
  createdAt: string
}

export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'event_invite'
  | 'event_registration_confirmed'
  | 'event_result'
  | 'challenge_invite'
  | 'challenge_completed'
  | 'broadcast'
  | 'training_reminder'
  | 'fight_camp_checkin'
  | 'achievement_unlocked'

export interface Broadcast {
  id: string
  senderId: string
  gymId?: string
  title: string
  message: string
  type: 'announcement' | 'training_update' | 'event_reminder' | 'emergency'
  targetGroups: RecipientGroup[]
  recipientCount: number
  scheduledAt?: string
  sentAt?: string
  status: 'draft' | 'scheduled' | 'sent'
}

export type RecipientGroup = 'all_members' | 'athletes' | 'coaches' | 'active_members' | 'inactive_members' | 'competition_team' | 'beginners' | 'advanced'

export interface Challenge {
  id: string
  creatorId: string
  title: string
  description: string
  type: 'sessions' | 'distance' | 'duration' | 'sparring_rounds' | 'streak'
  target: number
  unit: string
  sport?: Sport
  startDate: string
  endDate: string
  isPublic: boolean
  participantCount: number
  participants?: ChallengeParticipant[]
}

export interface ChallengeParticipant {
  userId: string
  name: string
  avatarUrl?: string
  progress: number
  rank: number
  joinedAt: string
}

export interface FightCamp {
  id: string
  athleteId: string
  eventId?: string
  title: string
  startDate: string
  fightDate: string
  targetWeight?: number
  currentWeight?: number
  phases: FightCampPhase[]
  notes: string
  isActive: boolean
}

export interface FightCampPhase {
  name: string
  startDate: string
  endDate: string
  focus: string
  sessionsPlanned: number
  sessionsCompleted: number
}

export interface GymProfile {
  id: string
  ownerId: string
  name: string
  slug: string
  description: string
  logoUrl?: string
  bannerUrl?: string
  sports: Sport[]
  location: string
  city: string
  country: string
  website?: string
  instagram?: string
  memberCount: number
  coachCount: number
  verified: boolean
  subscriptionTier: 'basic' | 'pro' | 'elite'
}

export interface Achievement {
  id: string
  userId: string
  type: string
  title: string
  description: string
  iconName: string
  unlockedAt: string
}
