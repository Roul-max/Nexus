import { db } from '@/db';
import {
  roles,
  users,
  organizations,
  organizationUsers,
  teams,
  teamMembers,
  projects,
  tasks,
  leads,
  invoices,
  auditLogs,
  apiKeys,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const ORG_NAME = 'Nexus Technologies';
const ORG_SLUG = 'nexus-technologies';

async function main() {
  console.log('🌱 Starting database seed...');

  await db.transaction(async (tx) => {
    // 1. Roles
    const seededRoles = await tx
      .insert(roles)
      .values([
        { name: 'Organization Admin', description: 'Full access to all organization features.' },
        { name: 'Manager', description: 'Manages projects and teams.' },
        { name: 'Employee', description: 'Standard user with access to assigned projects and tasks.' },
      ])
      .onConflictDoNothing()
      .returning();
    console.log(`✅ Roles seeded: ${seededRoles.length} new roles created.`);

    const allRoles = await tx.select().from(roles);
    const adminRole = allRoles.find((r) => r.name === 'Organization Admin')!;
    const managerRole = allRoles.find((r) => r.name === 'Manager')!;
    const employeeRole = allRoles.find((r) => r.name === 'Employee')!;

    // 2. Organization
    const [seededOrg] = await tx
      .insert(organizations)
      .values({
        name: ORG_NAME,
        slug: ORG_SLUG,
        website: 'https://nexus.inc',
      })
      .onConflictDoUpdate({ target: organizations.slug, set: { name: ORG_NAME } })
      .returning();
    const orgId = seededOrg.id;
    console.log(`✅ Organization seeded: "${seededOrg.name}"`);

    // 3. Users & Organization Memberships
    const userValues = [
      {
        email: 'rsoulrsoul439@gmail.com',
        name: 'Rohit Soul (Admin)',
        firebaseUid: 'firebase_uid_rsoulrsoul439',
        roleId: adminRole.id,
      },
      {
        email: 'manager@nexus.com',
        name: 'Manager User',
        firebaseUid: 'firebase_uid_manager',
        roleId: managerRole.id,
      },
      {
        email: 'employee@nexus.com',
        name: 'Employee User',
        firebaseUid: 'firebase_uid_employee',
        roleId: employeeRole.id,
      },
    ];

    for (const u of userValues) {
      const [existingUser] = await tx.select({ id: users.id }).from(users).where(eq(users.email, u.email));
      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: u.email,
            name: u.name,
            firebaseUid: u.firebaseUid,
            onboardingCompleted: true,
          })
          .returning({ id: users.id });
        userId = newUser.id;
      }

      await tx.insert(organizationUsers).values({
        organizationId: orgId,
        userId: userId,
        roleId: u.roleId,
      }).onConflictDoNothing();
    }
    console.log(`✅ Users and Memberships seeded.`);

    const allUsers = await tx.select().from(users);
    const adminUser = allUsers.find(u => u.email === 'rsoulrsoul439@gmail.com')!;
    const managerUser = allUsers.find(u => u.email === 'manager@nexus.com')!;
    const employeeUser = allUsers.find(u => u.email === 'employee@nexus.com')!;

    // 4. Teams & Team Members
    const [engTeam] = await tx.insert(teams).values({ organizationId: orgId, name: 'Engineering' }).onConflictDoNothing().returning();
    const [salesTeam] = await tx.insert(teams).values({ organizationId: orgId, name: 'Sales' }).onConflictDoNothing().returning();
    const [marketingTeam] = await tx.insert(teams).values({ organizationId: orgId, name: 'Marketing' }).onConflictDoNothing().returning();
    
    if (engTeam) {
        await tx.insert(teamMembers).values([{ teamId: engTeam.id, userId: adminUser.id, isLeader: true }, { teamId: engTeam.id, userId: employeeUser.id }]).onConflictDoNothing();
    }
    if (salesTeam) {
        await tx.insert(teamMembers).values({ teamId: salesTeam.id, userId: managerUser.id, isLeader: true }).onConflictDoNothing();
    }
    console.log('✅ Teams and Team Members seeded.');

    // 5. Projects
    const projectValues = [
      { name: 'CRM Platform', status: 'active', teamId: salesTeam?.id },
      { name: 'Analytics Dashboard', status: 'active', teamId: engTeam?.id },
      { name: 'AI Assistant', status: 'in-progress', teamId: engTeam?.id },
    ];
    for (const p of projectValues) {
      await tx.insert(projects).values({ ...p, organizationId: orgId }).onConflictDoNothing();
    }
    console.log('✅ Projects seeded.');

    const allProjects = await tx.select().from(projects).where(eq(projects.organizationId, orgId));
    const crmProject = allProjects.find(p => p.name === 'CRM Platform')!;
    const analyticsProject = allProjects.find(p => p.name === 'Analytics Dashboard')!;

    // 6. Tasks
    const taskStatuses = ['todo', 'in-progress', 'review', 'done'];
    const taskPriorities = ['low', 'medium', 'high'];
    const taskUsers = [adminUser.id, managerUser.id, employeeUser.id];
    const taskProjects = [crmProject.id, analyticsProject.id];

    const taskValues = Array.from({ length: 15 }, (_, i) => ({
      projectId: taskProjects[i % taskProjects.length],
      assigneeId: taskUsers[i % taskUsers.length],
      reporterId: adminUser.id,
      title: `Implement feature #${i + 1}`,
      description: `Detailed description for feature #${i + 1}.`,
      status: taskStatuses[i % taskStatuses.length],
      priority: taskPriorities[i % taskPriorities.length],
      dueDate: new Date(Date.now() + (i - 7) * 24 * 60 * 60 * 1000),
    }));

    await tx.insert(tasks).values(taskValues).onConflictDoNothing();
    console.log('✅ Tasks seeded.');

    // 7. Leads
    const leadStatuses = ['new', 'contacted', 'qualified', 'lost', 'converted'];
    const leadSources = ['Website', 'Referral', 'Cold Call', 'Event'];
    const leadValues = Array.from({ length: 20 }, (_, i) => ({
      organizationId: orgId,
      assignedToId: managerUser.id,
      firstName: `Lead`,
      lastName: `${i + 1}`,
      email: `lead${i + 1}@example.com`,
      company: `Company ${i + 1}`,
      status: leadStatuses[i % leadStatuses.length],
      source: leadSources[i % leadSources.length],
      score: Math.floor(Math.random() * 100),
    }));

    await tx.insert(leads).values(leadValues).onConflictDoNothing();
    console.log('✅ Leads seeded.');

    // 8. Invoices
    const now = new Date();
    const invoiceValues = [
      {
        organizationId: orgId,
        amountDue: 50000,
        amountPaid: 50000,
        status: 'paid',
        paidAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        organizationId: orgId,
        amountDue: 75000,
        amountPaid: 0,
        status: 'open', // 'pending' is not a valid status in the schema
      },
      {
        organizationId: orgId,
        amountDue: 25000,
        amountPaid: 0,
        status: 'draft', // 'overdue' is not a valid status, this would be calculated
      },
    ];

    await tx.insert(invoices).values(invoiceValues).onConflictDoNothing();
    console.log('✅ Invoices seeded.');

    // 9. Audit Logs
    const completedTask = (await tx.select().from(tasks).where(eq(tasks.status, 'done')).limit(1))[0];
    const newLead = (await tx.select().from(leads).where(eq(leads.status, 'new')).limit(1))[0];

    type AuditLogInsert = typeof auditLogs.$inferInsert;

    const auditLogValues: AuditLogInsert[] = [
      {
        organizationId: orgId,
        userId: adminUser.id,
        action: 'USER_LOGIN',
        entityType: 'user',
        entityId: adminUser.id,
        newValues: { email: adminUser.email },
      },
      {
        organizationId: orgId,
        userId: adminUser.id,
        action: 'PROJECT_CREATED',
        entityType: 'project',
        entityId: crmProject.id,
        newValues: { name: crmProject.name },
      },
    ];

    if (completedTask) {
      auditLogValues.push({
        organizationId: orgId,
        userId: completedTask.assigneeId!,
        action: 'TASK_COMPLETED',
        entityType: 'task',
        entityId: completedTask.id,
        newValues: { status: 'done' },
      });
    }

    if (newLead) {
      auditLogValues.push({
        organizationId: orgId,
        userId: managerUser.id,
        action: 'LEAD_CREATED',
        entityType: 'lead',
        entityId: newLead.id,
        newValues: { email: newLead.email },
      });
    }

    await tx.insert(auditLogs).values(auditLogValues).onConflictDoNothing();
    console.log('✅ Audit Logs seeded.');

    // 10. API Keys
    const apiKeyName = 'Default API Key';
    const existingApiKey = await tx.select().from(apiKeys).where(eq(apiKeys.name, apiKeyName));

    if (existingApiKey.length === 0) {
      const key = `nx_${crypto.randomBytes(24).toString('hex')}`;
      const hash = crypto.createHash('sha256').update(key).digest('hex');
      await tx.insert(apiKeys).values({
        organizationId: orgId,
        userId: adminUser.id,
        name: apiKeyName,
        keyHash: hash,
      });
      console.log('✅ API Key seeded.');
      console.log(`🔑 Your one-time API key is: ${key}`);
      console.log('   (Store it securely, it will not be shown again)');
    } else {
      console.log('✅ API Key already exists, skipping.');
    }
  });
}

main()
  .then(() => {
    console.log('🏁 Seed completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ An error occurred during seeding:', err);
    process.exit(1);
  });

export {};