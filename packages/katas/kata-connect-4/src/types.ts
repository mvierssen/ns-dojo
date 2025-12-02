import type { z } from "zod";

import type { BoardSchema } from "./schemas.js";

export type Board = z.infer<typeof BoardSchema>;
