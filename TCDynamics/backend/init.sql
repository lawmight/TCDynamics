-- PostgreSQL initialization script for TCDynamics
-- Create database and user if they don't exist

-- Create database (if not exists)
SELECT 'CREATE DATABASE tcdynamics'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tcdynamics')\gexec

-- Create user and grant permissions
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tcdynamics') THEN
      CREATE ROLE tcdynamics LOGIN PASSWORD 'changeme';
   END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE tcdynamics TO tcdynamics;

-- Connect to the database and create tables
\c tcdynamics;

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    message TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT
);

-- Create demo_requests table
CREATE TABLE IF NOT EXISTS demo_requests (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255) NOT NULL,
    employees VARCHAR(50),
    needs TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new',
    contacted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);

CREATE INDEX IF NOT EXISTS idx_demo_requests_email ON demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created_at ON demo_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);

-- Grant permissions on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tcdynamics;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tcdynamics;

-- Insert some sample data for testing
INSERT INTO contact_submissions (name, email, phone, company, message)
VALUES
    ('Jean Dupont', 'jean.dupont@example.com', '+33123456789', 'Entreprise XYZ', 'Message de test pour la démonstration.')
ON CONFLICT DO NOTHING;

INSERT INTO demo_requests (first_name, last_name, email, phone, company, employees, needs)
VALUES
    ('Marie', 'Martin', 'marie.martin@example.com', '+33123456789', 'Société ABC', '11-50', 'Besoin d''automatisation des processus RH.')
ON CONFLICT DO NOTHING;
