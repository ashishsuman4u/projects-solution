-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants Table
CREATE TABLE tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
	country TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
    role_id NUMERIC PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Users Table
CREATE TABLE users (
    email TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    role_id NUMERIC NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
	name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO roles(role_id, name)
VALUES (1001, 'super-admin'),(10001, 'admin'),(10002, 'manager'),(10003, 'contributor'),(10004, 'readonly');


INSERT INTO tenants(name, country)
VALUES ('PWC', 'USA'),('RnC', 'INDIA'),('TCS', 'INDIA');


INSERT INTO users(email, role_id, name)
VALUES ('test@gmail.com', 1001, 'Ashish Suman');


