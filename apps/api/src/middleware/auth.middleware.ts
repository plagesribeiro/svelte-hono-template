import { HonoRequest } from 'hono'
import { createMiddleware } from 'hono/factory'

type UserDataContext = {
    clerkUserId: string
    clerkOrgId: string
    clerkRole: string
}

declare module 'hono' {
    interface ContextVariableMap {
        userData: UserDataContext
    }
}

export const validateApiKey = ({ env, req }:{
    env: Cloudflare.Env,
    req: HonoRequest
}): UserDataContext | null => {    
    if(req.header('Authorization')?.split(' ')[1] !== env.INTERNAL_ADMIN_API_KEY) {
       return null
    }

   return {
    clerkUserId: 'admin',
    clerkOrgId: 'admin',
    clerkRole: 'admin'
   } as UserDataContext
}

export function authMiddleware() {
    return createMiddleware<{ Bindings: CloudflareBindings }>(async (c, next) => {
        const auth = c.var.clerkAuth()

        const clerkUserId = auth?.userId
        const userClerkOrganizationId = auth?.orgId
        const userClerkRole = auth?.orgRole

       if(!clerkUserId || !userClerkOrganizationId || !userClerkRole) {

        const apiKeyData = validateApiKey({ env: c.env, req: c.req })
        if(apiKeyData) {
            c.set('userData', apiKeyData)
            return await next()
        }

        throw new Error('User not authenticated')
       }

        c.set('userData', {
            clerkUserId,
            clerkOrgId: userClerkOrganizationId,
            clerkRole: userClerkRole
        })

        await next()
    })
}
