import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const dbPath = path.join(__dirname, '../db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found in backend directory!');
    return;
  }

  const rawData = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(rawData);

  console.log('Seeding SQLite database...');

  // 1. Seed Workers
  if (db.workers) {
    for (const w of db.workers) {
      await prisma.worker.upsert({
        where: { id: w.id },
        update: {},
        create: {
          id: w.id,
          name: w.name,
          mobile: w.mobile,
          block: w.block,
        },
      });
    }
    console.log(`Seeded ${db.workers.length} workers.`);
  }

  // 2. Seed Children, Observations, Milestones, and Attendances
  if (db.children) {
    for (const c of db.children) {
      // Create child
      await prisma.child.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          nameHindi: c.nameHindi,
          age: c.age,
          ageDisplay: c.ageDisplay,
          gender: c.gender,
          avatar: c.avatar,
          nutritionStatus: c.nutritionStatus,
          developmentProgress: c.developmentProgress,
          lastVisit: c.lastVisit,
          parentName: c.parentName,
          parentPhone: c.parentPhone,
          address: c.address,
          needsAttention: c.needsAttention,
          aiInsights: JSON.stringify(c.aiInsights || []),
        },
      });

      // Seed observations
      if (c.observations) {
        for (const obs of c.observations) {
          await prisma.observation.upsert({
            where: { id: obs.id },
            update: {},
            create: {
              id: obs.id,
              date: obs.date,
              note: obs.note,
              category: obs.category,
              type: obs.type,
              imageUrl: obs.imageUrl || null,
              childId: c.id,
            },
          });
        }
      }

      // Seed milestones
      if (c.milestones) {
        for (const m of c.milestones) {
          await prisma.milestone.upsert({
            where: { id: m.id },
            update: {},
            create: {
              id: m.id,
              title: m.title,
              date: m.date,
              category: m.category,
              completed: m.completed,
              childId: c.id,
            },
          });
        }
      }

      // Seed attendance from attendanceHistory (14 days)
      if (c.attendanceHistory && Array.isArray(c.attendanceHistory)) {
        for (let i = 0; i < c.attendanceHistory.length; i++) {
          let dateStr = '';
          const daysAgo = c.attendanceHistory.length - 1 - i;
          
          if (daysAgo === 0) {
            dateStr = 'Today';
          } else if (daysAgo === 1) {
            dateStr = 'Yesterday';
          } else {
            dateStr = `${daysAgo} days ago`;
          }

          // For 'Today', use the current attendance status, else map boolean
          const status = (daysAgo === 0) 
            ? c.attendance 
            : (c.attendanceHistory[i] ? 'present' : 'absent');

          // We create a unique combination of childId and date for attendance records if needed,
          // or just generate uuid. To prevent duplicates on multiple runs, we can clean first or use uuid.
          await prisma.attendance.create({
            data: {
              childId: c.id,
              status: status,
              date: dateStr,
            },
          });
        }
      }
    }
    console.log(`Seeded ${db.children.length} children, along with observations, milestones, and attendance history.`);
  }

  // 3. Seed Home Visits
  if (db.homeVisits) {
    for (const v of db.homeVisits) {
      // Find matching child to resolve childId
      let childId = null;
      if (db.children) {
        const matchingChild = db.children.find(c => c.name.toLowerCase() === v.childName.toLowerCase());
        if (matchingChild) {
          childId = matchingChild.id;
        }
      }

      await prisma.homeVisit.upsert({
        where: { id: v.id },
        update: {},
        create: {
          id: v.id,
          childId: childId,
          childName: v.childName,
          parentName: v.parentName,
          concern: v.concern,
          lastVisit: v.lastVisit,
          suggestedTopics: JSON.stringify(v.suggestedTopics || []),
          status: v.status,
        },
      });
    }
    console.log(`Seeded ${db.homeVisits.length} home visits.`);
  }

  // 4. Seed Notifications
  if (db.notifications) {
    for (const n of db.notifications) {
      await prisma.notification.upsert({
        where: { id: n.id },
        update: {},
        create: {
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          time: n.time,
          read: n.read,
          action: n.action || null,
        },
      });
    }
    console.log(`Seeded ${db.notifications.length} notifications.`);
  }

  // 5. Seed Scheduled Activities
  if (db.scheduledActivities) {
    for (const sa of db.scheduledActivities) {
      await prisma.scheduledActivity.upsert({
        where: { id: sa.id },
        update: {},
        create: {
          id: sa.id,
          activityId: sa.activityId,
          date: sa.date,
          targetChildrenIds: JSON.stringify(sa.targetChildrenIds || []),
          completed: sa.completed,
        },
      });
    }
    console.log(`Seeded ${db.scheduledActivities.length} scheduled activities.`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
