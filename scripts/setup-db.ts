import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Setting up database...")

  const hashedPassword = await hash("liqaprepadmin@123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "liqaprep@gmail.com" },
    update: {},
    create: {
      name: "Default Admin",
      email: "liqaprep@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  console.log("Created admin:", admin)

  // Create a sample exam
  const exam = await prisma.exam.create({
    data: {
      title: "Sample Math Exam",
      duration: 30,
      canStart: true,
    },
  })

  console.log("Created exam:", exam)

  // Create passages
  const passage = await prisma.passage.create({
    data: {
      examId: exam.id,
      content: "A passage about mathematics and problem-solving techniques used in modern education.",
    },
  })

  // Create questions
  await prisma.question.createMany({
    data: [
      {
        examId: exam.id,
        passageId: passage.id,
        questionText: "What is 2 + 2?",
        optionA: "3",
        optionB: "4",
        optionC: "5",
        optionD: "6",
        correctAnswer: "B",
        orderIndex: 0,
      },
      {
        examId: exam.id,
        passageId: passage.id,
        questionText: "What is 5 * 3?",
        optionA: "10",
        optionB: "12",
        optionC: "15",
        optionD: "20",
        correctAnswer: "C",
        orderIndex: 1,
      },
      {
        examId: exam.id,
        questionText: "What is the capital of France?",
        optionA: "London",
        optionB: "Berlin",
        optionC: "Paris",
        optionD: "Madrid",
        correctAnswer: "C",
        orderIndex: 2,
      },
    ],
  })

  console.log("Database setup complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
