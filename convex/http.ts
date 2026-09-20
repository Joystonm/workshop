// Static site hosting is provided by the @convex-dev/static-hosting
// component (configured in convex/convex.config.ts). This file wires
// its routes onto the app's HTTP router; everything else — SPA
// fallback, content-hashed cache headers, base64 chunked uploads —
// is handled by the component.

import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { components } from "./_generated/api";

const http = httpRouter();
registerStaticRoutes(http, components.staticHosting);

export default http;