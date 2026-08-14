import {
  WebpayPlus,
  Options,
  Environment,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
} from "transbank-sdk";

// Devuelve una transacción Webpay Plus configurada.
// Por defecto usa el ambiente de INTEGRACIÓN (pruebas) de Transbank.
// Para producción define en .env.local:
//   TBK_ENVIRONMENT=production
//   TBK_COMMERCE_CODE=<tu código de comercio>
//   TBK_API_KEY=<tu api key secret>
export function getWebpayTransaction() {
  const env = (process.env.TBK_ENVIRONMENT || "integration").toLowerCase();

  if (env === "production") {
    return new WebpayPlus.Transaction(
      new Options(
        process.env.TBK_COMMERCE_CODE || "",
        process.env.TBK_API_KEY || "",
        Environment.Production
      )
    );
  }

  return new WebpayPlus.Transaction(
    new Options(
      process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
      process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
      Environment.Integration
    )
  );
}
