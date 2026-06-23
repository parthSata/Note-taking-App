import { handle } from 'hono/vercel';
import honoApp from '@note-taking/backend';

export default handle(honoApp);
