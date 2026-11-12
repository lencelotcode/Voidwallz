import { assertOrigin, clientKey, errorResponse, json } from './security';
export interface RequestContext {
  requestId: string;
  client: string;
}
/** All API entrypoints use the same method, origin, identity, and error boundary. */
export function createEndpoint(
  methods: string[],
  handle: (request: Request, context: RequestContext) => Promise<Response>,
) {
  return async (request: Request) => {
    const requestId = crypto.randomUUID();
    try {
      if (!methods.includes(request.method))
        return json({ error: 'Method not allowed.' }, 405, { Allow: methods.join(', ') });
      assertOrigin(request);
      const client = await clientKey(request);
      return await handle(request, { requestId, client });
    } catch (error) {
      return errorResponse(error, requestId);
    }
  };
}
