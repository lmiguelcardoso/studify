-- ============================================================
-- Studify — Initial Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE topics (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  description   TEXT,
  parent_id     UUID        REFERENCES topics(id) ON DELETE CASCADE,
  color         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id      UUID        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL CHECK (type IN ('multiple_choice', 'true_false')),
  text          TEXT        NOT NULL,
  explanation   TEXT,
  options       JSONB       NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flashcards (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id      UUID        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question_id   UUID        REFERENCES questions(id) ON DELETE SET NULL,
  front         TEXT        NOT NULL,
  back          TEXT        NOT NULL,
  pile          TEXT        NOT NULL DEFAULT 'unknown' CHECK (pile IN ('unknown', 'learning', 'known')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE materials (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id      UUID        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL CHECK (type IN ('pdf', 'video_link', 'video_upload')),
  title         TEXT        NOT NULL,
  url           TEXT,
  file_path     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_sessions (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id          UUID        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  total_questions   INTEGER     NOT NULL DEFAULT 0,
  correct_answers   INTEGER     NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at       TIMESTAMPTZ
);

CREATE TABLE quiz_answers (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id          UUID        NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id         UUID        NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id  TEXT,
  is_correct          BOOLEAN     NOT NULL,
  answered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flashcard_sessions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id        UUID        NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  cards_reviewed  INTEGER     NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ
);

CREATE TABLE push_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    TEXT        NOT NULL UNIQUE,
  p256dh      TEXT        NOT NULL,
  auth        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_topics_user_id       ON topics(user_id);
CREATE INDEX idx_topics_parent_id     ON topics(parent_id);

CREATE INDEX idx_questions_user_id    ON questions(user_id);
CREATE INDEX idx_questions_topic_id   ON questions(topic_id);

CREATE INDEX idx_flashcards_user_id   ON flashcards(user_id);
CREATE INDEX idx_flashcards_topic_id  ON flashcards(topic_id);
CREATE INDEX idx_flashcards_pile      ON flashcards(user_id, pile);

CREATE INDEX idx_materials_user_id    ON materials(user_id);
CREATE INDEX idx_materials_topic_id   ON materials(topic_id);

CREATE INDEX idx_quiz_sessions_user_id   ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_topic_id  ON quiz_sessions(topic_id);
CREATE INDEX idx_quiz_sessions_started   ON quiz_sessions(user_id, started_at DESC);

CREATE INDEX idx_quiz_answers_session_id ON quiz_answers(session_id);

CREATE INDEX idx_fc_sessions_user_id     ON flashcard_sessions(user_id);
CREATE INDEX idx_fc_sessions_started     ON flashcard_sessions(user_id, started_at DESC);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- ============================================================
-- updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE topics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions  ENABLE ROW LEVEL SECURITY;

-- topics
CREATE POLICY "topics: user owns" ON topics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- questions
CREATE POLICY "questions: user owns" ON questions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- flashcards
CREATE POLICY "flashcards: user owns" ON flashcards
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- materials
CREATE POLICY "materials: user owns" ON materials
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- quiz_sessions
CREATE POLICY "quiz_sessions: user owns" ON quiz_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- quiz_answers (no user_id — access via session ownership)
CREATE POLICY "quiz_answers: user owns via session" ON quiz_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- flashcard_sessions
CREATE POLICY "flashcard_sessions: user owns" ON flashcard_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- push_subscriptions
CREATE POLICY "push_subscriptions: user owns" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
