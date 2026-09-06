export interface TaxSplitResult {
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
  isInterstate: boolean;
}

export function calculateGstTaxSplit(
  items: { unitPrice: number; quantity: number; gstRate: number }[],
  supplierStateCode: string,
  placeOfSupplyStateCode: string
): TaxSplitResult {
  const isInterstate = supplierStateCode !== placeOfSupplyStateCode;
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  items.forEach((item) => {
    const lineSubtotal = item.unitPrice * item.quantity;
    subtotal += lineSubtotal;

    const lineTax = (lineSubtotal * item.gstRate) / 100;
    if (isInterstate) {
      igstTotal += lineTax;
    } else {
      cgstTotal += lineTax / 2;
      sgstTotal += lineTax / 2;
    }
  });

  const taxTotal = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = subtotal + taxTotal;

  const roundedSubtotal = Number(subtotal.toFixed(2));
  const roundedCgst = Number(cgstTotal.toFixed(2));
  const roundedSgst = Number(sgstTotal.toFixed(2));
  const roundedIgst = Number(igstTotal.toFixed(2));
  const roundedTaxTotal = Number((roundedCgst + roundedSgst + roundedIgst).toFixed(2));
  const roundedGrandTotal = Number((roundedSubtotal + roundedTaxTotal).toFixed(2));

  return {
    subtotal: roundedSubtotal,
    cgstTotal: roundedCgst,
    sgstTotal: roundedSgst,
    igstTotal: roundedIgst,
    taxTotal: roundedTaxTotal,
    grandTotal: roundedGrandTotal,
    isInterstate,
  };
}
