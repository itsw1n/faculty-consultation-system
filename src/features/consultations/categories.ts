export const categories = {
  GRADE: 'Grade concern',
  CAPSTONE: 'Capstone concern',
  ACADEMIC: 'Academic concern',
  PERSONAL: 'Personal concern',
  OTHER: 'Other',
} as const

export type ConsultationCategory = keyof typeof categories

export function categoryLabel(value: string) {
  return categories[value as ConsultationCategory] ?? value
}
