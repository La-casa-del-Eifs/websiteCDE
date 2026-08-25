import {
  WebpayPlus,
  Options,
  Environment,
  IntegrationCommerceCodes,
  IntegrationApiKeys,
} from "transbank-sdk";

// Lee una variable de entorno y le quita espacios/saltos de línea.
// (Al pegar credenciales en Vercel es muy fácil dejar un espacio invisible,
// y eso hace fallar el pago.)
function env(name: string): string {
  return (process.env[name] || "").trim();
}

function isProduction(): boolean {
  return env("TBK_ENVIRONMENT").toLowerCase() === "production";
}

// Resumen SEGURO de la configuración (NO expone la llave secreta),
// solo para diagnóstico en los logs.
export function webpayConfigSummary() {
  const prod = isProduction();
  return {
    environment: prod ? "production" : "integration",
    commerceCode: prod
      ? env("TBK_COMMERCE_CODE") || "(vacío)"
      : env("TBK_COMMERCE_CODE") || IntegrationCommerceCodes.WEBPAY_PLUS,
    hasApiKey: prod ? env("TBK_API_KEY").length > 0 : true,
  };
}

// Devuelve una transacción Webpay Plus configurada.
// Por defecto usa el ambiente de INTEGRACIÓN (pruebas) de Transbank.
// Para producción define en las variables de entorno:
//   TBK_ENVIRONMENT=production
//   TBK_COMMERCE_CODE=<tu código de comercio>
//   TBK_API_KEY=<tu api key secret>
export function getWebpayTransaction() {
  if (isProduction()) {
    return new WebpayPlus.Transaction(
      new Options(
        env("TBK_COMMERCE_CODE"),
        env("TBK_API_KEY"),
        Environment.Production
      )
    );
  }

  return new WebpayPlus.Transaction(
    new Options(
      env("TBK_COMMERCE_CODE") || IntegrationCommerceCodes.WEBPAY_PLUS,
      env("TBK_API_KEY") || IntegrationApiKeys.WEBPAY,
      Environment.Integration
    )
  );
}
