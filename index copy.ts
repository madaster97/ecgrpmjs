// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   // ... you will write your Prisma Client queries here
//   //   const allEnrollments = await prisma.enrollments.findMany();
//   //   console.log(allEnrollments)
//   //   Create a new enrollment with this data
//   // Patient: mrn=abc123, pid_string=test_demos
//   // Provider: provid=def456, name=adam notstrickland
//   // Enrollment:
//   // For the patient and providers, do a create or find?
//   // What about changes to providers or patients on an order? Weird
//   // Basically, don't update if the order already exists. Should index accession_id

//   await prisma.enrollments.create({
//     data: {
//       status: "open",
//       accession_number: 520,
//     },
//   });

//   const allUsers = await prisma.user.findMany({
//     include: {
//       posts: true,

//       profile: true,
//     },
//   });

//   console.dir(allUsers, { depth: null });
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })

//   .catch(async (e) => {
//     console.error(e);

//     await prisma.$disconnect();

//     process.exit(1);
//   });
