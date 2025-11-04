import Link from "next/link"

interface ExamListProps {
  exams: Array<{
    id: string
    title: string
    duration: number
    _count: { questions: number }
  }>
}

export default function ExamList({ exams }: ExamListProps) {
  if (exams.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No exams available right now</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {exams.map((exam) => (
        <div key={exam.id} className="bg-card border border-border rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">{exam.title}</h3>
              <div className="flex gap-6 text-sm text-muted-foreground mb-4">
                <span>Duration: {exam.duration} minutes</span>
                <span>Questions: {exam._count.questions}</span>
              </div>
            </div>
            <Link
              href={`/student/exam/${exam.id}`}
              className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90"
            >
              Start Exam
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
