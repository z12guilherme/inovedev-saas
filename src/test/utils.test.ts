import { describe, it, expect } from "vitest";
import { formatCurrency, formatPhone, generateWhatsAppMessage } from "../lib/utils";

describe("utils functions", () => {
  describe("formatCurrency", () => {
    it("should format positive numbers to BRL currency", () => {
      // In Node/Vitest, non-breaking spaces \u00a0 might be used by Intl.NumberFormat
      const formatted = formatCurrency(1234.56).replace(/\u00a0/g, ' ');
      // Handle variations in Node's Intl implementation where space may be omitted
      expect(formatted).toMatch(/R\$\s?1\.234,56/);
    });

    it("should format zero to BRL currency", () => {
      const formatted = formatCurrency(0).replace(/\u00a0/g, ' ');
      expect(formatted).toMatch(/R\$\s?0,00/);
    });
  });

  describe("formatPhone", () => {
    it("should format valid 11-digit phone numbers", () => {
      expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    });

    it("should return the original string if it doesn't match 11 digits", () => {
      expect(formatPhone("1234")).toBe("1234");
    });

    it("should strip non-digits before formatting", () => {
      expect(formatPhone("(11) 98765-4321")).toBe("(11) 98765-4321");
      expect(formatPhone("11.98765-4321")).toBe("(11) 98765-4321");
    });
  });

  describe("generateWhatsAppMessage", () => {
    it("should generate a properly encoded WhatsApp message string", () => {
      const items = [
        { product: { name: "Pizza", price: 50 }, quantity: 2 },
        { product: { name: "Refrigerante", price: 10 }, quantity: 1 }
      ];
      
      const total = 110;
      const deliveryFee = 5;
      
      const customerInfo = {
        name: "João Silva",
        address: "Rua A, 123",
        neighborhood: "Centro",
        city: "São Paulo"
      };

      const encodedMsg = generateWhatsAppMessage(items, total, deliveryFee, customerInfo, "Pix");
      
      // Decode for testing the exact text content
      const decodedMsg = decodeURIComponent(encodedMsg);

      expect(decodedMsg).toContain("João Silva");
      expect(decodedMsg).toContain("Rua A, 123");
      expect(decodedMsg).toContain("2x Pizza");
      expect(decodedMsg).toContain("1x Refrigerante");
      expect(decodedMsg).toContain("Pix");
    });
  });
});
