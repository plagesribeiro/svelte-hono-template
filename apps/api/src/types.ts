import { hc } from 'hono/client'
import type { ServerType } from './index'

// This code is necessary to cache the types of the server
// Without it tsc compiler get really slow
const dummyClient = hc<ServerType>('')
type Client = typeof dummyClient

export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<ServerType>(...args)
export { parseResponse } from 'hono/client'
