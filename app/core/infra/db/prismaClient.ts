import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import config from '../../../shared/config.js'

const adapter = new PrismaPg({ connectionString: config.dbUrl })

export const prismaClient = new PrismaClient({ adapter })
