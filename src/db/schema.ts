import { 
  pgTable, 
  text, 
  timestamp, 
  uuid, 
  varchar,
  boolean,
  integer,
  jsonb,
  foreignKey,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// Common fields for all tables
const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: varchar('firebase_uid', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  ...timestamps,
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  firebaseUidIdx: uniqueIndex('users_firebase_uid_idx').on(table.firebaseUid)
}));

// Organizations
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  logoUrl: text('logo_url'),
  website: varchar('website', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  ...timestamps,
}, (table) => ({
  slugIdx: uniqueIndex('org_slug_idx').on(table.slug)
}));

// Roles
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(), // Super Admin, Organization Admin, Manager, Employee, Read Only User
  description: text('description'),
  ...timestamps,
});

// Permissions
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(), // e.g., 'tasks.create', 'billing.view'
  description: text('description'),
  ...timestamps,
});

// Role Permissions (Many-to-Many)
export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').references(() => roles.id).notNull(),
  permissionId: uuid('permission_id').references(() => permissions.id).notNull(),
  ...timestamps,
}, (table) => ({
  rolePermIdx: uniqueIndex('role_perm_idx').on(table.roleId, table.permissionId)
}));

// Organization Users (Many-to-Many)
export const organizationUsers = pgTable('organization_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  roleId: uuid('role_id').references(() => roles.id).notNull(),
  ...timestamps,
}, (table) => ({
  orgUserIdx: uniqueIndex('org_user_idx').on(table.organizationId, table.userId)
}));

// Teams
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ...timestamps,
});

// Team Members
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  isLeader: boolean('is_leader').default(false).notNull(),
  ...timestamps,
}, (table) => ({
  teamUserIdx: uniqueIndex('team_user_idx').on(table.teamId, table.userId)
}));

// Projects (Project Management)
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  teamId: uuid('team_id').references(() => teams.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, completed, archived
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  ...timestamps,
});

// Tasks (Project Management)
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  assigneeId: uuid('assignee_id').references(() => users.id),
  reporterId: uuid('reporter_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('todo'), // todo, in-progress, review, done
  priority: varchar('priority', { length: 50 }).notNull().default('medium'), // low, medium, high, urgent
  dueDate: timestamp('due_date'),
  points: integer('points'),
  ...timestamps,
}, (table) => ({
  projectStatusIdx: index('task_proj_status_idx').on(table.projectId, table.status)
}));

// Task Comments
export const taskComments = pgTable('task_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => tasks.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  ...timestamps,
});

// CRM: Leads
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('new'), // new, contacted, qualified, lost, converted
  source: varchar('source', { length: 100 }),
  score: integer('score').default(0),
  ...timestamps,
}, (table) => ({
  orgLeadStatusIdx: index('org_lead_status_idx').on(table.organizationId, table.status)
}));

// CRM: Companies
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  employeeCount: integer('employee_count'),
  ...timestamps,
});

// CRM: Contacts
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  jobTitle: varchar('job_title', { length: 100 }),
  ...timestamps,
});

// CRM: Opportunities / Deals
export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id),
  contactId: uuid('contact_id').references(() => contacts.id),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  amount: integer('amount').default(0), // in cents
  stage: varchar('stage', { length: 50 }).notNull().default('prospecting'),
  probability: integer('probability').default(10), // percentage 0-100
  expectedCloseDate: timestamp('expected_close_date'),
  ...timestamps,
});

// CRM: Notes
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'lead', 'contact', 'company', 'opportunity'
  entityId: uuid('entity_id').notNull(),
  content: text('content').notNull(),
  ...timestamps,
}, (table) => ({
  entityIdx: index('note_entity_idx').on(table.entityType, table.entityId)
}));

// File Uploads
export const fileUploads = pgTable('file_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  uploadedById: uuid('uploaded_by_id').references(() => users.id).notNull(),
  entityType: varchar('entity_type', { length: 50 }), // 'project', 'task', 'opportunity'
  entityId: uuid('entity_id'),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  ...timestamps,
});

// AI Conversations
export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  title: varchar('title', { length: 255 }),
  contextType: varchar('context_type', { length: 50 }), // 'general', 'crm', 'project', 'document'
  contextId: uuid('context_id'),
  ...timestamps,
});

// AI Messages
export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => aiConversations.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user', 'assistant', 'system'
  content: text('content').notNull(),
  tokensUsed: integer('tokens_used'),
  ...timestamps,
});

// Activity Tracking & Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(), // 'CREATE_USER', 'UPDATE_TASK', etc.
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  ...timestamps,
}, (table) => ({
  orgActionIdx: index('audit_org_action_idx').on(table.organizationId, table.action)
}));

// Subscriptions & Billing
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull(), // 'active', 'canceled', 'past_due', 'trialing'
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  ...timestamps,
});

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }).unique(),
  amountDue: integer('amount_due').notNull(),
  amountPaid: integer('amount_paid').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // 'draft', 'open', 'paid', 'uncollectible', 'void'
  invoicePdf: text('invoice_pdf'),
  ...timestamps,
});

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'mention', 'task_assigned', 'payment_failed'
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  isRead: boolean('is_read').default(false).notNull(),
  linkUrl: text('link_url'),
  ...timestamps,
}, (table) => ({
  userReadIdx: index('notif_user_read_idx').on(table.userId, table.isRead)
}));

// API Keys
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  ...timestamps,
});

// Settings
export const settings = pgTable('settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value').notNull(),
  ...timestamps,
}, (table) => ({
  orgKeyIdx: uniqueIndex('settings_org_key_idx').on(table.organizationId, table.key)
}));

export const usersRelations = relations(users, ({ many }) => ({
  organizationUsers: many(organizationUsers),
  teamMembers: many(teamMembers),
  assignedTasks: many(tasks, { relationName: 'taskAssignee' }),
  reportedTasks: many(tasks, { relationName: 'taskReporter' }),
  aiConversations: many(aiConversations),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  organizationUsers: many(organizationUsers),
  teams: many(teams),
  projects: many(projects),
  aiConversations: many(aiConversations),
}));

export const organizationUsersRelations = relations(organizationUsers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationUsers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationUsers.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [organizationUsers.roleId],
    references: [roles.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
  members: many(teamMembers),
  projects: many(projects),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  user: one(users, { fields: [teamMembers.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  team: one(teams, { fields: [projects.teamId], references: [teams.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: 'taskAssignee',
  }),
  reporter: one(users, {
    fields: [tasks.reporterId],
    references: [users.id],
    relationName: 'taskReporter',
  }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, { fields: [aiConversations.userId], references: [users.id] }),
  organization: one(organizations, {
    fields: [aiConversations.organizationId],
    references: [organizations.id],
  }),
  messages: many(aiMessages),
}));

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));
