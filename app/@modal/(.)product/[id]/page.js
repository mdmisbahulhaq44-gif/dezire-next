import ProductView from "../../../../components/ProductView"

// Opening a product from inside the app shows it as a panel OVER the page
// you were on (like the original site), instead of replacing that page.
export default async function InterceptedProduct({ params }) {
  const { id } = await params
  return <ProductView id={id} />
}
