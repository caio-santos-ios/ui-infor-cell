import { formattedMoney, maskDate } from "@/utils/mask.util";

export const SalesOrderReceiptPrint = ({ data }: any) => {
  if (!data) return null;

  return (
    <div className="print-only p-4 text-[12px] font-mono leading-tight w-[80mm]">
      <div className="text-center border-b border-dashed pb-2 mb-2">
        <h2 className="font-bold text-sm uppercase">{data.storeName}</h2>
        {
          data.storeDocument &&
          <p>{data.storeDocument}</p>
        }
        {
          data.storePhone &&
          <p>Tel: {data.storePhone}</p>
        }
      </div>

      <div className="border-b border-dashed pb-2 mb-2">
        <p>PEDIDO: {data.code}</p>
        <p>DATA: {maskDate(data.createdAt)}</p>
        <p>CLIENTE: {data.customerName || "Consumidor Final"}</p>
      </div>

      <table className="w-full mb-2">
        <thead>
          <tr className="border-b border-dashed text-left">
            <th>Produto</th>
            <th className="text-right">Qtd</th>
            <th className="text-right">Valor</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">{formattedMoney(item.value)}</td>
              <td className="text-right">{formattedMoney(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed pt-2">
        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>{formattedMoney(data.total)}</span>
        </div>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-dashed">
        <p>Obrigado pela preferência!</p>
      </div>
    </div>
  );
};