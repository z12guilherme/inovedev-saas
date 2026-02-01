import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function generateWhatsAppMessage(
  items: { product: { name: string; price: number }; quantity: number }[],
  total: number,
  deliveryFee: number,
  customerInfo: {
    name: string;
    address: string;
    neighborhood: string;
    city: string;
    complement?: string;
    reference?: string;
  },
  paymentMethod: string
): string {
  const itemsList = items
    .map(item => `• ${item.quantity}x ${item.product.name} - ${formatCurrency(item.product.price * item.quantity)}`)
    .join('\n');

  const message = `🛒 *Novo Pedido*\n\n` +
    `*Cliente:* ${customerInfo.name}\n\n` +
    `*Endereço de Entrega:*\n` +
    `${customerInfo.address}\n` +
    `${customerInfo.neighborhood} - ${customerInfo.city}\n` +
    `${customerInfo.complement ? `Complemento: ${customerInfo.complement}\n` : ''}` +
    `${customerInfo.reference ? `Referência: ${customerInfo.reference}\n` : ''}\n` +
    `*Itens do Pedido:*\n${itemsList}\n\n` +
    `*Subtotal:* ${formatCurrency(total)}\n` +
    `*Taxa de Entrega:* ${formatCurrency(deliveryFee)}\n` +
    `*Total:* ${formatCurrency(total + deliveryFee)}\n\n` +
    `*Forma de Pagamento:* ${paymentMethod}`;

  return encodeURIComponent(message);
}
