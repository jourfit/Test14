-- SPARR Platform — Initial Schema
-- Run in Supabase SQL Editor or via `supabase db push`

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis" schema extensions;

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  city text,
  country text default 'CH',
  primary_role text not null default 'athlete'
    check (primary_role in ('athlete','coach','gym_owner','organizer','fan','staff','admin','visitor')),
  public_visibility text not null default 'public'
    check (public_visibility in ('public','followers','private')),
  verified boolean not null default false,
  followers_count int not null default 0,
  following_count int not null default 0,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free','pro','premium')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- GYMS
-- ============================================================
create table if not exists gyms (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete set null,
  name text not null,
  slug text unique not null,
  logo_url text,
  banner_url text,
  description text,
  city text,
  country text default 'CH',
  address text,
  disciplines text[] default '{}',
  public_visibility text not null default 'public',
  verified boolean not null default false,
  member_count int not null default 0,
  coach_count int not null default 0,
  subscription_tier text not null default 'basic'
    check (subscription_tier in ('basic','pro','elite')),
  website text,
  instagram text,
  created_at timestamptz not null default now()
);

create table if not exists gym_members (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid references gyms(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'athlete'
    check (role in ('owner','admin','coach','athlete','member')),
  status text not null default 'active'
    check (status in ('active','inactive','pending')),
  joined_at timestamptz not null default now(),
  unique(gym_id, user_id)
);

-- ============================================================
-- ATHLETE & COACH PROFILES
-- ============================================================
create table if not exists athlete_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null unique,
  gym_id uuid references gyms(id) on delete set null,
  disciplines text[] default '{}',
  weight_class text,
  current_weight numeric(5,2),
  level text default 'beginner'
    check (level in ('beginner','intermediate','advanced','elite','pro')),
  fight_record jsonb default '{"wins":0,"losses":0,"draws":0}',
  goals text[],
  public_visibility text not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists coach_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null unique,
  gym_id uuid references gyms(id) on delete set null,
  disciplines text[] default '{}',
  experience_years int default 0,
  achievements text[],
  athlete_count int not null default 0,
  public_visibility text not null default 'public',
  created_at timestamptz not null default now()
);

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid references profiles(id) on delete cascade not null,
  gym_id uuid references gyms(id) on delete set null,
  title text not null,
  slug text unique,
  type text not null
    check (type in ('tournament','open_mat','seminar','fight_night','training_camp','sparring_session')),
  description text,
  rules text,
  location text,
  city text,
  country text default 'CH',
  banner_url text,
  start_date timestamptz not null,
  end_date timestamptz,
  registration_open timestamptz,
  registration_close timestamptz,
  disciplines text[] default '{}',
  status text not null default 'draft'
    check (status in ('draft','published','registration_open','registration_closed','ongoing','completed','cancelled')),
  visibility text not null default 'public'
    check (visibility in ('public','private','unlisted')),
  max_participants int,
  registered_count int not null default 0,
  entry_fee numeric(8,2) default 0,
  currency text default 'CHF',
  ticketing_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_categories (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  discipline text not null,
  age_group text,
  gender text check (gender in ('M','F','mixed')),
  weight_class text,
  level text,
  bracket_type text not null default 'single_elimination'
    check (bracket_type in ('single_elimination','double_elimination','round_robin','superfight','manual')),
  max_participants int,
  participant_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  category_id uuid references event_categories(id) on delete set null,
  athlete_id uuid references profiles(id) on delete cascade not null,
  coach_id uuid references profiles(id) on delete set null,
  gym_id uuid references gyms(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','waitlist','withdrawn','checked_in')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','refunded','waived')),
  weight_class text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique(event_id, athlete_id)
);

-- ============================================================
-- MATCHES & SCHEDULE
-- ============================================================
create table if not exists event_areas (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  type text default 'ring' check (type in ('ring','mat','hall','warmup','other')),
  location_note text
);

create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  category_id uuid references event_categories(id) on delete set null,
  area_id uuid references event_areas(id) on delete set null,
  round int not null default 1,
  position int,
  athlete_a_id uuid references profiles(id) on delete set null,
  athlete_b_id uuid references profiles(id) on delete set null,
  scheduled_time timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled','running','completed','postponed','cancelled','no_contest')),
  winner_id uuid references profiles(id) on delete set null,
  result_type text check (result_type in ('decision','ko','tko','rsc','submission','dq','draw','nc')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists schedule_blocks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  area_id uuid references event_areas(id) on delete set null,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  type text default 'match' check (type in ('match','break','ceremony','warmup','weigh_in','other'))
);

-- ============================================================
-- STAFF
-- ============================================================
create table if not exists staff_assignments (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null check (role in ('referee','judge','timekeeper','announcer','doctor','security','check_in','coordinator','other')),
  area_id uuid references event_areas(id) on delete set null,
  status text not null default 'assigned' check (status in ('assigned','confirmed','declined','absent')),
  unique(event_id, user_id, role)
);

create table if not exists staff_tasks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  assigned_to uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'pending' check (status in ('pending','in_progress','done','cancelled')),
  due_time timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SPONSORS & TICKETS
-- ============================================================
create table if not exists sponsors (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  logo_url text,
  website_url text,
  placement text default 'standard' check (placement in ('title','gold','silver','standard')),
  description text
);

create table if not exists tickets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  ticket_type text not null default 'general' check (ticket_type in ('general','vip','press','staff','complimentary')),
  qr_code text unique,
  status text not null default 'valid' check (status in ('valid','used','cancelled','transferred')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SOCIAL
-- ============================================================
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references profiles(id) on delete cascade not null,
  gym_id uuid references gyms(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  type text not null default 'post'
    check (type in ('post','session_share','real_checkin','achievement','event_result','announcement')),
  content text not null,
  media_urls text[] default '{}',
  tags text[] default '{}',
  visibility text not null default 'public' check (visibility in ('public','followers','private','team')),
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  likes_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reactions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  reaction_type text not null default 'like'
    check (reaction_type in ('like','fire','fist','trophy','heart')),
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references profiles(id) on delete cascade not null,
  followed_user_id uuid references profiles(id) on delete cascade,
  followed_gym_id uuid references gyms(id) on delete cascade,
  followed_event_id uuid references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (followed_user_id is not null and followed_gym_id is null and followed_event_id is null) or
    (followed_user_id is null and followed_gym_id is not null and followed_event_id is null) or
    (followed_user_id is null and followed_gym_id is null and followed_event_id is not null)
  )
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in (
    'follow','like','comment','mention',
    'event_invite','event_registration_confirmed','event_result',
    'challenge_invite','challenge_completed',
    'broadcast','training_reminder','fight_camp_checkin','achievement_unlocked',
    'match_reminder','schedule_change','warmup_call','weigh_in_call',
    'staff_task','payment_status','registration_status'
  )),
  title text not null,
  body text not null,
  target_url text,
  is_read boolean not null default false,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  actor_id uuid references profiles(id) on delete set null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_unread
  on notifications(user_id, is_read)
  where not is_read;

-- ============================================================
-- TRAINING
-- ============================================================
create table if not exists training_sessions (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in (
    'sparring','pads','bag','drilling','conditioning','strength','run','recovery','competition'
  )),
  sport text not null check (sport in (
    'boxing','muay_thai','kickboxing','bjj','wrestling','mma','judo','karate'
  )),
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_seconds int not null,
  distance_meters numeric(10,2),
  avg_pace_sec_per_km numeric(8,2),
  avg_speed_kmh numeric(6,2),
  intensity int not null default 3 check (intensity between 1 and 5),
  calories int,
  rounds int,
  mood text check (mood in ('great','good','ok','tired','rough')),
  notes text,
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  is_real_checkin boolean not null default false,
  hide_route boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists training_route_points (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references training_sessions(id) on delete cascade not null,
  latitude numeric(10,8) not null,
  longitude numeric(11,8) not null,
  altitude numeric(8,2),
  speed numeric(6,2),
  recorded_at timestamptz not null
);

create index if not exists idx_route_points_session
  on training_route_points(session_id, recorded_at);

-- ============================================================
-- FIGHT CAMPS
-- ============================================================
create table if not exists fight_camps (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references profiles(id) on delete cascade not null,
  event_id uuid references events(id) on delete set null,
  title text not null,
  start_date date not null,
  fight_date date not null,
  target_weight numeric(5,2),
  current_weight numeric(5,2),
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists weight_logs (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid references profiles(id) on delete cascade not null,
  weight numeric(5,2) not null,
  notes text,
  logged_at timestamptz not null default now(),
  visibility text not null default 'private' check (visibility in ('public','team','private'))
);

-- ============================================================
-- CHALLENGES
-- ============================================================
create table if not exists challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  type text not null check (type in ('sessions','distance','duration','sparring_rounds','streak')),
  sport text,
  target_value numeric(10,2) not null,
  unit text not null,
  start_date date not null,
  end_date date not null,
  is_public boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  participant_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists challenge_participants (
  id uuid primary key default uuid_generate_v4(),
  challenge_id uuid references challenges(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  progress numeric(10,2) not null default 0,
  rank int,
  status text not null default 'active' check (status in ('active','completed','withdrawn')),
  joined_at timestamptz not null default now(),
  unique(challenge_id, user_id)
);

-- ============================================================
-- MESSAGING
-- ============================================================
create table if not exists message_groups (
  id uuid primary key default uuid_generate_v4(),
  gym_id uuid references gyms(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  name text not null,
  type text not null default 'team' check (type in ('team','event_staff','event_broadcast','direct')),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references message_groups(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete set null,
  content text not null,
  is_broadcast boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- SUBSCRIPTIONS & BILLING
-- ============================================================
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free','pro','premium','organizer','gym_pro','gym_elite')),
  status text not null default 'active' check (status in ('active','trialing','past_due','cancelled','paused')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cancellation_feedback (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid references subscriptions(id) on delete cascade not null,
  reason text not null check (reason in (
    'too_expensive','not_using','missing_features','switched_tool',
    'technical_issues','temporary_pause','other'
  )),
  comment text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- REPORTS / MODERATION
-- ============================================================
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references profiles(id) on delete cascade not null,
  target_type text not null check (target_type in ('post','profile','comment','event','gym')),
  target_id uuid not null,
  reason text not null check (reason in (
    'spam','harassment','inappropriate_content','fake_profile','copyright','other'
  )),
  status text not null default 'pending' check (status in ('pending','reviewed','actioned','dismissed')),
  reviewer_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MEDIA ASSETS
-- ============================================================
create table if not exists media_assets (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade not null,
  url text not null,
  type text not null check (type in ('image','video','document')),
  bucket text not null,
  size_bytes bigint,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table gyms enable row level security;
alter table gym_members enable row level security;
alter table athlete_profiles enable row level security;
alter table coach_profiles enable row level security;
alter table events enable row level security;
alter table event_categories enable row level security;
alter table event_registrations enable row level security;
alter table matches enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table follows enable row level security;
alter table notifications enable row level security;
alter table training_sessions enable row level security;
alter table training_route_points enable row level security;
alter table fight_camps enable row level security;
alter table weight_logs enable row level security;
alter table challenges enable row level security;
alter table challenge_participants enable row level security;
alter table subscriptions enable row level security;
alter table reports enable row level security;

-- Profiles: public read for public profiles, own write
create policy "profiles_public_read" on profiles
  for select using (public_visibility = 'public' or auth.uid() = user_id);

create policy "profiles_own_write" on profiles
  for all using (auth.uid() = user_id);

-- Events: public read for published events
create policy "events_public_read" on events
  for select using (status in ('published','registration_open','registration_closed','ongoing','completed') and visibility = 'public');

create policy "events_organizer_write" on events
  for all using (
    auth.uid() in (select user_id from profiles where id = organizer_id)
  );

-- Notifications: only own
create policy "notifications_own" on notifications
  for all using (
    auth.uid() in (select user_id from profiles where id = user_id)
  );

-- Training sessions: own + public
create policy "training_own_or_public" on training_sessions
  for select using (
    visibility = 'public' or
    auth.uid() in (select user_id from profiles where id = athlete_id)
  );

create policy "training_own_write" on training_sessions
  for all using (
    auth.uid() in (select user_id from profiles where id = athlete_id)
  );

-- Route points: only own (privacy)
create policy "route_points_own" on training_route_points
  for all using (
    auth.uid() in (
      select p.user_id from profiles p
      join training_sessions ts on ts.athlete_id = p.id
      where ts.id = session_id
    )
  );

-- Posts: own + public feed
create policy "posts_public_read" on posts
  for select using (visibility = 'public');

create policy "posts_own_write" on posts
  for all using (auth.uid() in (select user_id from profiles where id = author_id));

-- Weight logs: private by default
create policy "weight_logs_own" on weight_logs
  for all using (auth.uid() in (select user_id from profiles where id = athlete_id));

-- Subscriptions: own only
create policy "subscriptions_own" on subscriptions
  for all using (auth.uid() in (select user_id from profiles where id = user_id));

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger events_updated_at before update on events
  for each row execute function update_updated_at();

create trigger subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at();
