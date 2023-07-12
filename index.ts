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
  // TODO: Update patient demographics on callback
  // Make sure Period is SUBMITTED
  const period = await prisma.period.findUniqueOrThrow({
    where: { id: periodId },
    select: {
      status: true,
    },
  });
  switch (period.status) {
    case "CLOSED":
      throw new Error("Period has been closed already");
    case "OPEN":
      // Otherwise, closing SUBMITTED could cause race condition for callback
      throw new Error("Period callback has already been received");
    case "SUBMITTED":
      break;
  }
  return prisma.period.update({
    where: { id: periodId },
    data: {
      accessionNumber,
    },
  });
}

// Close an erollment in app, after HTTP success
async function closeEnrollment(enrollmentId: number) {
  // Make sure it's OPEN, and has no active period
  const period = await prisma.enrollment.findFirstOrThrow({
    where: { id: enrollmentId },
    select: {
      status: true,
    },
  });
  switch (period.status) {
    case "CLOSED":
      throw new Error("Enrollment is already closed");
    case "OPEN":
      break;
  }

  const maybePeriod = await prisma.period.findUnique({
    where: { activeForId: enrollmentId },
  });
  if (!!maybePeriod) {
    throw new Error('Enrollment has an active period, cannot be closed')
  } else {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: "CLOSED",
      },
    });
  }
}

// Create a new Period in app, before HTTP request, returns ID
async function newPeriod(enrollmentId: number) {
  // Check if enrollment has an active period already, can only have 1
  const maybePeriod = await prisma.period.findUnique({
    where: { activeForId: enrollmentId },
  });
  if (!!maybePeriod) {
    throw new Error('Enrollment has an active period, cannot be assigned another')
  } else {
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
}

// Close a Period in app
async function closePeriod(periodId: number) {
  const period = await prisma.period.findUniqueOrThrow({
    where: { id: periodId },
    select: {
      status: true,
    },
  });
  switch (period.status) {
    case "CLOSED":
      throw new Error("Period is already closed");
    case "SUBMITTED":
      // Otherwise, closing SUBMITTED could cause race condition for callback
      throw new Error("Period callback has not been received");
    case "OPEN":
      break;
  }
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
  const period = await prisma.period.findFirstOrThrow({
    where: { id: periodId },
    select: {
      status: true,
    },
  });
  switch (period.status) {
    case "CLOSED":
      throw new Error("Period is closed");
    case "SUBMITTED":
      // Otherwise, EHR can't accept
      throw new Error("Period callback has not been received");
    case "OPEN":
      break;
  }
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
