export default async (request: Request, context: any) => {
  const { url } = request;

  return context.rewrite(`${url}?rewrite`);
};
