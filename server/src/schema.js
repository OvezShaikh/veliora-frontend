// Tables are created automatically on the first request (safe to run repeatedly).
// To change the database later, add statements at the bottom using IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
export const schemaSql = `
create table if not exists meta (key text primary key, value text not null);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user','admin','superadmin')),
  created_at timestamptz not null default now()
);
create unique index if not exists users_email_lower on users (lower(email));

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('We deal in','We buy')),
  description text not null default '',
  material text not null default '',
  colour text not null default '',
  qty text not null default 'Bulk',
  price numeric check (price is null or price >= 0),
  unit text not null default 'kg' check (unit in ('kg','tonne')),
  art text not null default 'pp-white',
  image bytea,
  image_type text,
  image_version int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  product text not null,
  qty text,
  message text,
  status text not null default 'new' check (status in ('new','progress','closed')),
  created_at timestamptz not null default now()
);
create index if not exists inquiries_user on inquiries (user_id);
`

const P = (name, category, art, description, material, colour) => ({ name, category, art, description, material, colour })
export const starterProducts = [
  P('PP White', 'We deal in', 'pp-white', 'White polypropylene material for recycling.', 'Polypropylene (PP)', 'White'),
  P('PP Yellow', 'We deal in', 'pp-yellow', 'Yellow polypropylene material for recycling.', 'Polypropylene (PP)', 'Yellow'),
  P('BOPP Colour', 'We deal in', 'bopp-colour', 'Coloured BOPP film material for recycling.', 'BOPP film', 'Coloured'),
  P('BOPP Mix', 'We deal in', 'bopp-mix', 'Mixed BOPP film material for recycling.', 'BOPP film', 'Mixed'),
  P('PP White Bags Waste', 'We buy', 'bag-white', 'White PP bag waste from factories, bought in bulk.', 'Woven PP bags', 'White'),
  P('PP Mixed Bags Waste', 'We buy', 'bag-mixed', 'Mixed-colour PP bag waste from factories, bought in bulk.', 'Woven PP bags', 'Mixed'),
  P('PP Jumbo Bags', 'We buy', 'jumbo', 'Jumbo bags bought in large quantities for recycling and processing.', 'Woven PP jumbo bags', 'Mixed'),
  P('PP Raffia Bags Waste', 'We buy', 'raffia', 'Raffia bag waste bought in large quantities for recycling and processing.', 'PP raffia', 'Mixed'),
]
