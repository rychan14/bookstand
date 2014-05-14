drop schema public cascade;
create schema public;
create TYPE request_type as ENUM ('buy', 'sell');

create TABLE accounts (
  id              integer   NOT NULL PRIMARY KEY,
  email           char(250) NOT NULL UNIQUE,
  fb_id           char(100) NOT NULL UNIQUE,
  profile_pic_url text      NOT NULL,
  realname        char(250) NOT NULL,
  username        char(50)  NOT NULL UNIQUE
);

create TABLE textbooks (
  id        integer   NOT NULL PRIMARY KEY,
  author    char(250),
  isbn      char(50)  NOT NULL UNIQUE,
  mfr_price money,
  name      char(250) NOT NULL
);

create TABLE courses (
  id         integer   NOT NULL PRIMARY KEY,
  department char(250) NOT NULL,
  name       char(250) NOT NULL,
  number     char(20)  NOT NULL
);

create TABLE requests (
  id          integer      NOT NULL PRIMARY KEY,
  account_id  integer      NOT NULL references accounts(id),
  image_url   text         NOT NULL,
  post_time   timestamp    NOT NULL default current_timestamp,
  price       money        NOT NULL,
  r_type      request_type NOT NULL,
  textbook_id integer      NOT NULL references textbooks(id)
);

create TABLE course_textbooks (
  id          integer      NOT NULL PRIMARY KEY,
  course_id   integer      NOT NULL references courses(id),
  textbook_id integer      NOT NULL references textbooks(id)
);
