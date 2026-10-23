import { databaseTestsEnabled } from './helpers/environment'
import { cleanupE2EData } from './helpers/testDatabase'

export default async function globalTeardown() {
  if (databaseTestsEnabled()) await cleanupE2EData()
}
