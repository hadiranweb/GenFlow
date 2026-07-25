-- GenFlow Database Schema
-- Version: 0.1.0
-- 
-- Core tables for job position generation platform

-- ==========================================
-- Extensions
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Users
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Businesses
-- ==========================================

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50),
    description TEXT,
    employee_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Personality Analyses
-- ==========================================

CREATE TABLE personality_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    
    -- Input data
    name VARCHAR(255) NOT NULL,
    age VARCHAR(10),
    education TEXT,
    work_experience TEXT,
    description TEXT NOT NULL,
    mbti_preference VARCHAR(10),
    enneagram_preference VARCHAR(10),
    
    -- Output data
    personality_type VARCHAR(10),
    traits JSONB,
    decision_style VARCHAR(50),
    risk_tolerance DECIMAL(3,2),
    recommended_roles JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Business Analyses
-- ==========================================

CREATE TABLE business_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    
    -- Input data
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    business_size VARCHAR(50),
    description TEXT NOT NULL,
    challenges TEXT,
    goals TEXT,
    
    -- Output data
    swot JSONB,
    bottlenecks JSONB,
    processes JSONB,
    recommended_positions JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Positions
-- ==========================================

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    personality_analysis_id UUID REFERENCES personality_analyses(id) ON DELETE SET NULL,
    business_analysis_id UUID REFERENCES business_analyses(id) ON DELETE SET NULL,
    
    -- Position data
    title VARCHAR(255) NOT NULL,
    level VARCHAR(50),
    summary TEXT,
    interpretation TEXT,
    
    -- KPIs, Tasks, Requirements
    kpis JSONB,
    tasks JSONB,
    requirements JSONB,
    
    -- Match scores
    match_scores JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',
    
    -- User decision
    user_priorities JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Reports
-- ==========================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content JSONB,
    
    pdf_url VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Standards
-- ==========================================

CREATE TABLE standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    source VARCHAR(50) NOT NULL,
    code VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    keywords TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX idx_personality_user ON personality_analyses(user_id);
CREATE INDEX idx_business_user ON business_analyses(user_id);
CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_reports_position ON reports(position_id);
CREATE INDEX idx_standards_source ON standards(source);
CREATE INDEX idx_standards_category ON standards(category);
