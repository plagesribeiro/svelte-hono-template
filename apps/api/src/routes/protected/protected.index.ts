import { OpenAPIHono } from "@hono/zod-openapi";
import { GetProtectedRoute } from "./protected.route";

export const protectedRoutes = new OpenAPIHono()
    .openapi(GetProtectedRoute, async (c) => {
        const { param_1 } = c.req.valid('query')

        return c.json({
            message: 'Hello, world! Here is your param: ' + param_1,
            success: true,
        })
    })