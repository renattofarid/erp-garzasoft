import { ContractType, FormaPago } from "./contract.interface";
import { Cloud, HandCoins, Laptop, ServerCog, WalletCards } from "lucide-react";

export function castPaymentType(type: FormaPago) {
  switch (type) {
    case "unico":
      return "Pago Único";
    case "parcial":
      return "Pago Parcial";
    default:
      return type;
  }
}

export function getIconByPaymentType(type: FormaPago) {
  switch (type) {
    case "unico":
      return HandCoins;
    case "parcial":
      return WalletCards;
    default:
      return null;
  }
}

export function castContractType(type: ContractType) {
  switch (type) {
    case "desarrollo":
      return "Desarrollo";
    case "saas":
      return "SaaS";
    case "soporte":
      return "Soporte";
    default:
      return type;
  }
}

export function getIconByContractType(type: ContractType) {
  switch (type) {
    case "desarrollo":
      return Laptop;
    case "saas":
      return Cloud;
    case "soporte":
      return ServerCog;
    default:
      return null;
  }
}
