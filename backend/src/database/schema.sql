-- =========================================================
-- HRMS ERP - Normalized MySQL Schema (3NF)
-- =========================================================

CREATE DATABASE IF NOT EXISTS hrms_erp
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hrms_erp;

-- ---------------------------------------------------------
-- ROLES (Admin, HR, Manager, Employee)
-- ---------------------------------------------------------
CREATE TABLE roles (
  role_id       INT AUTO_INCREMENT PRIMARY KEY,
  role_name     VARCHAR(50) NOT NULL UNIQUE,
  description   VARCHAR(255),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (role_name, description) VALUES
  ('ADMIN', 'Full system access'),
  ('HR', 'Manages employees, leave, payroll'),
  ('MANAGER', 'Manages team, approves leave, reviews'),
  ('EMPLOYEE', 'Self-service access only');

-- ---------------------------------------------------------
-- USERS (authentication identity, separate from employee profile)
-- ---------------------------------------------------------
CREATE TABLE users (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role_id        INT NOT NULL,
  is_active      BOOLEAN DEFAULT TRUE,
  last_login_at  DATETIME NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);

-- ---------------------------------------------------------
-- DEPARTMENTS
-- ---------------------------------------------------------
CREATE TABLE departments (
  department_id   INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE,
  description     VARCHAR(255),
  head_employee_id INT NULL,  -- FK added after employees table exists
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- DESIGNATIONS
-- ---------------------------------------------------------
CREATE TABLE designations (
  designation_id   INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(100) NOT NULL UNIQUE,
  level            INT DEFAULT 1,      -- seniority level, useful for approvals
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- EMPLOYEES (profile data, 1:1 with users)
-- ---------------------------------------------------------
CREATE TABLE employees (
  employee_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  employee_code    VARCHAR(20) NOT NULL UNIQUE,   -- e.g. EMP-0001
  first_name       VARCHAR(100) NOT NULL,
  last_name        VARCHAR(100) NOT NULL,
  phone            VARCHAR(20),
  date_of_birth    DATE,
  gender           ENUM('MALE','FEMALE','OTHER'),
  address          VARCHAR(255),
  profile_photo_url VARCHAR(255),
  department_id    INT,
  designation_id   INT,
  manager_id       INT NULL,           -- self-referencing FK for reporting hierarchy
  date_of_joining  DATE NOT NULL,
  employment_status ENUM('ACTIVE','ON_LEAVE','TERMINATED','RESIGNED') DEFAULT 'ACTIVE',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_employees_designation FOREIGN KEY (designation_id) REFERENCES designations(designation_id),
  CONSTRAINT fk_employees_manager FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_name ON employees(first_name, last_name);

-- Now that employees exists, link department head
ALTER TABLE departments
  ADD CONSTRAINT fk_department_head FOREIGN KEY (head_employee_id) REFERENCES employees(employee_id);

-- ---------------------------------------------------------
-- ATTENDANCE
-- ---------------------------------------------------------
CREATE TABLE attendance (
  attendance_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time   DATETIME NULL,
  check_out_time  DATETIME NULL,
  working_hours   DECIMAL(5,2) NULL,   -- computed on check-out
  status          ENUM('PRESENT','ABSENT','HALF_DAY','ON_LEAVE') DEFAULT 'PRESENT',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, attendance_date)
) ENGINE=InnoDB;

CREATE INDEX idx_attendance_date ON attendance(attendance_date);

-- ---------------------------------------------------------
-- LEAVE TYPES
-- ---------------------------------------------------------
CREATE TABLE leave_types (
  leave_type_id   INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(50) NOT NULL UNIQUE,   -- e.g. Casual, Sick, Earned
  default_days_per_year INT NOT NULL DEFAULT 12,
  is_paid         BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- LEAVE REQUESTS
-- ---------------------------------------------------------
CREATE TABLE leave_requests (
  leave_request_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL,
  leave_type_id    INT NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  total_days       DECIMAL(4,1) NOT NULL,
  reason           VARCHAR(500),
  status           ENUM('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',
  approved_by      INT NULL,          -- employee_id of approver (manager/HR)
  approved_at      DATETIME NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  CONSTRAINT fk_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id),
  CONSTRAINT fk_leave_approver FOREIGN KEY (approved_by) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

CREATE INDEX idx_leave_employee_status ON leave_requests(employee_id, status);

-- Tracks remaining balance per employee per leave type per year
CREATE TABLE leave_balances (
  leave_balance_id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL,
  leave_type_id    INT NOT NULL,
  year             YEAR NOT NULL,
  allocated_days   DECIMAL(4,1) NOT NULL,
  used_days        DECIMAL(4,1) NOT NULL DEFAULT 0,

  CONSTRAINT fk_balance_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  CONSTRAINT fk_balance_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id),
  CONSTRAINT uq_balance UNIQUE (employee_id, leave_type_id, year)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- SALARY (fixed structure per employee)
-- ---------------------------------------------------------
CREATE TABLE salary (
  salary_id        INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL UNIQUE,
  basic_salary     DECIMAL(12,2) NOT NULL,
  hra              DECIMAL(12,2) DEFAULT 0,
  other_allowances DECIMAL(12,2) DEFAULT 0,
  effective_from   DATE NOT NULL,

  CONSTRAINT fk_salary_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PAYROLL (monthly generated payslips)
-- ---------------------------------------------------------
CREATE TABLE payroll (
  payroll_id       INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL,
  pay_month        TINYINT NOT NULL,   -- 1-12
  pay_year         YEAR NOT NULL,
  basic_salary     DECIMAL(12,2) NOT NULL,
  total_allowances DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  net_salary       DECIMAL(12,2) NOT NULL,
  status           ENUM('DRAFT','GENERATED','PAID') DEFAULT 'DRAFT',
  generated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  CONSTRAINT uq_payroll_employee_month UNIQUE (employee_id, pay_month, pay_year)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PERFORMANCE REVIEWS
-- ---------------------------------------------------------
CREATE TABLE performance_reviews (
  review_id        INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL,
  reviewer_id      INT NOT NULL,       -- employee_id of manager
  review_period    VARCHAR(20) NOT NULL, -- e.g. '2026-Q1'
  rating           DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 5),
  feedback         TEXT,
  goals_next_period TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_review_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
  CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- DOCUMENTS
-- ---------------------------------------------------------
CREATE TABLE documents (
  document_id      INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL,
  document_type    ENUM('RESUME','ID_PROOF','OFFER_LETTER','CONTRACT','OTHER') DEFAULT 'OTHER',
  file_name        VARCHAR(255) NOT NULL,
  file_url         VARCHAR(255) NOT NULL,
  uploaded_by      INT NOT NULL,       -- user_id who uploaded
  uploaded_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_documents_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------
CREATE TABLE notifications (
  notification_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  title            VARCHAR(150) NOT NULL,
  message          VARCHAR(500) NOT NULL,
  is_read          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
