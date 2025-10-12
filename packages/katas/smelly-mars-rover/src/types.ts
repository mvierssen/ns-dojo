import type { z } from "zod";

import type { HeadingSchema, CommandSchema } from "./schemas.js";

export type Heading = z.infer<typeof HeadingSchema>;
export type Command = z.infer<typeof CommandSchema>;
