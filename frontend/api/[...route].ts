import { handle } from 'hono/vercel';
import honoApp from '@note-taking/backend';

export const config = {
  runtime: 'nodejs',
};

export default handle(honoApp);
