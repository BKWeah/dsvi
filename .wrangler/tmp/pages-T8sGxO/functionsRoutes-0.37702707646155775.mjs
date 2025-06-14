import { onRequestOptions as __api_email_send_js_onRequestOptions } from "C:\\Users\\USER\\Desktop\\Code\\Desktop Apps\\0_Upwork\\dsvi\\functions\\api\\email\\send.js"
import { onRequestPost as __api_email_send_js_onRequestPost } from "C:\\Users\\USER\\Desktop\\Code\\Desktop Apps\\0_Upwork\\dsvi\\functions\\api\\email\\send.js"
import { onRequest as __api_brevo___path___js_onRequest } from "C:\\Users\\USER\\Desktop\\Code\\Desktop Apps\\0_Upwork\\dsvi\\functions\\api\\brevo\\[[path]].js"

export const routes = [
    {
      routePath: "/api/email/send",
      mountPath: "/api/email",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_email_send_js_onRequestOptions],
    },
  {
      routePath: "/api/email/send",
      mountPath: "/api/email",
      method: "POST",
      middlewares: [],
      modules: [__api_email_send_js_onRequestPost],
    },
  {
      routePath: "/api/brevo/:path*",
      mountPath: "/api/brevo",
      method: "",
      middlewares: [],
      modules: [__api_brevo___path___js_onRequest],
    },
  ]