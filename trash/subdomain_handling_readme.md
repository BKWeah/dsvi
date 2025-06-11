# Advanced Subdomain Handling Workaround (Using a Free Cloudflare Worker)

If you need to stay on the free plan, you can achieve the same result using a Cloudflare Worker as a proxy. This is more complex but very powerful.

## Concept:

You create a simple Worker that runs on a wildcard route (`*.libdsvi.com`). This Worker will intercept all requests to any subdomain and then fetch the content from your main Cloudflare Pages site (your-project.pages.dev), effectively serving your Pages app on all subdomains.

## Steps:

1.  **Keep the `libdsvi.com` custom domain on your Pages project.** Make sure the main domain works.

2.  **Go to DNS: Manually add a placeholder A record for the wildcard.** This is just to make the route active for the Worker.
    *   **Type:** `A`
    *   **Name:** `*`
    *   **IPv4 address:** `192.0.2.1` (This is a "dummy" IP address, it won't be used).
    *   **Proxy status:** `Proxied` (Orange cloud). This is essential.

3.  **Create a Worker:**
    *   Go to `Workers & Pages` -> `Create application` -> `Create Worker`.
    *   Give it a name (e.g., `subdomain-handler`).
    *   Use the following code for your worker:

    ```javascript
    export default {
      async fetch(request, env, ctx) {
        // This is your main Cloudflare Pages URL.
        // Find it in your Pages project overview. It ends in .pages.dev
        const pagesUrl = 'https://libdsvi.pages.dev';

        // Get the original URL from the request
        const url = new URL(request.url);

        // Fetch the same path from your Pages deployment
        const newRequest = new Request(`${pagesUrl}${url.pathname}`, request);

        // Return the response from your Pages site
        return fetch(newRequest);
      },
    };
    ```
    *   **Replace `https://libdsvi.pages.dev` with your actual Pages project URL.**
    *   Deploy the worker.

4.  **Add a Route to the Worker:**
    *   In your Worker's settings, go to the `Triggers` tab.
    *   Under `Routes`, click `Add route`.
    *   **Route:** `*.libdsvi.com/*`
    *   **Zone:** `libdsvi.com`
    *   Click `Add route`.

Now, the Worker will handle all subdomain requests and serve your Pages site, achieving your goal on the free plan.
