export type Review = {
  name: string
  role: string
  review: string
  stars: number
}

export const reviews: Review[] = [
  {
    name: "Aisha Khan",
    role: "Learner",
    review:
      "I finished my first course in a week. The lessons are short and easy to follow.",
    stars: 5,
  },
  {
    name: "Rohan Mehta",
    role: "Instructor",
    review:
      "I published a class in an afternoon. People started learning the same day.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Learner",
    review:
      "I learn after work. Sikhao lets me pick up where I left off, without a fuss.",
    stars: 4,
  },
  {
    name: "Daniel Okonkwo",
    role: "Instructor",
    review:
      "Teaching here feels simple. I focus on the lesson, not on the tools.",
    stars: 5,
  },
  {
    name: "Meera Shah",
    role: "Learner",
    review:
      "The courses are clear. I knew what to do in the first five minutes.",
    stars: 4,
  },
  {
    name: "Luis Ortega",
    role: "Instructor",
    review:
      "I turned notes from my job into a course. Learners actually finish it.",
    stars: 5,
  },
]
