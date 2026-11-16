-- PostgreSQL reference schema for FIBA Referee Academy

CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('USER', 'ADMIN')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(180) NOT NULL,
    rule_reference VARCHAR(120) NOT NULL,
    category       VARCHAR(80)  NOT NULL,
    difficulty     VARCHAR(40)  NOT NULL,
    prompt         TEXT         NOT NULL,
    video_filename VARCHAR(255),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answer_options (
    id           BIGSERIAL PRIMARY KEY,
    question_id  BIGINT       NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    sort_order   INTEGER      NOT NULL,
    option_label VARCHAR(500) NOT NULL,
    correct      BOOLEAN      NOT NULL,
    explanation  TEXT         NOT NULL
);

CREATE TABLE IF NOT EXISTS user_attempts (
    id                 BIGSERIAL PRIMARY KEY,
    user_id            BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id        BIGINT      NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id BIGINT      NOT NULL REFERENCES answer_options(id) ON DELETE CASCADE,
    correct            BOOLEAN     NOT NULL,
    attempted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
