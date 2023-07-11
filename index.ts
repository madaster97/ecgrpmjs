import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

// functions needed for writing
// Write a new enrollment on notification
async function enroll(
  accessionNumber: string,
  patient: Prisma.PatientCreateInput,
  provider: Prisma.ProviderCreateInput
) {
  // TODO: Update patient demographics on enroll
  return prisma.enrollment.create({
    data: {
      accessionNumber,
      patient: {
        connectOrCreate: {
          where: { mrn: patient.mrn },
          create: patient,
        },
      },
      provider: {
        connectOrCreate: {
          where: { provId: provider.provId },
          create: provider,
        },
      },
    },
  });
}

// Update a Period on callback
async function setPeriodCallback(periodId: number, accessionNumber: string) {
  // TODO: Make sure Period is SUBMITTED
  // TODO: Update patient demographics on callback
  return prisma.period.update({
    where: { id: periodId },
    data: {
      accessionNumber,
    },
  });
}

// Close an erollment in app, after HTTP success
async function closeEnrollment(enrollmentId: number) {
  // TODO: Make sure it's OPEN, and has no active enrollment
  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "CLOSED",
    },
  });
}

// Create a new Period in app, before HTTP request, returns ID
async function newPeriod(enrollmentId: number) {
  // TODO: Check if enrollment has an active period already
  return prisma.period.create({
    data: {
      enrollment: {
        connect: { id: enrollmentId },
      },
      activeFor: {
        connect: { id: enrollmentId },
      },
    },
  });
}

// Close a Period in app
async function closePeriod(periodId: number) {
  // TODO: Check period is OPEN. Otherwise fail
  // Otherwise, closing SUBMITTED could cause race condition for callback?
  return prisma.period.update({
    where: { id: periodId },
    data: {
      activeFor: {
        disconnect: true,
      },
      status: "CLOSED",
    },
  });
}

// Submit a finding, before HTTP request, returns ID
async function submitFinding(periodId: number) {
  // TODO: Make sure Period is OPEN
  return prisma.finding.create({
    data: {
      period: {
        connect: { id: periodId },
      },
    },
  });
}

// functions needed for reading
// See all active enrollments, including activePeriod
// Buttons for creating period, closing period, submitting finding

// functions needed later
// See all closed enrollments
// See all closed periods for an enrollment
// See all findings for a period
// See all findings for an enrollment

// Example of normal enrollment
async function main() {
  // const enrollment = await enroll(
  //   "3",
  //   {
  //     mrn: "abc123",
  //     pidString: "TEST_DEMOS|CALLMEMAYBE",
  //   },
  //   {
  //     provId: "def456",
  //     title: "Adam Notstrickland",
  //   }
  // );
  // console.dir(enrollment, { depth: null });

  // const period = await newPeriod(4);
  // console.dir(period, { depth: null });

  const period = await closePeriod(3);
  console.dir(period, { depth: null });

  // const allEnrollments = await prisma.enrollment.findMany({
  //   include: {
  //     patient: true,
  //     provider: true,
  //   },
  // });
  // console.dir(enrollment, { depth: null });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
