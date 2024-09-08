create table files (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  size bigint not null,
  type text not null,
  visibility text not null,
  url text not null,
  uploaded_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);