export type FacultyResult = {
  id: string
  full_name: string
  department_name: string
  position_title: string
}

export type SlotResult = {
  id: string
  slot_date: string
  start_time: string
  end_time: string
  slot_status: 'OPEN' | 'RESERVED' | 'BOOKED' | 'CLOSED'
  mode: 'IN_PERSON' | 'ONLINE'
  location: string | null
}
