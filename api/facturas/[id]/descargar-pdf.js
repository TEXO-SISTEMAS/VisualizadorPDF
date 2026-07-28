export default async function handler(req, res) {
  const { id } = req.query;
  res.redirect(302, `/api/facturas/${id}?print=1`);
}
