import { GenericContainer } from 'testcontainers'
import { execSync } from 'node:child_process'
import path from 'node:path'

let container
let started = false

export async function startTestDb() {
  if (started) return
  container = await new GenericContainer('mariadb:11')
    .withEnv('MARIADB_ROOT_PASSWORD', 'root')
    .withEnv('MARIADB_DATABASE', 'app_db')
    .withExposedPorts(3306)
    .start()

  const port = container.getMappedPort(3306)
  process.env.DATABASE_URL = `mysql://root:root@127.0.0.1:${port}/app_db`

  // Run migrations
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.resolve('apps/api') })
  execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: path.resolve('apps/api') })

  started = true
}

export async function stopTestDb() {
  if (container) {
    await container.stop()
    container = undefined
    started = false
  }
}
