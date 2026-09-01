import { productsModuleSchema } from "../data/module.schema";

export function getProductIdentifier(product = {}) {
  return product?.product_id || product?.id;
}

export function normalizeProductData(product = {}) {
  return {
    ...productsModuleSchema.form.initialValues,
    ...product
  };
}

export function normalizeProductSavePayload(formData = {}) {
  const payload = {
    product_name: formData.product_name,
    product_code: formData.product_code || null,
    product_type: formData.product_type || null,
    brand: formData.brand || null,
    unit: formData.unit || null,
    standard_rate: formData.standard_rate || null,
    gst_rate: formData.gst_rate || null,
    weight: formData.weight || null,
    ready_stock: formData.ready_stock || null,
    product_description: formData.product_description || null,
    fg_code: formData.fg_code || null,
    status: formData.status || null,
  };

  if (formData.product_id) payload.product_id = formData.product_id;

  return payload;
}
