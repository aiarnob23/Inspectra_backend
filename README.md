# Inspectra backend

To install dependencies:

```bash
bun install 
```

To run:

```bash
bun run dev
```

# Inspection & Safety Management Platform

A subscription-based SaaS platform designed to manage inspections of high-risk equipment such as AC systems, elevators, cranes, excavators, generators, and other critical assets.  
The system focuses on automation, accountability, and accident prevention through timely inspections and reminders.

---

## Core Features

### 1. Multi-Tenant Subscription System
- Subscription-based access (Basic / Pro / Enterprise)
- Plan-based feature limits and permissions
- Automated subscription activation and expiry handling
- Secure payment and subscription status tracking

---

### 2. Subscriber (Service Company) Management
- Company-level workspace for each subscriber
- Plan-based limits on:
  - Number of clients
  - Number of employees
  - Automation features
- Centralized dashboard for all inspection activities

---

### 3. Client Management
- Add clients manually via form
- Bulk client import using CSV
- Store client contact details (email, phone, address)
- Plan-based client limit enforcement

---

### 4. Asset Management
- Add multiple assets under a single client
- Support for high-risk equipment:
  - Elevators
  - Air Conditioners (HVAC)
  - Cranes
  - Excavators
  - Generators and industrial machinery
- Asset-to-client ownership mapping

---

### 5. Inspection Scheduling System
- Flexible inspection frequency:
  - Weekly
  - Monthly
  - Quarterly
  - Annual
- First inspection date configuration
- Automatic future inspection date calculation
- Assignment of one or multiple employees per inspection

---

### 6. Automated Reminder System
- Automatic reminders sent:
  - 3 days before inspection
  - On the inspection date
- Notifications sent to:
  - Assigned employees
  - Clients
- Email and SMS reminders (based on subscription plan)
- Background worker / cron-based scheduling

---

### 7. Employee Management
- Add and manage employees under a subscriber
- Role-based access for inspection tasks
- Assign employees to inspections
- Plan-based employee limit enforcement

---

### 8. Inspection Execution & Reporting
- Employees can mark inspections as completed
- Upload inspection reports (CSV or file)
- Inspection status tracking
- Monthly auto-generated inspection summary reports for subscribers

---

### 9. Inspection Rescheduling
- Employees can reschedule upcoming inspections
- Mandatory reason for rescheduling
- Full reschedule history tracking
- Automatic reminder re-generation after date changes

---

## Admin Dashboard Features

### 1. Platform Administration
- Manage all subscribers (companies)
- Activate, suspend, or deactivate subscriptions
- View subscription usage and plan compliance

---

### 2. Membership Plan Management
- Create and manage subscription plans
- Configure plan limits:
  - Max clients
  - Max employees
  - Notification type (Email / SMS)
  - Automation permissions
- Update pricing and feature access dynamically

---

### 3. System Monitoring & Control
- Monitor inspection activity across all subscribers
- Track system-wide usage and performance
- View aggregated reports and analytics

---

### 4. User & Access Control
- Full control over platform roles and permissions
- Subscriber-level access enforcement
- System-level security and policy management

---

## Goal of the Platform

- Prevent accidents caused by missed or delayed inspections
- Improve accountability and inspection compliance
- Provide a reliable digital inspection management system
- Support safety-critical industries with automation and transparency
